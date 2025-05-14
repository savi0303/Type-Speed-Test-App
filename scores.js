// scores.js - No more export/import
function getHighScores() {
    try {
        const scores = localStorage.getItem('typingSpeedScores');
        return scores ? JSON.parse(scores) : [];
    } catch (error) {
        console.error('Failed to get high scores:', error);
        return [];
    }
}

function updateHighScoresDisplay() {
    try {
        const scores = getHighScores();
        const noScoresElement = document.getElementById('no-scores');
        const scoreListElement = document.getElementById('score-list');

        if (scores.length === 0) {
            noScoresElement.style.display = 'block';
            scoreListElement.style.display = 'none';
            return;
        }

        noScoresElement.style.display = 'none';
        scoreListElement.style.display = 'block';
        scoreListElement.innerHTML = '';

        scores.forEach(score => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            
            const scoreDate = document.createElement('div');
            scoreDate.className = 'score-date';
            scoreDate.textContent = `${score.date} (${score.difficulty})`;
            
            const scoreStats = document.createElement('div');
            scoreStats.className = 'score-stats';
            scoreStats.innerHTML = `WPM: <span>${score.wpm}</span> Accuracy: <span>${score.accuracy}%</span>`;
            
            scoreItem.appendChild(scoreDate);
            scoreItem.appendChild(scoreStats);
            scoreListElement.appendChild(scoreItem);
        });
    } catch (error) {
        console.error('Failed to update high scores display:', error);
    }
}

function initScoreExport() {
    const exportBtn = document.getElementById('export-scores');
    exportBtn.addEventListener('click', exportScores);
}

function exportScores() {
    try {
        const scores = getHighScores();
        if (scores.length === 0) {
            alert('No scores to export!');
            return;
        }

        // Format scores as plain text
        const txtContent = [
            'Typing Speed Test Results',
            '========================',
            ...scores.map((score, index) => 
                `Score ${index + 1}:\n` +
                `Date: ${score.date}\n` +
                `Difficulty: ${score.difficulty}\n` +
                `WPM: ${score.wpm}\n` +
                `Accuracy: ${score.accuracy}%\n` +
                `Correct Words: ${score.correctWords}\n` +
                `Wrong Words: ${score.wrongWords}\n`
            ),
            '========================'
        ].join('\n');

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'typing_scores.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export scores:', error);
        alert('Failed to export scores. Please try again.');
    }
}