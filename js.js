const testData = {
    tests: [
        {
            id: "TESDDG",
            name: "TES DDG",
            description: "Tes Desain Grafis Digital",
            duration: 300, // 5 minutes in seconds
            questions: [
                {
                    question: "Format file yang digunakann untuk menyimpan file animasi adalah....",
                    options: ["JPEG", "GIF", "PNG", "TITF", "BMP"],
                    answer: 1 // Index of correct answer (GIF)
                },
                {
                    question: "Ketika diperbesar tidak akan blur merupakan ciri-ciri gambar....",
                    options: ["Bitmap", "Vektor", "Grafis", "Grafik", "Ilustrasi"],
                    answer: 1 // Index of correct answer (Vektor)
                },
                {
                    question: "Software berikut yang termasuk ke dalam pengolah gambar vektor adalah...",
                    options: ["Adobe Photoshop", "CorelDRAW", "Adobe Lightroom", "GIMP", "Paint"],
                    answer: 1 // Index of correct answer (CorelDRAW)
                }
            ]
        }
    ]
};

// App state
const state = {
    currentTest: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    flaggedQuestions: [],
    timeLeft: 0,
    timerInterval: null
};

// DOM elements
const appElement = document.getElementById('app');

// Render functions
function renderHome() {
    appElement.innerHTML = `
        <header>
            <h1>SELAMAT DATANG DI GABTI</h1>
        </header>
        <div class="tes-container">
            <h3>Daftar Tes</h3>
            <div class="daftar-tes">
                <ul>
                    ${testData.tests.map(test => `
                        <li>
                            <span>${test.name}</span>
                            <a href="#" class="mulai-tes" data-test-id="${test.id}">MULAI TES</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    // Add event listeners to test buttons
    document.querySelectorAll('.mulai-tes').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const testId = button.getAttribute('data-test-id');
            startTest(testId);
        });
    });
}

function startTest(testId) {
    state.currentTest = testData.tests.find(test => test.id === testId);
    state.currentQuestionIndex = 0;
    state.userAnswers = Array(state.currentTest.questions.length).fill(null);
    state.flaggedQuestions = Array(state.currentTest.questions.length).fill(false);
    state.timeLeft = state.currentTest.duration;
    
    // Start timer
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(updateTimer, 1000);
    
    renderQuestion();
}

function updateTimer() {
    state.timeLeft--;
    
    if (state.timeLeft <= 0) {
        clearInterval(state.timerInterval);
        finishTest();
        return;
    }
    
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function renderQuestion() {
    const question = state.currentTest.questions[state.currentQuestionIndex];
    const isFlagged = state.flaggedQuestions[state.currentQuestionIndex];
    const userAnswer = state.userAnswers[state.currentQuestionIndex];
    
    appElement.innerHTML = `
        <div class="timer" id="timer">
            ${Math.floor(state.timeLeft / 60)}:${(state.timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <header>
            <h1>${state.currentTest.name}</h1>
        </header>
        <div class="soal">
            <div class="soal1">
                <p>${question.question}</p>
                ${question.options.map((option, index) => `
                    <label>
                        <input type="radio" name="jawaban" value="${index}" 
                            ${userAnswer === index ? 'checked' : ''}>
                        ${option}
                    </label>
                `).join('')}
                <div class="navigasi">
                    <div>
                        <label class="ragu-ragu">
                            <input type="checkbox" name="ragu-ragu" id="ragu-ragu" 
                                ${isFlagged ? 'checked' : ''}>
                            Ragu-Ragu
                        </label>
                    </div>
                    <div class="button-group">
                        ${state.currentQuestionIndex > 0 ? `
                            <button id="prev-btn">Sebelumnya</button>
                        ` : ''}
                        ${state.currentQuestionIndex < state.currentTest.questions.length - 1 ? `
                            <button id="next-btn">Selanjutnya</button>
                        ` : `
                            <button id="finish-btn">Selesai</button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.querySelectorAll('input[name="jawaban"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.userAnswers[state.currentQuestionIndex] = parseInt(e.target.value);
        });
    });
    
    document.getElementById('ragu-ragu').addEventListener('change', (e) => {
        state.flaggedQuestions[state.currentQuestionIndex] = e.target.checked;
    });
    
    if (document.getElementById('prev-btn')) {
        document.getElementById('prev-btn').addEventListener('click', () => {
            navigateQuestion(-1);
        });
    }
    
    if (document.getElementById('next-btn')) {
        document.getElementById('next-btn').addEventListener('click', () => {
            navigateQuestion(1);
        });
    }
    
    if (document.getElementById('finish-btn')) {
        document.getElementById('finish-btn').addEventListener('click', finishTest);
    }
}

function navigateQuestion(direction) {
    // Save current answer before navigating
    const selectedAnswer = document.querySelector('input[name="jawaban"]:checked');
    if (selectedAnswer) {
        state.userAnswers[state.currentQuestionIndex] = parseInt(selectedAnswer.value);
    }
    
    state.currentQuestionIndex += direction;
    renderQuestion();
}

function finishTest() {
    clearInterval(state.timerInterval);
    
    // Calculate score and stats
    let correctAnswers = 0;
    let flaggedCount = state.flaggedQuestions.filter(f => f).length;
    
    state.currentTest.questions.forEach((question, index) => {
        if (state.userAnswers[index] === question.answer) {
            correctAnswers++;
        }
    });
    
    const totalQuestions = state.currentTest.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const incorrectAnswers = totalQuestions - correctAnswers;
    
    // Render results
    appElement.innerHTML = `
        <header>
            <h1>HASIL TES ${state.currentTest.name}</h1>
        </header>
        <div class="result-container">
            <h2>Test Selesai!</h2>
            
            <div class="score-display">
                <div class="score-text">Nilai Anda:</div>
                <div class="score">${correctAnswers}/${totalQuestions}</div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                </div>
            </div>
            
            <div class="stats-container">
                <div class="stat-box">
                    <div class="stat-number">${correctAnswers}</div>
                    <div class="stat-label">Jawaban Benar</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${incorrectAnswers}</div>
                    <div class="stat-label">Jawaban Salah</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${flaggedCount}</div>
                    <div class="stat-label">Ditandai Ragu-ragu</div>
                </div>
            </div>
            
            <div class="question-results">
                <h3>Detail Jawaban:</h3>
                ${state.currentTest.questions.map((question, index) => {
                    const userAnswer = state.userAnswers[index];
                    const userAnswerText = userAnswer !== null ? question.options[userAnswer] : 'Tidak dijawab';
                    const isCorrect = userAnswer === question.answer;
                    const isFlagged = state.flaggedQuestions[index];
                    
                    return `
                        <div class="question-item">
                            <p class="question-text"><strong>Soal ${index + 1}:</strong> ${question.question}</p>
                            <p class="user-answer">Jawaban Anda: ${userAnswerText}</p>
                            <p class="correct-answer">Jawaban Benar: ${question.options[question.answer]}</p>
                            <p class="${isCorrect ? 'correct' : 'incorrect'}">
                                ${isCorrect ? '✓ Benar' : '✗ Salah'}
                            </p>
                            ${isFlagged ? '<p class="flagged">★ Ditandai ragu-ragu</p>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <button class="back-to-home" id="back-to-home">Kembali ke Halaman Utama</button>
        </div>
    `;
    
    // Animate progress bar
    setTimeout(() => {
        document.querySelector('.progress-bar').style.width = `${percentage}%`;
    }, 100);
    
    document.getElementById('back-to-home').addEventListener('click', (e) => {
        e.preventDefault();
        renderHome();
    });
}

// Initialize the app
renderHome();