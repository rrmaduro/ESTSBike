import { BaseView } from '../components/BaseView.js';
import { MemberStore } from '../models/Member.js';
import { EventTypeStore } from '../models/EventType.js';

/**
 * Class that represents the view for managing members.
 * It allows displaying, editing, creating, and deleting members.
 */
export class MembersView extends BaseView {
    /**
     * Creates an instance of the MembersView.
     * @constructor
     */
    constructor() {
        super('Membros');
        this.selectedId = null;
        this.members = [];
        this.selectMember = this.selectMember.bind(this);
    }

    /**
     * Fetches all event types from the API.
     * @returns {Array} List of event types.
     */
    async fetchEventTypes() {
        try {
            const response = await fetch('http://localhost:3000/event-types');
            if (!response.ok) throw new Error("Falha ao carregar tipos de evento.");
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Erro ao buscar tipos de evento:", error);
            return [];
        }
    }

    /**
     * Edit the selected member by showing the edit form with pre-filled details.
     */
    editSelected() {
        const selectedMember = this.getSelectedMember();
        if (!selectedMember) {
            alert("Por favor, selecione um membro para editar.");
            return;
        }

        this.fetchEventTypes()
            .then(eventTypes => {
                this.showEditForm(selectedMember, eventTypes);
            })
            .catch(error => {
                console.error("Erro ao obter tipos de evento:", error);
            });
    }

    /**
     * Fetches the selected member from the list of members.
     * @returns {Object|null} The selected member or null if no member is selected.
     */
    getSelectedMember() {
        if (!this.members || this.members.length === 0) {
            console.error("No members available to select.");
            return null;
        }
        return this.members.find(member => member.id === this.selectedId);
    }

    /**
     * Displays the edit form for the selected member.
     * @param {Object} member - The member to be edited.
     * @param {Array} eventTypes - List of event types to display in checkboxes.
     */
    showEditForm(member, eventTypes) {
        let formContainer = document.getElementById('form-container');
        if (!formContainer) {
            formContainer = document.createElement('div');
            formContainer.id = 'form-container';
            this.element.appendChild(formContainer);
        }

        formContainer.innerHTML = '';

        const form = document.createElement('form');
        form.className = 'form';

        const title = document.createElement('h3');
        title.textContent = 'Editar Membro';

        const formGroupName = document.createElement('div');
        formGroupName.className = 'form-group';

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Nome';
        nameLabel.htmlFor = 'name';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'name';
        nameInput.value = member.name;
        nameInput.name = 'name';
        nameInput.className = 'form-input';

        formGroupName.append(nameLabel, nameInput);

        const selectedMemberEventTypes = Array.isArray(member.preferredEventTypes) ? member.preferredEventTypes : [];

        const formGroupEvents = document.createElement('div');
        formGroupEvents.className = 'form-group';

        const eventLabel = document.createElement('label');
        eventLabel.textContent = 'Tipos de Evento';

        const eventSelectionContainer = document.createElement('div');
        eventSelectionContainer.className = 'checkboxes-container';

        eventTypes.forEach(eventType => {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = eventType.id;
            checkbox.checked = selectedMemberEventTypes.includes(eventType.id);
            checkbox.id = `event-${eventType.id}`;

            const label = document.createElement('label');
            label.htmlFor = `event-${eventType.id}`;
            label.textContent = eventType.name;

            checkboxWrapper.append(checkbox, label);
            eventSelectionContainer.appendChild(checkboxWrapper);
        });

        formGroupEvents.append(eventLabel, eventSelectionContainer);

        const formActions = document.createElement('div');
        formActions.className = 'form-actions';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Salvar';
        saveBtn.className = 'btn-primary';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.className = 'btn-secondary';
        cancelBtn.onclick = () => this.cancelEdit();

        formActions.append(saveBtn, cancelBtn);
        form.append(title, formGroupName, formGroupEvents, formActions);
        formContainer.appendChild(form);

        form.onsubmit = async (event) => {
            event.preventDefault();

            const selectedEvents = Array.from(eventSelectionContainer.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => parseInt(checkbox.value));

            const updatedMember = {
                id: member.id,
                name: nameInput.value,
                preferredEventTypes: selectedEvents,
            };

            await this.saveMember(updatedMember);
        };
    }

    /**
     * Saves the updated member to the API.
     * @param {Object} member - The member data to save.
     */
    async saveMember(member) {
        if (member.id) {
            try {
                const response = await fetch(`http://localhost:3000/members/${member.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(member),
                });

                if (response.ok) {
                    alert('Membro atualizado com sucesso!');
                    this.refresh();
                } else {
                    alert('Erro ao atualizar membro.');
                }
            } catch (error) {
                console.error("Erro ao salvar as alterações:", error);
                alert("Erro ao salvar as alterações.");
            }
        } else {
            try {
                const response = await fetch('http://localhost:3000/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(member),
                });

                if (response.ok) {
                    alert('Membro criado com sucesso!');
                    this.refresh();
                } else {
                    alert('Erro ao criar membro.');
                }
            } catch (error) {
                console.error("Erro ao criar membro:", error);
                alert("Erro ao criar membro.");
            }
        }
    }

    /**
     * Cancels the member editing process by clearing the form.
     */
    cancelEdit() {
        document.getElementById('form-container').innerHTML = '';
    }

    /**
     * Shows the form to create a new member.
     */
    showForm() {
        const formContainer = document.getElementById('form-container');
        if (!formContainer) {
            const newFormContainer = document.createElement('div');
            newFormContainer.id = 'form-container';
            this.element.appendChild(newFormContainer);
        }

        formContainer.innerHTML = '';
        const form = document.createElement('form');
        form.className = 'form';

        const title = document.createElement('h3');
        title.textContent = 'Criar Membro';

        const formGroupName = document.createElement('div');
        formGroupName.className = 'form-group';

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Nome';
        nameLabel.htmlFor = 'name';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'name';
        nameInput.name = 'name';
        nameInput.className = 'form-input';

        formGroupName.append(nameLabel, nameInput);

        const formActions = document.createElement('div');
        formActions.className = 'form-actions';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Salvar';
        saveBtn.className = 'btn-primary';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.className = 'btn-secondary';
        cancelBtn.onclick = () => this.cancelCreate();

        formActions.append(saveBtn, cancelBtn);
        form.append(title, formGroupName, formActions);
        formContainer.appendChild(form);

        form.onsubmit = async (event) => {
            event.preventDefault();

            const newMember = {
                name: nameInput.value,
            };

            await this.saveMember(newMember);
        };
    }

    /**
     * Cancels the creation process by clearing the form.
     */
    cancelCreate() {
        document.getElementById('form-container').innerHTML = '';
    }

    /**
     * Creates and renders the content for displaying members in a table.
     */
    async createContent() {
        const table = document.createElement('table');
        table.className = 'data-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['ID', 'Nome', 'Tipos de Eventos Preferidos'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        try {
            const response = await this.fetchMembers();
            console.log("Fetched response:", response);
            const members = response.data;
            if (Array.isArray(members)) {
                this.members = members;
                members.forEach(member => {
                    const row = document.createElement('tr');
                    row.onclick = () => this.selectMember(member.id);

                    if (this.selectedId === member.id) {
                        row.classList.add('selected');
                    }

                    const idCell = document.createElement('td');
                    idCell.textContent = member.id;

                    const nameCell = document.createElement('td');
                    nameCell.textContent = member.name;

                    const typesCell = document.createElement('td');
                    const preferredTypes = member.preferredEventTypes
                        ? member.preferredEventTypes
                            .map(typeId => {
                                const eventType = EventTypeStore.findById(typeId);
                                return eventType ? eventType.name : '';
                            })
                            .filter(name => name)
                            .join(', ')
                        : '';

                    typesCell.textContent = preferredTypes;

                    row.append(idCell, nameCell, typesCell);
                    tbody.appendChild(row);
                });
            } else {
                throw new Error("Invalid response format: The 'data' field is not an array.");
            }

        } catch (error) {
            console.error("Error fetching members:", error);
            alert("Erro ao buscar membros.");
        }

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
     * Fetches all members from the API.
     * @returns {Object[]} List of members.
     */
    async fetchMembers() {
        try {
            const response = await fetch('http://localhost:3000/members');
            const data = await response.json();
            console.log('Raw response data:', data);

            return data;
        } catch (error) {
            console.error('Error fetching members:', error);
            throw error;
        }
    }

    /**
     * Selects a member by their ID.
     * @param {number} id - The ID of the member to select.
     */
    selectMember(id) {
        this.selectedId = id;
        this.refresh();
    }

    /**
     * Deletes the selected member.
     */
    async deleteSelected() {
        if (!this.selectedId) {
            alert('Selecione um membro para apagar');
            return;
        }
        if (confirm('Tem certeza que deseja apagar este membro?')) {
            try {
                console.log("Deleting member:", this.selectedId);
                await this.deleteMember(this.selectedId);
                console.log("Member deleted from API");
                this.selectedId = null;
                await this.refresh();
            } catch (error) {
                console.error("Delete error:", error);
                alert(error.message);
            }
        }
    }

    /**
     * Deletes a member by ID from the API.
     * @param {number} id - The ID of the member to delete.
     */
    async deleteMember(id) {
        try {
            const response = await fetch(`http://localhost:3000/members/${id}`, {
                method: 'DELETE',
            });

            console.log('Delete Response:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete failed:', errorText);
                throw new Error('Failed to delete member');
            }

            this.members = this.members.filter(member => member.id !== id);

            this.refresh();
        } catch (error) {
            console.error("Error deleting member:", error);
            throw error;
        }
    }

    /**
     * Refreshes the view by removing old content and re-creating the content.
     */
    async refresh() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        await this.createContent();
    }
}
