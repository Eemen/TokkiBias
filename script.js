class QuizApp {
    constructor() {
        this.starterMessage = document.getElementById('starter-message');
        this.quizSection = document.getElementById('quiz-section');
        this.resultsSection = document.getElementById('results-section');
        this.currentQuestion = 0;
        this.scores = {
            Minji: 0,
            Hanni: 0,
            Danielle: 0,
            Haerin: 0,
            Hyein: 0
        };
        this.questions = [];
        this.biasDescriptions = {};
        
        this.init();
    }

    async init() {
        try {
            // Load quiz data
            const response = await fetch('data.json');
            const jsonData = await response.json();
            
            // Set questions and bias descriptions from JSON
            this.questions = jsonData.questions;
            this.biasDescriptions = jsonData.biasDescriptions;

            // Load starter message
            const msgResponse = await fetch('startermsg.md');
            const msgText = await msgResponse.text();
            this.starterMessage.querySelector('.message-content').textContent = 
                msgText.replace('```markdown:startermsg.md\n', '').replace('\n```', '');

            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing quiz:', error);
        }
    }

    setupEventListeners() {
        this.starterMessage.querySelector('.next-button').addEventListener('click', () => {
            this.starterMessage.classList.add('hidden');
            this.quizSection.classList.remove('hidden');
            this.showQuestion();
        });

        document.querySelector('.try-again-button').addEventListener('click', () => {
            this.resetQuiz();
        });
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        
        questionText.textContent = question.question;
        optionsContainer.innerHTML = '';

        // Create a copy of the options array and shuffle it
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.innerHTML = `${option.emoji} ${option.text}`;
            button.addEventListener('click', () => this.handleAnswer(option.points));
            optionsContainer.appendChild(button);
        });

        this.updateProgress();
    }

    handleAnswer(points) {
        Object.keys(points).forEach(member => {
            this.scores[member] += points[member];
        });

        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    }

    updateProgress() {
        const progress = (this.currentQuestion / this.questions.length) * 100;
        document.querySelector('.progress').style.width = `${progress}%`;
    }

    showResults() {
        this.quizSection.classList.add('hidden');
        this.resultsSection.classList.remove('hidden');

        const scoresContainer = document.getElementById('scores-container');
        scoresContainer.innerHTML = '';

        const maxScore = Math.max(...Object.values(this.scores));
        const topBias = Object.keys(this.scores).find(key => this.scores[key] === maxScore);

        // Use the bias descriptions from JSON
        const biasDescription = document.getElementById('bias-description');
        biasDescription.innerHTML = `
            <p><strong>Your Bias is ${topBias}!</strong></p>
            <p>${this.biasDescriptions[topBias]}</p>
        `;

        // Display scores
        Object.entries(this.scores)
            .sort((a, b) => b[1] - a[1])
            .forEach(([member, score]) => {
                const percentage = (score / maxScore) * 100;
                const scoreBar = `
                    <div class="score-bar">
                        <div class="score-label">
                            <span>${member}</span>
                            <span>${Math.round(percentage)}%</span>
                        </div>
                        <div class="score-progress">
                            <div class="score-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
                scoresContainer.innerHTML += scoreBar;
            });
    }

    resetQuiz() {
        this.currentQuestion = 0;
        Object.keys(this.scores).forEach(key => this.scores[key] = 0);
        this.resultsSection.classList.add('hidden');
        this.quizSection.classList.remove('hidden');
        this.showQuestion();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
}); 