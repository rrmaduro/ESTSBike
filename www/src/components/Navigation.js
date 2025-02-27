/**
 * Navigation class creates and manages a navigation bar with tabs for
 * different sections (Membros, Eventos, and Tipos de Eventos). It allows
 * switching between these sections and highlights the active tab.
 * 
 * @class Navigation
 */
export class Navigation {
    /**
     * Creates an instance of the Navigation class.
     * 
     * @param {Object} app - The application object that provides methods to show different sections.
     */
    constructor(app) {
        this.app = app;
        this.element = null;
        this.init();
    }

    /**
     * Initializes the navigation bar by creating the navigation element.
     */
    init() {
        this.element = this.createElement();
    }

    /**
     * Creates the HTML structure for the navigation bar with buttons for
     * different sections and attaches click event listeners to switch views.
     * 
     * @returns {HTMLElement} The navigation element containing buttons.
     */
    createElement() {
        const nav = document.createElement('nav');
        nav.className = 'nav-tabs';
        
        const membersBtn = document.createElement('button');
        membersBtn.textContent = 'Membros';
        membersBtn.onclick = () => {
            this.setActiveButton(membersBtn);
            this.app.showMembers();
        };
        
        const eventsBtn = document.createElement('button');
        eventsBtn.textContent = 'Eventos';
        eventsBtn.onclick = () => {
            this.setActiveButton(eventsBtn);
            this.app.showEvents();
        };
        
        const eventTypesBtn = document.createElement('button');
        eventTypesBtn.textContent = 'Tipos de Eventos';
        eventTypesBtn.onclick = () => {
            this.setActiveButton(eventTypesBtn);
            this.app.showEventTypes();
        };
        
        nav.append(membersBtn, eventsBtn, eventTypesBtn);
        
        this.setActiveButton(membersBtn);
        
        return nav;
    }

    /**
     * Sets the specified button as the active one by adding the 'active' class
     * and removing it from all other buttons.
     * 
     * @param {HTMLElement} activeButton - The button element to set as active.
     */
    setActiveButton(activeButton) {
        if (this.element) {
            this.element.querySelectorAll('button').forEach(button => {
                button.classList.remove('active');
            });
            activeButton.classList.add('active');
        }
    }
}