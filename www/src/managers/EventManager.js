import { EventStore } from '../models/Event.js';
import { EventTypeStore } from '../models/EventType.js';

/**
 * EventManager class manages the creation, editing, deletion, and saving of events.
 * It handles form interactions for events and updates the events list.
 * 
 * @class EventManager
 */
class EventManager {
    /**
     * Creates an instance of the EventManager class.
     * Initializes the selectedEventId to null.
     */
    constructor() {
        this.selectedEventId = null;
    }

    /**
     * Displays the event creation form and hides the events list.
     * Prepares the form for creating a new event.
     */
    create() {
        const form = document.getElementById('event-form');
        
        const formContent = this.createFormElements();
        form.appendChild(formContent);
        
        document.getElementById('events-list').classList.add('hidden');
        form.classList.remove('hidden');
    }

    /**
     * Displays the event editing form for the selected event.
     * If no event is selected, an error message is shown.
     */
    edit() {
        if (!this.selectedEventId) {
            this.showError("Selecione um evento para editar");
            return;
        }

        const event = EventStore.findById(this.selectedEventId);
        const form = document.getElementById('event-form');
        
        const formContent = this.createFormElements(event);
        form.appendChild(formContent);
        
        document.getElementById('events-list').classList.add('hidden');
        form.classList.remove('hidden');
    }

    /**
     * Deletes the selected event. If no event is selected, an error message is shown.
     */
    delete() {
        if (!this.selectedEventId) {
            this.showError("Selecione um evento para apagar");
            return;
        }

        try {
            EventStore.delete(this.selectedEventId);
            this.selectedEventId = null;
            this.refreshList();
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Saves the event data from the form.
     * If editing an existing event, it updates the event; if creating a new event, it adds it.
     * After saving, it refreshes the list and cancels the form.
     * 
     * @param {HTMLElement} form - The form element containing the event data.
     */
    save(form) {
        const typeId = parseInt(form.querySelector('[name="type"]').value);
        const description = form.querySelector('[name="description"]').value;
        const date = form.querySelector('[name="date"]').value;

        try {
            if (this.selectedEventId) {
                EventStore.update(this.selectedEventId, typeId, description, date);
            } else {
                EventStore.add(typeId, description, date);
            }
            this.cancel();
            this.refreshList();
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Cancels the form, hides it, and displays the events list again.
     */
    cancel() {
        document.getElementById('event-form').classList.add('hidden');
        document.getElementById('events-list').classList.remove('hidden');
        this.selectedEventId = null;
    }

    /**
     * Creates and returns the HTML form elements for creating or editing an event.
     * If an event is passed, it populates the form with its data.
     * 
     * @param {Object|null} event - The event data to populate the form (if editing), or null (if creating).
     * @returns {HTMLElement} The form elements container.
     */
    createFormElements(event = null) {
        const container = document.createElement('div');

        const typeGroup = document.createElement('div');
        typeGroup.className = 'form-group';

        const typeLabel = document.createElement('label');
        typeLabel.htmlFor = 'type';
        typeLabel.textContent = 'Tipo:';
        typeGroup.appendChild(typeLabel);

        const typeSelect = document.createElement('select');
        typeSelect.name = 'type';
        typeSelect.id = 'type';

        EventTypeStore.getAll().forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.description;
            if (event && event.typeId === type.id) {
                option.selected = true;
            }
            typeSelect.appendChild(option);
        });

        typeGroup.appendChild(typeSelect);
        container.appendChild(typeGroup);

        const descGroup = document.createElement('div');
        descGroup.className = 'form-group';

        const descLabel = document.createElement('label');
        descLabel.htmlFor = 'description';
        descLabel.textContent = 'Descrição:';
        descGroup.appendChild(descLabel);

        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.name = 'description';
        descInput.id = 'description';
        descInput.value = event ? event.description : '';
        descGroup.appendChild(descInput);

        container.appendChild(descGroup);

        const dateGroup = document.createElement('div');
        dateGroup.className = 'form-group';

        const dateLabel = document.createElement('label');
        dateLabel.htmlFor = 'date';
        dateLabel.textContent = 'Data:';
        dateGroup.appendChild(dateLabel);

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.name = 'date';
        dateInput.id = 'date';
        if (event) {
            dateInput.value = event.date.toISOString().split('T')[0];
        }
        dateGroup.appendChild(dateInput);

        container.appendChild(dateGroup);

        const actions = document.createElement('div');
        actions.className = 'form-actions';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Gravar';
        saveButton.onclick = () => this.save(container);
        actions.appendChild(saveButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.onclick = () => this.cancel();
        actions.appendChild(cancelButton);

        container.appendChild(actions);

        return container;
    }

    /**
     * Refreshes the events list by re-rendering the event items.
     * Highlights the selected event if one is selected.
     */
    refreshList() {
        const list = document.getElementById('events-list');

        list.innerHTML = '';

        EventStore.getAll().forEach(event => {
            const item = document.createElement('div');
            item.className = 'list-item';
            if (event.id === this.selectedEventId) {
                item.classList.add('selected');
            }
            
            const type = EventTypeStore.findById(event.typeId);
            item.textContent = `${event.description} (${type.description}) - ${event.date.toLocaleDateString()}`;
            item.onclick = () => this.selectEvent(event.id);
            list.appendChild(item);
        });
    }

    /**
     * Sets the selected event ID and refreshes the events list.
     * 
     * @param {number} id - The ID of the selected event.
     */
    selectEvent(id) {
        this.selectedEventId = id;
        this.refreshList();
    }

    /**
     * Displays an error message for a short period.
     * 
     * @param {string} message - The error message to display.
     */
    showError(message) {
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = message;
        
        const form = document.getElementById('event-form');
        form.insertBefore(error, form.firstChild);
        
        setTimeout(() => error.remove(), 3000);
    }
}

export default new EventManager();