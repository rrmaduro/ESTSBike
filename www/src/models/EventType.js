/**
 * Represents an event type (e.g., "Passeio", "Competição").
 */
export class EventType {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static validate(name) {
        return name && name.trim().length > 0;
    }

    toJSON() {
        return { id: this.id, name: this.name };
    }

    static fromJSON(json) {
        return new EventType(json.id, json.name);
    }
}

/**
 * Manages event types using backend API.
 */
class EventTypeStoreClass {
    constructor() {
        this.apiUrl = "http://localhost:3000/event-types"; // Backend API URL
    }

    /**
     * Fetch all event types from the backend.
     * @returns {Promise<EventType[]>} List of event types.
     */
    async getAll() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error("Failed to fetch event types");
            const data = await response.json();
            return data.map(EventType.fromJSON);
        } catch (error) {
            console.error("Error fetching event types:", error);
            return [];
        }
    }

    /**
     * Fetch a single event type by ID.
     * @param {number} id
     * @returns {Promise<EventType|null>}
     */
    async findById(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            if (!response.ok) throw new Error("Event type not found");
            return EventType.fromJSON(await response.json());
        } catch (error) {
            console.error(`Error fetching event type ${id}:`, error);
            return null;
        }
    }

    /**
     * Create a new event type.
     * @param {string} name
     * @returns {Promise<EventType|null>}
     */
    async add(name) {
        if (!EventType.validate(name)) {
            throw new Error("Nome do tipo de evento é obrigatório");
        }
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error("Failed to add event type");
            return EventType.fromJSON(await response.json());
        } catch (error) {
            console.error("Error adding event type:", error);
            return null;
        }
    }

    /**
     * Update an existing event type.
     * @param {number} id
     * @param {string} name
     * @returns {Promise<EventType|null>}
     */
    async update(id, name) {
        if (!EventType.validate(name)) {
            throw new Error("Nome do tipo de evento é obrigatório");
        }
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error("Failed to update event type");
            return EventType.fromJSON(await response.json());
        } catch (error) {
            console.error(`Error updating event type ${id}:`, error);
            return null;
        }
    }

    /**
     * Delete an event type.
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) throw new Error("Failed to delete event type");
            return true;
        } catch (error) {
            console.error(`Error deleting event type ${id}:`, error);
            return false;
        }
    }
    
}

export const EventTypeStore = new EventTypeStoreClass();
