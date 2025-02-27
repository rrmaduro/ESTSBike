import { BaseView } from '../components/BaseView.js';
import { BaseForm } from '../components/BaseForm.js';
import { EventTypeStore } from '../models/EventType.js';

/**
 * Represents the view for managing event types, including listing, creating, editing, and deleting event types.
 * Extends the BaseView class.
 */
export class EventTypesView extends BaseView {
    /**
     * Initializes the EventTypesView, setting the title and selectedId to null.
     */
    constructor() {
        super('Tipos de Eventos');
        this.selectedId = null;
    }

    /**
     * Creates the content for the EventTypesView, which includes a table of event types and action buttons.
     * The table lists the event types with their ID and name.
     * The actions section includes buttons for creating, editing, and deleting event types.
     * 
     * @returns {Promise<void>} A promise that resolves once the content is fully created.
     */
    async createContent() {
        const table = document.createElement('table');
        table.className = 'data-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['ID', 'Nome'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        const eventTypes = await EventTypeStore.getAll();

        eventTypes.forEach(type => {
            const row = document.createElement('tr');
            row.onclick = () => this.selectType(type.id);
            if (this.selectedId === type.id) {
                row.classList.add('selected');
            }

            const idCell = document.createElement('td');
            idCell.textContent = type.id;
            
            const nameCell = document.createElement('td');
            nameCell.textContent = type.name;

            row.append(idCell, nameCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);

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
     * Displays a form for creating or editing an event type.
     * 
     * @param {Object|null} type - The event type to edit, or null to create a new event type.
     */
    showForm(type = null) {
        const form = new BaseForm(
            type ? 'Editar Tipo de Evento' : 'Novo Tipo de Evento',
            (data) => this.handleSubmit(data, type?.id),
            () => this.hideForm()
        );

        form.addField('name', 'Nome', 'text', type?.name || '');
        form.show(document.getElementById('form-container'));
    }

    /**
     * Handles form submission for creating or editing an event type.
     * 
     * @param {Object} data - The data submitted in the form.
     * @param {number|null} id - The ID of the event type to edit, or null if creating a new event type.
     */
    async handleSubmit(data, id = null) {
        try {
            if (id) {
                await EventTypeStore.update(id, data.name);
            } else {
                await EventTypeStore.add(data.name);
            }
            this.hideForm();
            this.refresh();
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Hides the form container by removing all child elements from it.
     */
    hideForm() {
        const formContainer = document.getElementById('form-container');
        if (formContainer) {
            while (formContainer.firstChild) {
                formContainer.removeChild(formContainer.firstChild);
            }
        }
    }

    /**
     * Initiates the editing process for the currently selected event type.
     * If no event type is selected, an alert is shown.
     */
    async editSelected() {
        if (!this.selectedId) {
            alert('Selecione um tipo de evento para editar');
            return;
        }
        const type = await EventTypeStore.findById(this.selectedId);
        if (type) {
            this.showForm(type);
        }
    }

    /**
     * Deletes the currently selected event type.
     * If no event type is selected, an alert is shown.
     * A confirmation prompt is shown before deletion occurs.
     */
    async deleteSelected() {
        if (!this.selectedId) {
            alert('Selecione um tipo de evento para apagar');
            return;
        }
        if (confirm('Tem certeza que deseja apagar este tipo de evento?')) {
            await EventTypeStore.delete(this.selectedId);
            this.selectedId = null;
            this.refresh();
        }
    }

    /**
     * Sets the selected event type by its ID and refreshes the view.
     * 
     * @param {number} id - The ID of the event type to select.
     */
    selectType(id) {
        this.selectedId = id;
        this.refresh();
    }

    /**
     * Refreshes the content of the view by removing the existing elements and creating new content.
     * 
     * @returns {Promise<void>} A promise that resolves once the view has been refreshed.
     */
    async refresh() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        await this.createContent();
    }
}
