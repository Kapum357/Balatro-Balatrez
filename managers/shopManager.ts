// managers/shopManager.ts
import {Enhancement, Joker, TarotCard} from '@/.expo/types/specialCards';

export class ShopManager {
    private jokers: Joker[] = [];
    private tarotCards: TarotCard[] = [];
    private enhancements: Enhancement[] = [];
    private chips: number = 0;

    constructor(initialChips: number = 0) {
        this.chips = initialChips;
        this.refreshShop();
    }

    refreshShop() {
        // Generar nuevas ofertas aleatorias
        this.generateJokers();
        this.generateTarotCards();
        this.generateEnhancements();
    }

    buyJoker(jokerId: string): Joker | null {
        const joker = this.jokers.find(j => j.id === jokerId);
        if (joker && this.chips >= joker.cost) {
            this.chips -= joker.cost;
            this.jokers = this.jokers.filter(j => j.id !== jokerId);
            return joker;
        }
        return null;
    }

    buyTarotCard(cardId: string): TarotCard | null {
        const card = this.tarotCards.find(c => c.id === cardId);
        if (card && this.chips >= card.cost) {
            this.chips -= card.cost;
            this.tarotCards = this.tarotCards.filter(c => c.id !== cardId);
            return card;
        }
        return null;
    }

    getAvailableItems() {
        return {
            jokers: this.jokers,
            tarotCards: this.tarotCards,
            enhancements: this.enhancements,
            chips: this.chips
        };
    }

    private generateJokers() {
        // Ejemplo de generación de comodines
        this.jokers = [
            {
                id: '1',
                name: 'Joker Básico',
                effect: 'Multiplica x2 la puntuación final',
                cost: 100,
                multiplier: 2
            },
            // Más comodines...
        ];
    }

    private generateTarotCards() {
        // Ejemplo de generación de cartas del Tarot
        this.tarotCards = [
            {
                id: '1',
                name: 'La Torre',
                type: 'suit',
                target: 'hearts',
                multiplier: 1.5,
                cost: 150
            },
            // Más cartas...
        ];
    }

    private generateEnhancements() {
        // Ejemplo de generación de mejoras
        this.enhancements = [
            {
                id: '1',
                name: 'Baraja Mejorada',
                effect: 'Añade una carta de valor alto al mazo',
                cost: 200
            },
            // Más mejoras...
        ];
    }
}