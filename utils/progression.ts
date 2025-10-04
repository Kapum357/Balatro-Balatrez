import { GAME_CONSTANTS, BLIND_ORDER, BlindType } from '@/constants/GameConstants';

export function getBlindTarget(ante: number, blind: BlindType): number {
  const { BASE_TARGET_CHIPS, ANTE_SCALE, BLIND_MULTIPLIERS, MAX_SAFE_TARGET } = GAME_CONSTANTS;
  // scaling = base * (scale^(ante-1)) * blindMult
  const scalePow = Math.pow(ANTE_SCALE, Math.max(0, ante - 1));
  const raw = BASE_TARGET_CHIPS * scalePow * BLIND_MULTIPLIERS[blind];
  if (!Number.isFinite(raw) || Number.isNaN(raw) || raw > MAX_SAFE_TARGET) {
    return Infinity;
  }
  return Math.ceil(raw);
}

export function isOverflowTarget(target: number): boolean {
  return !Number.isFinite(target) || Number.isNaN(target);
}

export function nextBlind(current: BlindType): BlindType | null {
  const idx = BLIND_ORDER.indexOf(current);
  if (idx < 0) return 'small';
  return BLIND_ORDER[idx + 1] ?? null;
}

export function firstBlind(): BlindType { return 'small'; }
