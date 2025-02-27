import { EventTypeStore } from './EventType.js';

/**
 * Represents an event in the system.
 */
export class Event {
    /**
     * Creates an instance of an Event.
     * 
     * @param {number} id - The unique identifier for the event.
     * @param {number} typeId - The ID of the event type.
     * @param {string} name - The name of the event.
     * @param {Date|string} date - The date of the event.
     */
    constructor(id, typeId, name, date) {
        this.id = id;
        this.typeId = typeId;
        this.name = name;
        this.date = new Date(date);
        this.participants = new Set();
    }

    /**
     * Validates the event data before creating or updating an event.
     * 
     * @param {number} typeId - The ID of the event type.
     * @param {string} name - The name of the event.
     * @param {Date|string} date - The date of the event.
     * 
     * @throws {Error} Throws an error if validation fails.
     * 
     * @returns {boolean} Returns true if validation passes.
     */
    static validate(typeId, name, date) {
        if (!EventTypeStore.findById(typeId)) {
            throw new Error("Tipo de evento inválido");
        }
        if (!name || name.trim().length === 0) {
            throw new Error("Nome do evento é obrigatório");
        }
        if (!date || isNaN(new Date(date).getTime())) {
            throw new Error("Data do evento é obrigatória e deve ser válida");
        }
        return true;
    }

    /**
     * Converts the event instance to a JSON object.
     * 
     * @returns {Object} The event in JSON format.
     */
    toJSON() {
        return {
            id: this.id,
            typeId: this.typeId,
            name: this.name,
            date: this.date.toISOString(),
            participants: Array.from(this.participants)
        };
    }

    /**
     * Creates an Event instance from a JSON object.
     * 
     * @param {Object} json - The JSON object containing event data.
     * 
     * @returns {Event} The created Event instance.
     */
    static fromJSON(json) {
        const event = new Event(json.id, json.typeId, json.name, json.date);
        event.participants = new Set(json.participants);
        return event;
    }

    /**
     * Adds a member as a participant of the event.
     * 
     * @param {number} memberId - The ID of the member to add as a participant.
     */
    addParticipant(memberId) {
        this.participants.add(memberId);
    }

    /**
     * Removes a member from the event participants.
     * 
     * @param {number} memberId - The ID of the member to remove.
     */
    removeParticipant(memberId) {
        this.participants.delete(memberId);
    }

    /**
     * Checks if a member is a participant of the event.
     * 
     * @param {number} memberId - The ID of the member to check.
     * 
     * @returns {boolean} Returns true if the member is a participant.
     */
    hasParticipant(memberId) {
        return this.participants.has(memberId);
    }
}

/**
 * Manages a collection of events, including adding, updating, deleting, and retrieving events.
 */
class EventStoreClass {
    /**
     * Initializes the EventStoreClass, loading events from localStorage if available.
     */
    constructor() {
        this.events = [];
        this.lastId = 0;
        this.loadFromStorage();
    }

    /**
     * Loads events from localStorage and initializes the event list.
     */
    loadFromStorage() {
        const stored = localStorage.getItem('events');
        if (stored) {
            const data = JSON.parse(stored);
            this.lastId = data.lastId;
            this.events = data.events.map(eventData => Event.fromJSON(eventData));
        } else {
            const today = new Date();
            this.add(1, "Passeio na Cidade", new Date(today.setDate(today.getDate() + 7)));
            this.add(2, "Competição Regional", new Date(today.setDate(today.getDate() + 14)));
        }
    }

    /**
     * Saves the current events to localStorage.
     */
    saveToStorage() {
        localStorage.setItem('events', JSON.stringify({
            lastId: this.lastId,
            events: this.events.map(event => event.toJSON())
        }));
    }

    /**
     * Adds a new event to the store after validating it.
     * 
     * @param {number} typeId - The ID of the event type.
     * @param {string} name - The name of the event.
     * @param {Date|string} date - The date of the event.
     * 
     * @throws {Error} Throws an error if validation fails.
     * 
     * @returns {Event} The newly added event.
     */
    add(typeId, name, date) {
        Event.validate(typeId, name, date);
        const event = new Event(++this.lastId, typeId, name, date);
        this.events.push(event);
        this.saveToStorage();
        return event;
    }

    /**
     * Updates an existing event in the store.
     * 
     * @param {number} id - The ID of the event to update.
     * @param {number} typeId - The new event type ID.
     * @param {string} name - The new event name.
     * @param {Date|string} date - The new event date.
     * 
     * @throws {Error} Throws an error if the event is not found or validation fails.
     * 
     * @returns {Event} The updated event.
     */
    update(id, typeId, name, date) {
        const event = this.findById(id);
        if (!event) {
            throw new Error("Evento não encontrado");
        }
        Event.validate(typeId, name, date);
        event.typeId = typeId;
        event.name = name;
        event.date = new Date(date);
        this.saveToStorage();
        return event;
    }

    /**
     * Deletes an event from the store by its ID.
     * 
     * @param {number} id - The ID of the event to delete.
     * 
     * @throws {Error} Throws an error if the event is not found.
     */
    delete(id) {
        const index = this.events.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error("Evento não encontrado");
        }

        this.events.splice(index, 1);

        this.events.forEach((event, idx) => {
            event.id = idx + 1;
        });

        this.lastId = this.events.length;

        this.saveToStorage();
    }

    /**
     * Finds an event by its ID.
     * 
     * @param {number} id - The ID of the event to find.
     * 
     * @returns {Event|null} The found event, or null if not found.
     */
    findById(id) {
        return this.events.find(e => e.id === id);
    }

    /**
     * Retrieves all events in the store.
     * 
     * @returns {Event[]} An array of all events.
     */
    getAll() {
        return [...this.events];
    }

    /**
     * Retrieves events that are available for a specific member based on their preferred event types.
     * 
     * @param {number} memberId - The ID of the member.
     * @param {number[]} preferredTypes - An array of preferred event type IDs.
     * 
     * @returns {Event[]} An array of events that the member can join.
     */
    getAvailableForMember(memberId, preferredTypes) {
        const now = new Date();
        return this.events.filter(event => {
            return event.date > now &&
                   preferredTypes.includes(event.typeId) &&
                   !event.hasParticipant(memberId);
        });
    }
}

export const EventStore = new EventStoreClass();