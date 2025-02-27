/**
 * BaseView class is a base class for creating views that display content
 * within a section element. It handles the creation of the section and title, 
 * as well as providing hooks for customizing content and destroying the view.
 * 
 * @class BaseView
 */
export class BaseView {
    /**
     * Creates an instance of the BaseView.
     * 
     * @param {string} title - The title of the view.
     */
    constructor(title) {
        this.element = this.createElement();
        this.title = title;
        this.init();
    }

    /**
     * Creates the main HTML element (a section) for the view.
     * 
     * @returns {HTMLElement} The section element.
     */
    createElement() {
        const section = document.createElement('section');
        section.className = 'section';
        return section;
    }

    /**
     * Initializes the view by creating the title and calling the method
     * to create the content.
     */
    init() {
        const title = document.createElement('h2');
        title.textContent = this.title;
        this.element.appendChild(title);

        this.createContent();
    }

    /**
     * This method can be overridden by subclasses to customize the content
     * of the view. By default, it does nothing.
     */
    createContent() {
    }

    /**
     * This method can be overridden by subclasses to clean up or destroy 
     * the view when it is no longer needed. By default, it does nothing.
     */
    destroy() {
    }
}