// managers/deckManager.ts
import { Card } from '../.expo/types/card';

export class DeckManager {
  private deck: Card[] = [];
  private discardPile: Card[] = [];

  constructor(cards: Card[]) {
    this.deck = [...cards];
    this.shuffleDeck();
  }

  shuffleDeck() {
    this.deck.sort(() => Math.random() - 0.5);
  }

  drawCards(count: number): Card[] {
    const drawnCards = this.deck.splice(0, count);
    return drawnCards;
  }

  discardCards(cards: Card[]) {
    this.discardPile.push(...cards);
  }

  resetDeck(newDeck?: Card[]) {
    if (newDeck) {
      this.deck = [...newDeck];
    } else {
      this.deck = [...this.deck, ...this.discardPile];
    }
    this.discardPile = [];
    this.shuffleDeck();
  }

  // Add this method to retrieve the current deck
  getDeck(): Card[] {
    return [...this.deck];
  }
}