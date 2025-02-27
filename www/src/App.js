import { Navigation } from './components/Navigation.js';
import { MembersView } from './views/MembersView.js';
import { EventsView } from './views/EventsView.js';
import { EventTypesView } from './views/EventTypesView.js';

/**
 * App class that manages the main application logic.
 */
export class App {
    /**
     * Creates an instance of the App class.
     * @param {HTMLElement} container - The container element to hold the app's content.
     */
    constructor(container) {
        this.container = container;
        this.currentView = null;
        this.init();
    }

    /**
     * Initializes the app, sets up the navigation, and shows the default view.
     */
    init() {
        this.navigation = new Navigation(this);
        this.container.textContent = '';
        this.container.appendChild(this.navigation.element);

        this.mainContent = document.createElement('div');
        this.mainContent.className = 'main-content';
        this.container.appendChild(this.mainContent);

        this.showMembers();
    }

    /**
     * Displays the Members view.
     */
    showMembers() {
        this.setView(new MembersView());
    }

    /**
     * Displays the Events view.
     */
    showEvents() {
        this.setView(new EventsView());
    }

    /**
     * Displays the Event Types view.
     */
    showEventTypes() {
        this.setView(new EventTypesView());
    }

    /**
     * Sets the current view and updates the main content area.
     * @param {Object} view - The view to be set.
     * @param {HTMLElement} view.element - The DOM element associated with the view.
     */
    setView(view) {
        if (this.currentView) {
            this.currentView.destroy();
        }
        this.currentView = view;
        this.mainContent.textContent = '';
        this.mainContent.appendChild(view.element);
    }
}