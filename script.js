import { initTypingTest } from './typing-test.js';
import { initThemeToggle } from './theme.js';
import { initScoreExport } from './scores.js';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    try {
        initTypingTest();
        initThemeToggle();
        initScoreExport();
    } catch (error) {
        console.error('Application initialization failed:', error);
        alert('Failed to initialize the application. Please try refreshing the page.');
    }
});