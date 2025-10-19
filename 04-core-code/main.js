// File: 04-core-code/main.js

import { AppContext } from './app-context.js';
import { EVENTS } from './config/constants.js';
import * as uiActions from './actions/ui-actions.js';

class App {
    constructor() {
        this.appContext = new AppContext();
    }

    async _loadPartials() {
        const partialsConfig = this.appContext.get('paths').partials;
        const partialsContainer = document.getElementById('partials-container');
        if (!partialsContainer) {
            console.error('Partials container not found.');
            return;
        }

        const fetchPromises = Object.entries(partialsConfig).map(async ([key, path]) => {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Failed to load ${path}: ${response.statusText}`);
                }
                return await response.text();
            } catch (error) {
                console.error(error);
                return ''; // Return empty string on error to not break Promise.all
            }
        });

        const partialsHtml = await Promise.all(fetchPromises);
        partialsContainer.innerHTML = partialsHtml.join('');
    }

    async run() {
        console.log("Application starting...");

        try {
            // Phase 1: Initialize core non-UI services
            this.appContext.initialize();

            // Phase 2: Load HTML templates
            await this._loadPartials();

            // Phase 3: Initialize UI components that depend on the DOM
            this.appContext.initializeUIComponents();

            // [FIX] Per expert guidance, clear any lingering selections after UI initialization
            // and before the app becomes interactive. This is the root fix for the startup highlight bug.
            const stateService = this.appContext.get('stateService');
            stateService.dispatch(uiActions.clearMultiSelectSelection());

            // Phase 4: Get the controller and run the main application logic
            const appController = this.appContext.get('appController');
            appController.run();

        } catch (error) {
            console.error("A critical error occurred during application startup:", error);
            // Optionally, display a user-friendly error message on the screen
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.run();
    console.log("Application running and interactive.");
});