import { App } from './App.js';

/**
 * Initializes the app once the DOM content has fully loaded.
 * @listens document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    /** @type {HTMLElement} */
    const container = document.querySelector('main');
    if (container) {
        new App(container);
    }
});