-- 40_bets.sql - Bet module schema, policies, and RPCs
-- Note: Run in a Supabase/Postgres environment with uuid-ossp or pgcrypto for gen_random_uuid

-- Enable extension if needed
create
extension if not exists pgcrypto;

-- Profiles augmentation: admin flag
alter table if exists public.profiles
    add column if not exists is_admin boolean default false;

-- =============================
-- Tables
-- =============================

create table if not exists public.bets
(
    id
    uuid
    primary
    key
    default
    gen_random_uuid
(
),
    created_by uuid not null references public.profiles
(
    id
) on delete restrict,
    title text not null,
    description text,
    stake_per_player integer not null check
(
    stake_per_player
    >=
    1
),
    status text not null default 'draft' check
(
    status
    in
(
    'draft',
    'open',
    'locked',
    'settled',
    'canceled'
)),
    auto_lock_at timestamptz,
    settled_at timestamptz,
    settled_by uuid references public.profiles
(
    id
)
  on delete set null,
    created_at timestamptz not null default now
(
),
    updated_at timestamptz not null default now
(
)
    );

create table if not exists public.bet_options
(
    id
    uuid
    primary
    key
    default
    gen_random_uuid
(
),
    bet_id uuid not null references public.bets
(
    id
) on delete cascade,
    label text not null,
    sort_order int not null default 0,
    is_winning boolean not null default false
    );

create table if not exists public.bet_participants
(
    bet_id
    uuid
    not
    null
    references
    public
    .
    bets
(
    id
) on delete cascade,
    user_id uuid not null references public.profiles
(
    id
)
  on delete cascade,
    option_id uuid not null references public.bet_options
(
    id
)
  on delete restrict,
    joined_at timestamptz not null default now
(
),
    left_at timestamptz,
    primary key
(
    bet_id,
    user_id
)
    );

-- One active participation per user per bet
create unique index if not exists bet_participants_active_uniq
    on public.bet_participants(bet_id, user_id)
    where left_at is null;

create table if not exists public.wallet_transactions
(
    id
    uuid
    primary
    key
    default
    gen_random_uuid
(
),
    user_id uuid not null references public.profiles
(
    id
) on delete cascade,
    bet_id uuid references public.bets
(
    id
)
  on delete set null,
    kind text not null check
(
    kind
    in
(
    'debit_join',
    'credit_refund',
    'credit_payout'
)),
    amount integer not null check
(
    amount >
    0
),
    balance_after integer,
    meta jsonb not null default '{}',
    created_at timestamptz not null default now
(
)
    );

-- Indexes
create index if not exists bets_status_lock_idx on public.bets(status, auto_lock_at);
create index if not exists bet_participants_bet_idx on public.bet_participants(bet_id);
create index if not exists wallet_tx_user_idx on public.wallet_transactions(user_id, created_at desc);

-- Updated_at trigger
create
or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at
= now();
return new;
end; $$;

create trigger set_bets_updated_at
    before update
    on public.bets
    for each row execute procedure public.set_updated_at();

-- =============================
-- RLS Policies
-- =============================

alter table public.bets enable row level security;
alter table public.bet_options enable row level security;
alter table public.bet_participants enable row level security;
alter table public.wallet_transactions enable row level security;

-- Helper: check if current user is admin
create
or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
select coalesce((select is_admin from public.profiles p where p.id = uid), false)
           $$;

-- Disallow direct insert/update/delete on wallet_transactions; only via RPC SECURITY DEFINER
revoke insert, update, delete on public.wallet_transactions from anon, authenticated;

-- =============================
-- RPC functions (transactional)
-- =============================

CREATE OR REPLACE FUNCTION public.insert_bet(
  p_created_by uuid,
  p_title text,
  p_description text,
  p_stake_per_player numeric,
  p_auto_lock_at timestamptz
) RETURNS public.bets AS $$
DECLARE
v_bet public.bets%ROWTYPE;
BEGIN
INSERT INTO public.bets(
    created_by, title, description, stake_per_player, status, auto_lock_at
)
VALUES (
           p_created_by, p_title, p_description, p_stake_per_player, 'draft', p_auto_lock_at
       )
    RETURNING * INTO v_bet;

RETURN v_bet;
END;
$$ LANGUAGE plpgsql;

-- update_bet (permits status change except settling/cancel via other RPCs)
create
or replace function public.update_bet(
  p_bet_id uuid,
  p_title text default null,
  p_description text default null,
  p_stake_per_player integer default null,
  p_status text default null,
  p_auto_lock_at timestamptz default null
) returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
v_bet public.bets;
  v_is_owner
boolean;
begin
select b.*, (b.created_by = auth.uid()) as is_owner
into v_bet
from public.bets b
where b.id = p_bet_id for update;

if
not found then
    raise exception 'bet not found';
end if;

  v_is_owner
:= (v_bet.created_by = auth.uid());
  if
not (v_is_owner or public.is_admin(auth.uid())) then
    raise exception 'not allowed';
end if;

  if
v_bet.status not in ('draft','open','locked') then
    raise exception 'bet not editable in current status';
end if;

update public.bets b
set title            = coalesce(p_title, b.title),
    description      = coalesce(p_description, b.description),
    stake_per_player = coalesce(p_stake_per_player, b.stake_per_player),
    status           = coalesce(p_status, b.status),
    auto_lock_at     = p_auto_lock_at
where b.id = p_bet_id returning *
into v_bet;

return v_bet;
end; $$;

-- join_bet: debits coins, creates participant, logs wallet_tx
create
or replace function public.join_bet(
  p_bet_id uuid,
  p_option_id uuid,
  p_user_id uuid
) returns table(participant public.bet_participants, balance_after int)
language plpgsql
security definer
set search_path = public
as $$
declare
v_bet public.bets;
  v_profile
record;
  v_part
public.bet_participants;
  v_balance
int;
  v_stake
int;
  v_now
timestamptz := now();
begin
  if
auth.uid() <> p_user_id then
    raise exception 'cannot join as another user';
end if;

select *
into v_bet
from public.bets
where id = p_bet_id for update;
if
not found then raise exception 'bet not found';
end if;
  if
v_bet.status <> 'open' then raise exception 'bet not open';
end if;
  if
v_bet.auto_lock_at is not null and v_now >= v_bet.auto_lock_at then
    raise exception 'bet locked';
end if;

  v_stake
:= v_bet.stake_per_player;

  -- ensure option belongs to bet
  if
not exists(select 1 from public.bet_options o where o.id = p_option_id and o.bet_id = p_bet_id) then
    raise exception 'invalid option';
end if;

  -- already joined?
  if
exists(select 1 from public.bet_participants bp where bp.bet_id = p_bet_id and bp.user_id = p_user_id and bp.left_at is null) then
    raise exception 'already joined';
end if;

  -- get profile and lock
select id, coins
into v_profile
from public.profiles
where id = p_user_id for update;
if
not found then raise exception 'profile not found';
end if;
  if
coalesce(v_profile.coins,0) < v_stake then raise exception 'insufficient coins';
end if;

  -- debit
update public.profiles
set coins = coins - v_stake
where id = p_user_id returning coins
into v_balance;
insert into public.wallet_transactions(user_id, bet_id, kind, amount, balance_after, meta)
values (p_user_id, p_bet_id, 'debit_join', v_stake, v_balance, jsonb_build_object('option_id', p_option_id));

-- participant
insert into public.bet_participants(bet_id, user_id, option_id, joined_at)
values (p_bet_id, p_user_id, p_option_id, v_now) returning *
into v_part;

participant
:= v_part;
  balance_after
:= v_balance;
  return
next;
end; $$;

-- leave_bet: mark left, refund if open
create
or replace function public.leave_bet(
  p_bet_id uuid,
  p_user_id uuid
) returns table(participant public.bet_participants, balance_after int)
language plpgsql
security definer
set search_path = public
as $$
declare
v_bet public.bets;
  v_part
public.bet_participants;
  v_balance
int;
  v_stake
int;
  v_now
timestamptz := now();
begin
  if
auth.uid() <> p_user_id then
    raise exception 'cannot leave as another user';
end if;

select *
into v_bet
from public.bets
where id = p_bet_id for update;
if
not found then raise exception 'bet not found';
end if;

select *
into v_part
from public.bet_participants
where bet_id = p_bet_id
  and user_id = p_user_id
  and left_at is null for update;
if
not found then raise exception 'not participating';
end if;

update public.bet_participants
set left_at = v_now
where bet_id = p_bet_id
  and user_id = p_user_id returning *
into v_part;

if
v_bet.status = 'open' and (v_bet.auto_lock_at is null or v_now < v_bet.auto_lock_at) then
    v_stake := v_bet.stake_per_player;
update public.profiles
set coins = coins + v_stake
where id = p_user_id returning coins
into v_balance;
insert into public.wallet_transactions(user_id, bet_id, kind, amount, balance_after, meta)
values (p_user_id, p_bet_id, 'credit_refund', v_stake, v_balance, jsonb_build_object('reason', 'leave'));
else
select coins
into v_balance
from public.profiles
where id = p_user_id;
end if;

  participant
:= v_part;
  balance_after
:= v_balance;
  return
next;
end; $$;

-- settle_bet: set winner, split pot among winners, credit payouts
create
or replace function public.settle_bet(
  p_bet_id uuid,
  p_winning_option_id uuid,
  p_settled_by uuid
) returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
v_bet public.bets;
  v_now
timestamptz := now();
  v_total_players
int;
  v_pot
int;
  v_winners
int;
  v_base
int;
  v_remainder
int;
  r
record;
  i
int := 0;
begin
  if
not (auth.uid() = p_settled_by or public.is_admin(auth.uid())) then
    raise exception 'not allowed';
end if;

select *
into v_bet
from public.bets
where id = p_bet_id for update;
if
not found then raise exception 'bet not found';
end if;
  if
v_bet.status not in ('open','locked') then raise exception 'cannot settle now';
end if;

  -- Mark winning option
update public.bet_options
set is_winning = (id = p_winning_option_id)
where bet_id = p_bet_id;

-- Compute pot from active participants
select count(*)
into v_total_players
from public.bet_participants
where bet_id = p_bet_id
  and left_at is null;
v_pot
:= v_total_players * v_bet.stake_per_player;

  -- Winners ordered by joined_at for remainder distribution
  v_winners
:= 0;
for r in
select user_id, joined_at
from public.bet_participants
where bet_id = p_bet_id
  and left_at is null
  and option_id = p_winning_option_id
order by joined_at asc loop
    v_winners := v_winners + 1;
end loop;

  if
v_winners = 0 then
    -- No winners: pot burned (house keeps). Just finalize bet
update public.bets
set status     = 'settled',
    settled_at = v_now,
    settled_by = p_settled_by
where id = p_bet_id returning *
into v_bet;
return v_bet;
end if;

  v_base
:= floor(v_pot / v_winners);
  v_remainder
:= mod(v_pot, v_winners);

  i
:= 0;
for r in
select user_id, joined_at
from public.bet_participants
where bet_id = p_bet_id
  and left_at is null
  and option_id = p_winning_option_id
order by joined_at asc loop
    i := i + 1;
-- remainder to earliest joiners
perform
1;
update public.profiles
set coins = coins + (v_base + case when i <= v_remainder then 1 else 0 end)
where id = r.user_id;

insert into public.wallet_transactions(user_id, bet_id, kind, amount, balance_after, meta)
select p.id,
       p_bet_id,
       'credit_payout',
       (v_base + case when i <= v_remainder then 1 else 0 end),
       p.coins,
       jsonb_build_object('winning_option_id', p_winning_option_id)
from public.profiles p
where p.id = r.user_id;
end loop;

update public.bets
set status     = 'settled',
    settled_at = v_now,
    settled_by = p_settled_by
where id = p_bet_id returning *
into v_bet;
return v_bet;
end; $$;

-- cancel_bet: refund all active participants
create
or replace function public.cancel_bet(
  p_bet_id uuid,
  p_canceled_by uuid
) returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
v_bet public.bets;
  v_now
timestamptz := now();
  r
record;
  v_stake
int;
begin
  if
not (auth.uid() = p_canceled_by or public.is_admin(auth.uid())) then
    raise exception 'not allowed';
end if;

select *
into v_bet
from public.bets
where id = p_bet_id for update;
if
not found then raise exception 'bet not found';
end if;
  if
v_bet.status in ('settled','canceled') then raise exception 'already finalized';
end if;

  v_stake
:= v_bet.stake_per_player;

for r in
select user_id
from public.bet_participants
where bet_id = p_bet_id
  and left_at is null loop
update public.profiles
set coins = coins + v_stake
where id = r.user_id;
insert into public.wallet_transactions(user_id, bet_id, kind, amount, balance_after, meta)
select p.id, p_bet_id, 'credit_refund', v_stake, p.coins, jsonb_build_object('reason', 'cancel')
from public.profiles p
where p.id = r.user_id;
end loop;

update public.bets
set status     = 'canceled',
    settled_at = v_now,
    settled_by = p_canceled_by
where id = p_bet_id returning *
into v_bet;
return v_bet;
end; $$;
