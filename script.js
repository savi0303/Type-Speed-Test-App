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