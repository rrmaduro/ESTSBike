/**
 * BaseForm class creates and manages a simple form with fields, submit, and cancel actions.
 * 
 * @class BaseForm
 */
export class BaseForm {
    /**
     * Creates an instance of the BaseForm.
     * 
     * @param {string} title - The title of the form.
     * @param {Function} onSubmit - Callback function to be called when the form is submitted.
     * @param {Function} onCancel - Callback function to be called when the cancel button is clicked.
     */
    constructor(title, onSubmit, onCancel) {
        this.title = title;
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
        this.element = this.createElement();
    }

    /**
     * Creates the HTML structure for the form.
     * 
     * @returns {HTMLElement} The form element with title, fields, and actions.
     */
    createElement() {
        const form = document.createElement('form');
        form.className = 'form';
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = this.title;
        form.appendChild(titleElement);

        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'form-fields';
        form.appendChild(fieldsContainer);

        const actions = document.createElement('div');
        actions.className = 'form-actions';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Salvar';
        actions.appendChild(submitBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.onclick = () => this.onCancel();
        actions.appendChild(cancelBtn);

        form.appendChild(actions);

        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            this.onSubmit(data);
        };

        return form;
    }

    /**
     * Adds a field to the form.
     * 
     * @param {string} name - The name of the field (used as the input's name and ID).
     * @param {string} label - The label text for the field.
     * @param {string} [type='text'] - The type of the field (e.g., 'text', 'select', etc.).
     * @param {string} [value=''] - The initial value for the field.
     * @param {Array<{value: string, label: string}>} [options=null] - An array of option objects for 'select' fields.
     */
    addField(name, label, type = 'text', value = '', options = null) {
        const container = document.createElement('div');
        container.className = 'form-group';

        const labelElement = document.createElement('label');
        labelElement.htmlFor = name;
        labelElement.textContent = label;
        container.appendChild(labelElement);

        let input;
        if (type === 'select' && options) {
            input = document.createElement('select');
            options.forEach(option => {
                const optElement = document.createElement('option');
                optElement.value = option.value;
                optElement.textContent = option.label;
                input.appendChild(optElement);
            });
        } else {
            input = document.createElement('input');
            input.type = type;
        }

        input.name = name;
        input.id = name;
        input.value = value;
        container.appendChild(input);

        this.element.querySelector('.form-fields').appendChild(container);
    }

    /**
     * Renders the form inside a specified container.
     * 
     * @param {HTMLElement} container - The container element where the form should be displayed.
     */
    show(container) {
        container.innerHTML = '';
        container.appendChild(this.element);
    }
}