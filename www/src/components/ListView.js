/**
 * ListView class creates and manages a list of items, with functionality 
 * for rendering the list, selecting an item, and handling item selection.
 * 
 * @class ListView
 */
export class ListView {
    /**
     * Creates an instance of the ListView.
     * Initializes the element and sets the selected item ID to null.
     */
    constructor() {
        this.element = this.createElement();
        this.selectedId = null;
    }

    /**
     * Creates the HTML element for the list container.
     * 
     * @returns {HTMLElement} The list container element.
     */
    createElement() {
        const div = document.createElement('div');
        div.className = 'list';
        return div;
    }

    /**
     * Renders the list of items by creating a div element for each item,
     * appending it to the list container. Clears the existing content first.
     * 
     * @param {Array} items - The list of items to render.
     */
    render(items) {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'list-item';

            if (item.id === this.selectedId) {
                itemDiv.classList.add('selected');
            }

            itemDiv.textContent = this.getItemText(item);

            itemDiv.addEventListener('click', () => this.selectItem(item.id));

            this.element.appendChild(itemDiv);
        });
    }

    /**
     * Returns the text representation of an item.
     * This method can be overridden by subclasses to customize how items are displayed.
     * 
     * @param {Object} item - The item to get text for.
     * @returns {string} The string representation of the item.
     */
    getItemText(item) {
        return item.toString();
    }

    /**
     * Selects an item by its ID, updates the selected item, and triggers
     * the onSelect callback if defined. Then, the list is re-rendered.
     * 
     * @param {number|string} id - The ID of the item to select.
     */
    selectItem(id) {
        this.selectedId = id;
        this.onSelect?.(id);  
        this.render(this.items);
    }

    /**
     * Sets the list of items and renders them.
     * 
     * @param {Array} items - The list of items to set and render.
     */
    setItems(items) {
        this.items = items;
        this.render(items);
    }
}