import { EventTypeStore } from '../models/EventType.js';

/**
 * EventTypeManager class handles the creation, editing, deletion, and saving of event types.
 * It manages the event type form interactions and the events list.
 * 
 * @class EventTypeManager
 */
class EventTypeManager {
    constructor() {
        this.selectedTypeId = null;
    }

    create() {
        const form = document.getElementById('event-type-form');
        
        const formContent = this.createFormElements();
        form.appendChild(formContent);
        
        document.getElementById('event-types-list').classList.add('hidden');
        form.classList.remove('hidden');
    }

    edit() {
        if (!this.selectedTypeId) {
            this.showError("Selecione um tipo de evento para editar");
            return;
        }

        const type = EventTypeStore.findById(this.selectedTypeId);
        const form = document.getElementById('event-type-form');
        
        const formContent = this.createFormElements(type);
        form.appendChild(formContent);
        
        document.getElementById('event-types-list').classList.add('hidden');
        form.classList.remove('hidden');
    }

    delete() {
        if (!this.selectedTypeId) {
            this.showError("Selecione um tipo de evento para apagar");
            return;
        }

        try {
            EventTypeStore.delete(this.selectedTypeId);
            this.selectedTypeId = null;
            this.refreshList();
        } catch (error) {
            this.showError(error.message);
        }
    }

    save(form) {
        const description = form.querySelector('[name="description"]').value;

        try {
            if (this.selectedTypeId) {
                EventTypeStore.update(this.selectedTypeId, description);
            } else {
                EventTypeStore.add(description);
            }
            this.cancel();
            this.refreshList();
        } catch (error) {
            this.showError(error.message);
        }
    }

    cancel() {
        document.getElementById('event-type-form').classList.add('hidden');
        document.getElementById('event-types-list').classList.remove('hidden');
        this.selectedTypeId = null;
    }

    createFormElements(type = null) {
        const container = document.createElement('div');

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.htmlFor = 'description';
        label.textContent = 'Descrição:';
        formGroup.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'description';
        input.id = 'description';
        input.value = type ? type.description : '';
        formGroup.appendChild(input);

        container.appendChild(formGroup);

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

    refreshList() {
        const list = document.getElementById('event-types-list');

        EventTypeStore.getAll().forEach(type => {
            const item = document.createElement('div');
            item.className = 'list-item';
            if (type.id === this.selectedTypeId) {
                item.classList.add('selected');
            }
            item.textContent = type.description;
            item.onclick = () => this.selectType(type.id);
            list.appendChild(item);
        });
    }

    selectType(id) {
        this.selectedTypeId = id;
        this.refreshList();
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = message;
        
        const form = document.getElementById('event-type-form');
        form.insertBefore(error, form.firstChild);
        
        setTimeout(() => error.remove(), 3000);
    }
}

export default new EventTypeManager();