import { MemberStore } from '../models/Member.js';
import { EventTypeStore } from '../models/EventType.js';
import { EventStore } from '../models/Event.js';

/**
 * MemberManager class handles the creation, editing, deletion, and saving of members.
 * It also manages member preferences for event types and event registrations.
 * 
 * @class MemberManager
 */
class MemberManager {
    constructor() {
        this.selectedMemberId = null;
    }

    create() {
        const form = document.getElementById('member-form');
        
        const formContent = this.createFormElements();
        form.appendChild(formContent);
        
        document.getElementById('members-list').classList.add('hidden');
        form.classList.remove('hidden');
    }

    edit() {
        if (!this.selectedMemberId) {
            this.showError("Selecione um membro para editar");
            return;
        }

        const member = MemberStore.findById(this.selectedMemberId);
        const form = document.getElementById('member-form');
        
        const formContent = this.createFormElements(member);
        form.appendChild(formContent);
        
        document.getElementById('members-list').classList.add('hidden');
        form.classList.remove('hidden');
    }

    delete() {
        if (!this.selectedMemberId) {
            this.showError("Selecione um membro para apagar");
            return;
        }

        try {
            MemberStore.delete(this.selectedMemberId);
            this.selectedMemberId = null;
            this.refreshList();
        } catch (error) {
            this.showError(error.message);
        }
    }

    save(form) {
        const description = form.querySelector('[name="description"]').value;
        const preferredTypes = Array.from(form.querySelectorAll('[name="preferred_types"]:checked'))
            .map(cb => parseInt(cb.value));

        try {
            let member;
            if (this.selectedMemberId) {
                member = MemberStore.update(this.selectedMemberId, description);
            } else {
                member = MemberStore.add(description);
            }

            member.preferredEventTypes.clear();
            preferredTypes.forEach(typeId => member.addPreferredEventType(typeId));

            this.cancel();
            this.refreshList();
        } catch (error) {
            this.showError(error.message);
        }
    }

    cancel() {
        document.getElementById('member-form').classList.add('hidden');
        document.getElementById('members-list').classList.remove('hidden');
        this.selectedMemberId = null;
    }

    createFormElements(member = null) {
        const container = document.createElement('div');

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
        descInput.value = member ? member.description : '';
        descGroup.appendChild(descInput);

        container.appendChild(descGroup);

        const typesGroup = document.createElement('div');
        typesGroup.className = 'form-group';

        const typesLabel = document.createElement('label');
        typesLabel.textContent = 'Tipos de Eventos Preferidos:';
        typesGroup.appendChild(typesLabel);

        EventTypeStore.getAll().forEach(type => {
            const checkboxDiv = document.createElement('div');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'preferred_types';
            checkbox.value = type.id;
            checkbox.id = `type_${type.id}`;
            if (member && member.preferredEventTypes.has(type.id)) {
                checkbox.checked = true;
            }
            
            const label = document.createElement('label');
            label.htmlFor = `type_${type.id}`;
            label.textContent = type.description;
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            typesGroup.appendChild(checkboxDiv);
        });

        container.appendChild(typesGroup);

        if (member) {
            const eventsGroup = document.createElement('div');
            eventsGroup.className = 'form-group';

            const registerButton = document.createElement('button');
            registerButton.textContent = 'Inscrever em Evento';
            registerButton.onclick = () => this.showEventRegistration(member);
            eventsGroup.appendChild(registerButton);

            const unregisterButton = document.createElement('button');
            unregisterButton.textContent = 'Desinscrever de Evento';
            unregisterButton.onclick = () => this.showEventUnregistration(member);
            eventsGroup.appendChild(unregisterButton);

            container.appendChild(eventsGroup);
        }

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

    showEventRegistration(member) {
        const availableEvents = EventStore.getAvailableForMember(
            member.id,
            Array.from(member.preferredEventTypes)
        );

        if (availableEvents.length === 0) {
            this.showError("Não existem eventos disponíveis para inscrição");
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'modal';

        const select = document.createElement('select');
        availableEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.description} - ${event.date.toLocaleDateString()}`;
            select.appendChild(option);
        });

        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Aceitar';
        acceptButton.onclick = () => {
            const eventId = parseInt(select.value);
            const event = EventStore.findById(eventId);
            event.addParticipant(member.id);
            member.addEvent(eventId);
            dialog.remove();
            this.refreshList();
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.onclick = () => dialog.remove();

        dialog.appendChild(select);
        dialog.appendChild(acceptButton);
        dialog.appendChild(cancelButton);

        document.body.appendChild(dialog);
    }

    showEventUnregistration(member) {
        const registeredEvents = Array.from(member.events)
            .map(eventId => EventStore.findById(eventId))
            .filter(event => event !== undefined);

        if (registeredEvents.length === 0) {
            this.showError("Membro não está inscrito em nenhum evento");
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'modal';

        const select = document.createElement('select');
        registeredEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.description} - ${event.date.toLocaleDateString()}`;
            select.appendChild(option);
        });

        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Aceitar';
        acceptButton.onclick = () => {
            const eventId = parseInt(select.value);
            const event = EventStore.findById(eventId);
            event.removeParticipant(member.id);
            member.removeEvent(eventId);
            dialog.remove();
            this.refreshList();
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.onclick = () => dialog.remove();

        dialog.appendChild(select);
        dialog.appendChild(acceptButton);
        dialog.appendChild(cancelButton);

        document.body.appendChild(dialog);
    }

    refreshList() {
        const list = document.getElementById('members-list');

        MemberStore.getAll().forEach(member => {
            const item = document.createElement('div');
            item.className = 'list-item';
            if (member.id === this.selectedMemberId) {
                item.classList.add('selected');
            }
            
            const preferredTypes = Array.from(member.preferredEventTypes)
                .map(typeId => EventTypeStore.findById(typeId).description)
                .join(', ');
            
            item.textContent = `${member.description} (Preferências: ${preferredTypes})`;
            item.onclick = () => this.selectMember(member.id);
            list.appendChild(item);
        });
    }

    selectMember(id) {
        this.selectedMemberId = id;
        this.refreshList();
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = message;
        
        const form = document.getElementById('member-form');
        form.insertBefore(error, form.firstChild);
        
        setTimeout(() => error.remove(), 3000);
    }
}

export default new MemberManager();