/**
 * Represents a member, with an ID, name, and preferred event types.
 */
export class Member {
    /**
     * Creates an instance of a Member.
     * 
     * @param {number} id - The unique identifier for the member.
     * @param {string} name - The name of the member.
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.preferredEventTypes = new Set();
    }

    /**
     * Validates the name of the member.
     * 
     * @param {string} name - The name of the member.
     * 
     * @throws {Error} Throws an error if the name is invalid (empty or only whitespace).
     * 
     * @returns {boolean} Returns true if the name is valid.
     */
    static validate(name) {
        if (!name || name.trim().length === 0) {
            throw new Error("Nome do membro é obrigatório");
        }
        return true;
    }

    /**
     * Converts the member instance to a JSON object.
     * 
     * @returns {Object} The member in JSON format.
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            preferredEventTypes: Array.from(this.preferredEventTypes)
        };
    }

    /**
     * Creates a Member instance from a JSON object.
     * 
     * @param {Object} json - The JSON object containing member data.
     * 
     * @returns {Member} The created Member instance.
     */
    static fromJSON(json) {
        const member = new Member(json.id, json.name);
        member.preferredEventTypes = new Set(Array.isArray(json.preferredEventTypes) ? json.preferredEventTypes : []);
        return member;
    }


    /**
     * Adds an event type to the member's preferred event types.
     * 
     * @param {number} typeId - The ID of the event type to add.
     */
    addPreferredEventType(typeId) {
        this.preferredEventTypes.add(typeId);
    }

    /**
     * Removes an event type from the member's preferred event types.
     * 
     * @param {number} typeId - The ID of the event type to remove.
     */
    removePreferredEventType(typeId) {
        this.preferredEventTypes.delete(typeId);
    }
}

/**
 * Manages a collection of members, including adding, updating, deleting, and retrieving members.
 */
class MemberStoreClass {
    /**
     * Initializes the MemberStoreClass, loading members from localStorage if available.
     */
    constructor() {
        this.members = [];
        this.lastId = 0;
        this.loadFromStorage();
    }

    /**
     * Loads members from localStorage and initializes the member list.
     */
    loadFromStorage() {
        const stored = localStorage.getItem('members');
        if (stored) {
            const data = JSON.parse(stored);
            this.lastId = data.lastId;
            this.members = data.members.map(memberData => Member.fromJSON(memberData));
        } else {
            this.add("João Silva");
            this.add("Maria Santos");
        }
    }

    /**
     * Saves the current members to localStorage.
     */
    saveToStorage() {
        localStorage.setItem('members', JSON.stringify({
            lastId: this.lastId,
            members: this.members.map(member => member.toJSON())
        }));
    }

    /**
     * Adds a new member to the store after validating the name.
     * 
     * @param {string} name - The name of the new member.
     * 
     * @throws {Error} Throws an error if the name is invalid.
     * 
     * @returns {Member} The newly added member.
     */
    add(name) {
        Member.validate(name);
        const member = new Member(++this.lastId, name);
        this.members.push(member);
        this.saveToStorage();
        return member;
    }

    /**
     * Updates an existing member's details in the store.
     * 
     * @param {number} id - The ID of the member to update.
     * @param {string} name - The new name for the member.
     * @param {number[]} preferredTypes - The updated list of preferred event types (by type ID).
     * 
     * @throws {Error} Throws an error if the member is not found or if the name is invalid.
     * 
     * @returns {Member} The updated member.
     */
    update(id, name, preferredTypes) {
        const member = this.findById(id);
        if (!member) {
            throw new Error("Membro não encontrado");
        }
        Member.validate(name);
        member.name = name;
        member.preferredEventTypes.clear();
        preferredTypes.forEach(typeId => member.addPreferredEventType(typeId));
        this.saveToStorage();
        return member;
    }

    /**
     * Deletes a member from the store by their ID.
     * 
     * @param {number} id - The ID of the member to delete.
     * 
     * @throws {Error} Throws an error if the member is not found.
     */
    delete(id) {
        const index = this.members.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error("Membro não encontrado");
        }

        this.members.splice(index, 1);

        this.members.forEach((member, idx) => {
            member.id = idx + 1;
        });

        this.lastId = this.members.length;

        this.saveToStorage();
    }

    /**
     * Finds a member by their ID.
     * 
     * @param {number} id - The ID of the member to find.
     * 
     * @returns {Member|null} The found member, or null if not found.
     */
    findById(id) {
        return this.members.find(m => m.id === id);
    }

    /**
     * Retrieves all members in the store.
     * 
     * @returns {Member[]} An array of all members.
     */
    getAll() {
        return [...this.members];
    }
}

export const MemberStore = new MemberStoreClass();