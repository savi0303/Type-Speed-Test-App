// DOM Elements
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const correctWordsElement = document.getElementById('correct-words');
const wrongWordsElement = document.getElementById('wrong-words');
const difficultySelect = document.getElementById('difficulty');
const timeSelect = document.getElementById('time');
const highScoresContainer = document.getElementById('high-scores-container');
const noScoresElement = document.getElementById('no-scores');
const scoreListElement = document.getElementById('score-list');

// Global variables
let timer;
let timeLeft;
let testActive = false;
let startTime;
let endTime;
let currentWordIndex = 0;
let correctWords = 0;
let wrongWords = 0;
let totalTypedChars = 0;
let incorrectChars = 0;
let currentText = [];

// Sample texts for different difficulty levels
const texts = {
    easy: [
        "The quick brown fox jumps over the lazy dog. Simple sentences are easier to type.",
        "Typing practice helps improve your speed and accuracy over time.",
        "Learning to touch type is an essential skill for computer users.",
        "Regular practice is the key to becoming a faster typist.",
        "Focus on accuracy first, then speed will naturally follow."
    ],
    medium: [
        "The technology industry continues to evolve at an unprecedented pace, with new innovations emerging daily.",
        "Programming languages provide the foundation for software development, each with unique strengths and applications.",
        "Web development encompasses both frontend and backend technologies, requiring diverse skill sets.",
        "Artificial intelligence systems analyze vast amounts of data to recognize patterns and make predictions.",
        "Cybersecurity professionals protect digital infrastructure from various threats and vulnerabilities."
    ],
    hard: [
        "The intricate interplay between quantum mechanics and general relativity presents one of the most profound challenges in contemporary theoretical physics, requiring novel mathematical frameworks.",
        "Neuroplasticity, the brain's remarkable ability to reorganize synaptic connections, particularly in response to learning or experience, fundamentally challenges previous assumptions about neural development.",
        "The implementation of sophisticated cryptographic algorithms necessitates meticulous attention to pseudorandom number generation and mathematical properties that can withstand quantum computing attacks.",
        "Biodiversity conservation strategies must acknowledge the complex ecological interdependencies while simultaneously addressing anthropogenic climate change's accelerating impacts.",
        "The philosophical implications of consciousness remain contentious among researchers, with emergentism, panpsychism, and physicalism offering competing frameworks for understanding subjective experience."
    ]
};

// Initialize the application
function init() {
    bindEvents();
    loadHighScores();
    updateHighScoresDisplay();
}

// Bind event listeners
function bindEvents() {
    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    typingInput.addEventListener('input', checkInput);
    difficultySelect.addEventListener('change', () => {
        if (!testActive) {
            generateText();
        }
    });
    timeSelect.addEventListener('change', () => {
        if (!testActive) {
            timeLeft = parseInt(timeSelect.value);
            timerElement.textContent = timeLeft;
        }
    });
}

// Start the typing test
function startTest() {
    if (testActive) return;
    
    // Generate new text and prepare UI
    generateText();
    typingInput.disabled = false;
    typingInput.value = '';
    typingInput.focus();
    startBtn.disabled = true;
    resetBtn.disabled = false;
    
    // Reset tracking variables
    testActive = true;
    startTime = new Date();
    currentWordIndex = 0;
    correctWords = 0;
    wrongWords = 0;
    totalTypedChars = 0;
    incorrectChars = 0;
    
    // Reset display
    wpmElement.textContent = '0';
    accuracyElement.textContent = '0%';
    correctWordsElement.textContent = '0';
    wrongWordsElement.textContent = '0';
    
    // Set and start timer
    timeLeft = parseInt(timeSelect.value);
    timerElement.textContent = timeLeft;
    timer = setInterval(updateTimer, 1000);
    
    // Add current class to first word
    textDisplay.children[0].classList.add('current');
}

// Reset the typing test
function resetTest() {
    // Clear timer and reset state
    clearInterval(timer);
    testActive = false;
    
    // Reset UI
    typingInput.disabled = true;
    typingInput.value = '';
    startBtn.disabled = false;
    resetBtn.disabled = true;
    timeLeft = parseInt(timeSelect.value);
    timerElement.textContent = timeLeft;
    
    // Clear text display classes
    generateText();
}

// Update timer and end test if time is up
function updateTimer() {
    timeLeft--;
    timerElement.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endTest();
    }
}

// End the typing test
function endTest() {
    clearInterval(timer);
    testActive = false;
    endTime = new Date();
    typingInput.disabled = true;
    startBtn.disabled = false;
    
    // Calculate final stats
    const timeInMinutes = (endTime - startTime) / 60000; // convert ms to minutes
    const wpm = Math.round(correctWords / timeInMinutes);
    const accuracy = totalTypedChars > 0 ? Math.round(((totalTypedChars - incorrectChars) / totalTypedChars) * 100) : 0;
    
    // Update UI with final stats
    wpmElement.textContent = wpm;
    accuracyElement.textContent = `${accuracy}%`;
    
    // Save score
    saveScore(wpm, accuracy, correctWords, wrongWords, difficultySelect.value);
    updateHighScoresDisplay();
}

// Generate and display text based on selected difficulty
function generateText() {
    const difficulty = difficultySelect.value;
    const randomIndex = Math.floor(Math.random() * texts[difficulty].length);
    const text = texts[difficulty][randomIndex];
    currentText = text.split(' ');
    
    // Create HTML for text display
    textDisplay.innerHTML = '';
    currentText.forEach(word => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        
        // Create spans for each character
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });
        
        // Add space after word
        const spaceSpan = document.createElement('span');
        spaceSpan.textContent = ' ';
        wordSpan.appendChild(spaceSpan);
        
        textDisplay.appendChild(wordSpan);
    });
}

// Check user input against the text
function checkInput() {
    if (!testActive) return;
    
    const typedWords = typingInput.value.trim().split(' ');
    const currentTypedWord = typedWords[typedWords.length - 1];
    const wordElements = textDisplay.children;
    
    // Remove previous current class
    for (let i = 0; i < wordElements.length; i++) {
        wordElements[i].classList.remove('current');
    }
    
    // Update current word if space was typed
    if (typingInput.value.endsWith(' ')) {
        // Check if the previously typed word was correct
        const previousTypedWord = typedWords[typedWords.length - 2];
        if (previousTypedWord && previousTypedWord === currentText[currentWordIndex]) {
            correctWords++;
            correctWordsElement.textContent = correctWords;
        } else if (previousTypedWord) {
            wrongWords++;
            wrongWordsElement.textContent = wrongWords;
        }
        
        // Move to next word
        currentWordIndex++;
        typingInput.value = '';
        
        // Check if test is complete
        if (currentWordIndex >= currentText.length) {
            endTest();
            return;
        }
        
        // Add current class to new current word
        if (wordElements[currentWordIndex]) {
            wordElements[currentWordIndex].classList.add('current');
        }
        
        return;
    }
    
    // Add current class to current word
    if (wordElements[currentWordIndex]) {
        wordElements[currentWordIndex].classList.add('current');
    }
    
    // Check characters of current word
    if (wordElements[currentWordIndex]) {
        const currentWordElement = wordElements[currentWordIndex];
        const characters = currentWordElement.children;
        
        // Reset classes
        for (let i = 0; i < characters.length - 1; i++) { // -1 to exclude space
            characters[i].classList.remove('correct', 'incorrect');
        }
        
        // Check each character
        for (let i = 0; i < currentTypedWord.length; i++) {
            totalTypedChars++;
            
            if (i < characters.length - 1) { // -1 to exclude space
                const char = currentTypedWord[i];
                const originalChar = characters[i].textContent;
                
                if (char === originalChar) {
                    characters[i].classList.add('correct');
                } else {
                    characters[i].classList.add('incorrect');
                    incorrectChars++;
                }
            }
        }
    }
    
    // Calculate and update live stats
    if (testActive) {
        const elapsedTime = (new Date() - startTime) / 60000; // convert ms to minutes
        const currentWPM = Math.round(correctWords / elapsedTime) || 0;
        const currentAccuracy = totalTypedChars > 0 ? 
            Math.round(((totalTypedChars - incorrectChars) / totalTypedChars) * 100) : 100;
        
        wpmElement.textContent = currentWPM;
        accuracyElement.textContent = `${currentAccuracy}%`;
    }
}

// Save score to local storage
function saveScore(wpm, accuracy, correct, wrong, difficulty) {
    const scores = getHighScores();
    const newScore = {
        date: new Date().toLocaleDateString(),
        wpm,
        accuracy,
        correctWords: correct,
        wrongWords: wrong,
        difficulty
    };
    
    scores.push(newScore);
    scores.sort((a, b) => b.wpm - a.wpm); // Sort by WPM descending
    
    // Keep only top 5 scores
    if (scores.length > 5) {
        scores.length = 5;
    }
    
    localStorage.setItem('typingSpeedScores', JSON.stringify(scores));
}

// Get high scores from local storage
function getHighScores() {
    const scores = localStorage.getItem('typingSpeedScores');
    return scores ? JSON.parse(scores) : [];
}

// Load high scores from local storage
function loadHighScores() {
    const scores = getHighScores();
    if (scores.length === 0) {
        noScoresElement.style.display = 'block';
        scoreListElement.style.display = 'none';
    } else {
        noScoresElement.style.display = 'none';
        scoreListElement.style.display = 'block';
    }
}

// Update high scores display
function updateHighScoresDisplay() {
    const scores = getHighScores();
    
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
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);