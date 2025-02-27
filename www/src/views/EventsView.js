import { BaseView } from '../components/BaseView.js';
import { BaseForm } from '../components/BaseForm.js';

/**
 * Represents the view for managing events, including listing, creating, editing, and deleting events.
 * Extends the BaseView class.
 */
export class EventsView extends BaseView {
    /**
     * Creates an instance of the EventsView class.
     */
    constructor() {
        super('Eventos');
        this.selectedId = null;  // Stores the currently selected event ID
    }

    /**
     * Creates the content for the events view, including a table with event data
     * and action buttons for creating, editing, and deleting events.
     */
    createContent() {
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Create table header with columns ID, Type, Name, Date
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['ID', 'Tipo', 'Nome', 'Data'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        this.fetchEvents().then(events => {
            events.forEach(event => {
                const row = document.createElement('tr');
                row.onclick = () => this.selectEvent(event.id);
                if (this.selectedId === event.id) {
                    row.classList.add('selected');
                }

                // Populate table row with event details
                const idCell = document.createElement('td');
                idCell.textContent = event.id;
                
                const typeCell = document.createElement('td');
                typeCell.textContent = event.type_name || '';
                
                const nameCell = document.createElement('td');
                nameCell.textContent = event.name;
                
                const dateCell = document.createElement('td');
                const eventDate = new Date(event.date);
                dateCell.textContent = eventDate instanceof Date && !isNaN(eventDate) ? eventDate.toLocaleDateString() : 'Invalid Date';

                row.append(idCell, typeCell, nameCell, dateCell);
                tbody.appendChild(row);
            });
        }).catch(error => {
            console.error('Error fetching events:', error);
            alert('Erro ao carregar eventos.');
        });

        table.appendChild(tbody);

        // Action buttons for creating, editing, and deleting events
        const actions = document.createElement('div');
        actions.className = 'actions';

        const createBtn = document.createElement('button');
        createBtn.textContent = 'Criar';
        createBtn.onclick = () => this.showForm();

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.onclick = () => this.editSelected();

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Apagar';
        deleteBtn.onclick = () => this.deleteSelected();

        actions.append(createBtn, editBtn, deleteBtn);

        const container = document.createElement('div');
        container.className = 'view-container';
        container.append(table, actions);

        const formContainer = document.createElement('div');
        formContainer.id = 'form-container';
        
        this.element.append(container, formContainer);
    }

    /**
     * Fetches the list of events from the server.
     * @returns {Promise<Array>} A promise that resolves to an array of events.
     */
    async fetchEvents() {
        try {
            const response = await fetch('http://localhost:3000/events');
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const events = await response.json();
            return events;
        } catch (error) {
            console.error('Error fetching events:', error);
            alert('Erro ao carregar eventos.');
        }
    }

    /**
     * Shows the form for creating or editing an event.
     * @param {Object|null} event The event to edit, or null to create a new event.
     */
    showForm(event = null) {
        const form = new BaseForm(
            event ? 'Editar Evento' : 'Novo Evento',
            (data) => this.handleSubmit(data, event?.id),
            () => this.hideForm()
        );

        this.fetchEventTypes().then(eventTypes => {
            form.addField('typeId', 'Tipo', 'select', event?.typeId?.toString() || '', eventTypes.map(type => ({
                value: type.id.toString(),
                label: type.name
            })));
            form.addField('name', 'Nome', 'text', event?.name || '');

            const eventDate = event?.date ? new Date(event.date) : null;
            form.addField('date', 'Data', 'date', eventDate && !isNaN(eventDate) ? eventDate.toISOString().split('T')[0] : '');
            
            form.show(document.getElementById('form-container'));
        }).catch(error => {
            console.error('Error fetching event types:', error);
            alert('Erro ao carregar tipos de evento.');
        });
    }

    /**
     * Fetches the list of event types from the server.
     * @returns {Promise<Array>} A promise that resolves to an array of event types.
     */
    async fetchEventTypes() {
        try {
            const response = await fetch('http://localhost:3000/event-types');
            if (!response.ok) {
                throw new Error('Failed to fetch event types');
            }
            const eventTypes = await response.json();
            return eventTypes;
        } catch (error) {
            console.error('Error fetching event types:', error);
            alert('Erro ao carregar tipos de evento.');
        }
    }

    /**
     * Handles form submission for creating or updating an event.
     * @param {Object} data The form data.
     * @param {number|null} id The ID of the event to update, or null for creating a new event.
     */
    handleSubmit(data, id = null) {
        try {
            const typeId = parseInt(data.typeId);
            const eventDate = new Date(data.date); 
            if (id) {
                this.updateEvent(id, typeId, data.name, eventDate);
            } else {
                this.createEvent(typeId, data.name, eventDate);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Creates a new event by sending the data to the server.
     * @param {number} typeId The type ID of the event.
     * @param {string} name The name of the event.
     * @param {Date} date The date of the event.
     */
    async createEvent(typeId, name, date) {
        const response = await fetch('http://localhost:3000/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type_id: typeId, name, date })  
        });
    
        if (response.ok) {
            alert('Evento criado com sucesso!');
            this.refresh();
        } else {
            alert('Erro ao criar evento.');
        }
    }

    /**
     * Updates an existing event by sending the updated data to the server.
     * @param {number} id The ID of the event to update.
     * @param {number} typeId The type ID of the event.
     * @param {string} name The name of the event.
     * @param {Date} date The updated date of the event.
     */
    async updateEvent(id, typeId, name, date) {
        try {
            const formattedDate = new Date(date).toISOString();  
            const response = await fetch(`http://localhost:3000/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type_id: typeId,  
                    name: name,
                    date: formattedDate,
                }),
            });
    
            const responseData = await response.json();  
    
            if (!response.ok) {
                console.error('Error:', responseData.message || 'Unknown error');
                alert(`Erro ao atualizar evento: ${responseData.message || 'Unknown error'}`);
                return;
            }
    
            alert('Evento atualizado com sucesso!');
            this.refresh();
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Erro ao atualizar evento.');
        }
    }

    /**
     * Deletes an event by sending a delete request to the server.
     * @param {number} id The ID of the event to delete.
     */
    async deleteEvent(id) {
        const response = await fetch(`http://localhost:3000/events/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Evento apagado com sucesso!');
            this.refresh();
        } else {
            alert('Erro ao apagar evento.');
        }
    }

    /**
     * Opens the event form for editing the selected event.
     */
    editSelected() {
        if (!this.selectedId) {
            alert('Selecione um evento para editar');
            return;
        }
        this.fetchEventById(this.selectedId).then(event => {
            this.showForm(event);
        }).catch(error => {
            console.error('Error fetching event:', error);
            alert('Erro ao carregar evento.');
        });
    }

    /**
     * Fetches a specific event by its ID.
     * @param {number} id The ID of the event.
     * @returns {Promise<Object>} A promise that resolves to the event data.
     */
    async fetchEventById(id) {
        const response = await fetch(`http://localhost:3000/events/${id}`);
        if (!response.ok) {
            throw new Error('Event not found');
        }
        return await response.json();
    }

    /**
     * Deletes the selected event.
     */
    deleteSelected() {
        if (!this.selectedId) {
            alert('Selecione um evento para apagar');
            return;
        }
        if (confirm('Tem certeza que deseja apagar este evento?')) {
            this.deleteEvent(this.selectedId);
        }
    }

    /**
     * Selects an event by its ID.
     * @param {number} id The ID of the event to select.
     */
    selectEvent(id) {
        this.selectedId = id;
        this.refresh();
    }

    /**
     * Refreshes the content of the events view by clearing and re-creating it.
     */
    refresh() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        this.createContent();
    }
}
