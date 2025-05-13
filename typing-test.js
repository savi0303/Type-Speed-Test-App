import { getHighScores, updateHighScoresDisplay } from './scores.js';
import { debounce } from './utils.js';

// DOM Elements
const elements = {
    textDisplay: document.getElementById('text-display'),
    typingInput: document.getElementById('typing-input'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    timerElement: document.getElementById('timer'),
    wpmElement: document.getElementById('wpm'),
    accuracyElement: document.getElementById('accuracy'),
    correctWordsElement: document.getElementById('correct-words'),
    wrongWordsElement: document.getElementById('wrong-words'),
    difficultySelect: document.getElementById('difficulty'),
    timeSelect: document.getElementById('time')
};

// State
const state = {
    timer: null,
    timeLeft: 0,
    testActive: false,
    startTime: null,
    endTime: null,
    currentWordIndex: 0,
    correctWords: 0,
    wrongWords: 0,
    totalTypedChars: 0,
    incorrectChars: 0,
    currentText: [],
    typedWords: [] // Track completed typed words
};

// Sample texts
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

export function initTypingTest() {
    bindEvents();
    updateHighScoresDisplay();
    generateText();
}

function bindEvents() {
    elements.startBtn.addEventListener('click', startTest);
    elements.resetBtn.addEventListener('click', resetTest);
    elements.typingInput.addEventListener('input', debounce(checkInput, 50));
    elements.difficultySelect.addEventListener('change', handleDifficultyChange);
    elements.timeSelect.addEventListener('change', handleTimeChange);
}

function startTest() {
    if (state.testActive) return;
    
    try {
        state.testActive = true;
        state.startTime = new Date();
        state.currentWordIndex = 0;
        state.correctWords = 0;
        state.wrongWords = 0;
        state.totalTypedChars = 0;
        state.incorrectChars = 0;
        state.typedWords = [];

        generateText();
        elements.typingInput.disabled = false;
        elements.typingInput.focus();
        elements.startBtn.disabled = true;
        elements.resetBtn.disabled = false;

        resetStats();
        state.timeLeft = parseInt(elements.timeSelect.value);
        elements.timerElement.textContent = state.timeLeft;
        state.timer = setInterval(updateTimer, 1000);

        elements.textDisplay.children[0]?.classList.add('current');
    } catch (error) {
        handleError('Failed to start test', error);
    }
}

function resetTest() {
    try {
        clearInterval(state.timer);
        state.testActive = false;
        state.typedWords = [];
        elements.typingInput.disabled = true;
        elements.typingInput.value = '';
        elements.startBtn.disabled = false;
        elements.resetBtn.disabled = true;
        state.timeLeft = parseInt(elements.timeSelect.value);
        elements.timerElement.textContent = state.timeLeft;
        generateText();
    } catch (error) {
        handleError('Failed to reset test', error);
    }
}

function updateTimer() {
    state.timeLeft--;
    elements.timerElement.textContent = state.timeLeft;
    
    if (state.timeLeft <= 0) {
        endTest();
    }
}

function endTest() {
    try {
        clearInterval(state.timer);
        state.testActive = false;
        state.endTime = new Date();
        elements.typingInput.disabled = true;
        elements.startBtn.disabled = false;

        // Process any remaining typed word
        const currentTypedWord = elements.typingInput.value.trim();
        if (currentTypedWord && state.currentWordIndex < state.currentText.length) {
            state.typedWords.push(currentTypedWord);
            evaluateTypedWord(currentTypedWord, state.currentWordIndex);
        }

        const timeInMinutes = (state.endTime - state.startTime) / 60000;
        const wpm = Math.round(state.correctWords / timeInMinutes) || 0;
        const accuracy = state.totalTypedChars > 0 
            ? Math.round(((state.totalTypedChars - state.incorrectChars) / state.totalTypedChars) * 100) 
            : 0;

        elements.wpmElement.textContent = wpm;
        elements.accuracyElement.textContent = `${accuracy}%`;

        saveScore(wpm, accuracy, state.correctWords, state.wrongWords, elements.difficultySelect.value);
        updateHighScoresDisplay();
    } catch (error) {
        handleError('Failed to end test', error);
    }
}

function generateText() {
    try {
        const difficulty = elements.difficultySelect.value;
        const randomIndex = Math.floor(Math.random() * texts[difficulty].length);
        state.currentText = texts[difficulty][randomIndex].split(' ');
        
        elements.textDisplay.innerHTML = '';
        state.currentText.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            
            word.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            });
            
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            wordSpan.appendChild(spaceSpan);
            
            elements.textDisplay.appendChild(wordSpan);
        });
    } catch (error) {
        handleError('Failed to generate text', error);
    }
}

function checkInput() {
    if (!state.testActive) return;
    
    try {
        const inputValue = elements.typingInput.value;
        const wordElements = elements.textDisplay.children;

        // Clear previous 'current' class
        Array.from(wordElements).forEach(word => word.classList.remove('current'));

        // Handle word completion (space typed)
        if (inputValue.endsWith(' ')) {
            const currentTypedWord = inputValue.trim();
            if (currentTypedWord) {
                state.typedWords.push(currentTypedWord);
                evaluateTypedWord(currentTypedWord, state.currentWordIndex);
                state.currentWordIndex++;
                elements.typingInput.value = '';

                if (state.currentWordIndex >= state.currentText.length) {
                    endTest();
                    return;
                }
            }
            // Update current word highlight
            wordElements[state.currentWordIndex]?.classList.add('current');
        } else {
            // Highlight current word
            wordElements[state.currentWordIndex]?.classList.add('current');

            // Reset character classes for current word
            const currentWordElement = wordElements[state.currentWordIndex];
            if (currentWordElement) {
                const characters = currentWordElement.children;
                Array.from(characters).slice(0, -1).forEach(char => {
                    char.classList.remove('correct', 'incorrect');
                });

                // Check each character in real-time
                const currentTypedWord = inputValue.trim();
                currentTypedWord.split('').forEach((char, i) => {
                    if (i < characters.length - 1) {
                        const originalChar = characters[i].textContent;
                        if (char === originalChar) {
                            characters[i].classList.add('correct');
                        } else {
                            characters[i].classList.add('incorrect');
                        }
                    }
                });
            }
        }

        updateLiveStats();
    } catch (error) {
        handleError('Input processing failed', error);
    }
}

function evaluateTypedWord(typedWord, wordIndex) {
    if (wordIndex >= state.currentText.length) return;

    const originalWord = state.currentText[wordIndex];
    const wordElement = elements.textDisplay.children[wordIndex];
    
    // Reset character classes
    const characters = wordElement.children;
    Array.from(characters).slice(0, -1).forEach(char => {
        char.classList.remove('correct', 'incorrect');
    });

    // Evaluate characters
    let localIncorrectChars = 0;
    typedWord.split('').forEach((char, i) => {
        state.totalTypedChars++;
        if (i < originalWord.length) {
            const originalChar = originalWord[i];
            if (char === originalChar) {
                characters[i].classList.add('correct');
            } else {
                characters[i].classList.add('incorrect');
                localIncorrectChars++;
            }
        } else {
            state.totalTypedChars++;
            localIncorrectChars++;
        }
    });

    // Account for untyped characters in original word
    if (typedWord.length < originalWord.length) {
        state.totalTypedChars += originalWord.length - typedWord.length;
        localIncorrectChars += originalWord.length - typedWord.length;
    }

    state.incorrectChars += localIncorrectChars;

    // Update word counts
    if (typedWord === originalWord) {
        state.correctWords++;
        elements.correctWordsElement.textContent = state.correctWords;
    } else {
        state.wrongWords++;
        elements.wrongWordsElement.textContent = state.wrongWords;
    }
}

function updateLiveStats() {
    try {
        const elapsedTime = (new Date() - state.startTime) / 60000;
        const currentWPM = elapsedTime > 0 ? Math.round(state.correctWords / elapsedTime) : 0;
        const currentAccuracy = state.totalTypedChars > 0 
            ? Math.round(((state.totalTypedChars - state.incorrectChars) / state.totalTypedChars) * 100) 
            : 100;

        elements.wpmElement.textContent = currentWPM;
        elements.accuracyElement.textContent = `${currentAccuracy}%`;
    } catch (error) {
        handleError('Failed to update stats', error);
    }
}

function saveScore(wpm, accuracy, correct, wrong, difficulty) {
    try {
        const scores = getHighScores();
        const newScore = {
            date: new Date().toLocaleString(),
            wpm,
            accuracy,
            correctWords: correct,
            wrongWords: wrong,
            difficulty
        };

        scores.push(newScore);
        scores.sort((a, b) => b.wpm - a.wpm);
        if (scores.length > 5) scores.length = 5;

        localStorage.setItem('typingSpeedScores', JSON.stringify(scores));
    } catch (error) {
        handleError('Failed to save score', error);
    }
}

function resetStats() {
    elements.wpmElement.textContent = '0';
    elements.accuracyElement.textContent = '0%';
    elements.correctWordsElement.textContent = '0';
    elements.wrongWordsElement.textContent = '0';
}

function handleDifficultyChange() {
    if (!state.testActive) generateText();
}

function handleTimeChange() {
    if (!state.testActive) {
        state.timeLeft = parseInt(elements.timeSelect.value);
        elements.timerElement.textContent = state.timeLeft;
    }
}

function handleError(message, error) {
    console.error(message, error);
    alert(`${message}. Please try again.`);
}