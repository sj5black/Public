// 사용자 정보
let userInfo = {
    username: '',
    avatar: 'esset/boy1.png'
};

// 게임 상태
let gameState = {
    quizType: 'vocab', // 'vocab' 또는 'toeic'
    difficulty: 'easy',
    score: 0,
    combo: 0,
    maxCombo: 0,
    questionNum: 0,
    totalQuestions: 10,
    correctCount: 0,
    incorrectCount: 0,
    currentQuestion: null,
    timer: 30,
    timerInterval: null,
    isAnswered: false,
    questions: [],
    selectedAvatar: 'esset/boy1.png',
    participants: [], // 참가자 목록
    chatMessages: [], // 채팅 메시지
    chatOpen: true // 채팅창 열림 상태
};

// 로그인
function login() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        alert('닉네임을 입력해주세요!');
        return;
    }
    
    userInfo.username = username;
    userInfo.avatar = gameState.selectedAvatar;
    
    // localStorage에 저장
    localStorage.setItem('quizQuiz_user', JSON.stringify(userInfo));
    
    // 화면 전환
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
    
    updateUserDisplay();
}

// 로그아웃
function logout() {
    localStorage.removeItem('quizQuiz_user');
    userInfo = { username: '', avatar: 'esset/boy1.png' };
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('username').value = '';
    gameState.selectedAvatar = 'esset/boy1.png';
    updateAvatarSelection();
}

// 아바타 선택
function selectAvatar(avatar) {
    gameState.selectedAvatar = avatar;
    updateAvatarSelection();
}

// 아바타 선택 UI 업데이트
function updateAvatarSelection() {
    document.querySelectorAll('.avatar-option').forEach(option => {
        if (option.dataset.avatar === gameState.selectedAvatar) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// 사용자 정보 표시 업데이트
function updateUserDisplay() {
    const userAvatarImg = document.getElementById('userAvatarImg');
    const gameUserAvatarImg = document.getElementById('gameUserAvatarImg');
    
    if (userAvatarImg) {
        userAvatarImg.src = userInfo.avatar;
        userAvatarImg.alt = userInfo.username;
    }
    if (gameUserAvatarImg) {
        gameUserAvatarImg.src = userInfo.avatar;
        gameUserAvatarImg.alt = userInfo.username;
    }
    
    document.getElementById('userName').textContent = userInfo.username;
    document.getElementById('gameUserName').textContent = userInfo.username;
}

// 로그인 상태 확인
function checkLogin() {
    const savedUser = localStorage.getItem('quizQuiz_user');
    if (savedUser) {
        userInfo = JSON.parse(savedUser);
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('startScreen').classList.add('active');
        updateUserDisplay();
    }
}

// 문제 유형 선택
function selectQuizType(type) {
    gameState.quizType = type;
    document.querySelectorAll('.quiz-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
}

// 게임 시작 (수정)
function startGame(difficulty) {
    if (!userInfo.username) {
        alert('먼저 로그인해주세요!');
        document.getElementById('startScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        return;
    }
    
    gameState.difficulty = difficulty;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.questionNum = 0;
    gameState.correctCount = 0;
    gameState.incorrectCount = 0;
    gameState.isAnswered = false;
    
    // 참가자 초기화 (현재 사용자 추가)
    gameState.participants = [{
        username: userInfo.username,
        avatar: userInfo.avatar,
        score: 0
    }];
    
    // 봇 참가자 추가 (예시)
    const botAvatars = ['esset/boy1.png', 'esset/boy2.png', 'esset/girl1.png', 'esset/girl2.png'];
    const botNames = ['퀴즈왕', '영어고수', '단어달인', '문법마스터', '영어천재', '토익만점'];
    
    const usedNames = new Set();
    usedNames.add(userInfo.username);
    
    for (let i = 0; i < 3; i++) {
        let randomName;
        let attempts = 0;
        do {
            randomName = botNames[Math.floor(Math.random() * botNames.length)];
            attempts++;
        } while (usedNames.has(randomName) && attempts < 20);
        
        if (!usedNames.has(randomName)) {
            const randomAvatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];
            gameState.participants.push({
                username: randomName,
                avatar: randomAvatar,
                score: 0
            });
            usedNames.add(randomName);
        }
    }
    
    // 문제 유형에 따라 다른 문제 로드
    if (gameState.quizType === 'vocab') {
        loadVocabQuestions(difficulty);
    } else {
        loadToeicQuestions(difficulty);
    }
    
    // 화면 전환
    document.getElementById('startScreen').classList.remove('active');
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.style.display = 'flex';
    gameScreen.classList.add('active');
    
    // 참가자 목록 업데이트
    updateParticipants();
    
    // 채팅 초기 메시지
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        addChatMessage('시스템', '게임이 시작되었습니다!', 'esset/boy1.png');
        setTimeout(() => {
            addChatMessage('시스템', '모두 화이팅하세요!', 'esset/boy1.png');
        }, 500);
    }
    
    // 첫 문제 로드
    loadNextQuestion();
}

// 단어 퀴즈 문제 로드
function loadVocabQuestions(difficulty) {
    const allQuestions = [...questionsDatabase[difficulty]];
    gameState.questions = [];
    for (let i = 0; i < gameState.totalQuestions; i++) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        gameState.questions.push(allQuestions[randomIndex]);
        allQuestions.splice(randomIndex, 1);
    }
}

// 토익 RC 문제 로드
function loadToeicQuestions(difficulty) {
    const allQuestions = [...toeicQuestionsDatabase[difficulty]];
    gameState.questions = [];
    for (let i = 0; i < gameState.totalQuestions; i++) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        gameState.questions.push(allQuestions[randomIndex]);
        allQuestions.splice(randomIndex, 1);
    }
}

// 문제 데이터베이스
const questionsDatabase = {
    easy: [
        { word: 'apple', meaning: '사과', type: '영한' },
        { word: 'book', meaning: '책', type: '영한' },
        { word: 'cat', meaning: '고양이', type: '영한' },
        { word: 'dog', meaning: '개', type: '영한' },
        { word: 'elephant', meaning: '코끼리', type: '영한' },
        { word: 'fish', meaning: '물고기', type: '영한' },
        { word: 'house', meaning: '집', type: '영한' },
        { word: 'ice', meaning: '얼음', type: '영한' },
        { word: 'jump', meaning: '뛰다', type: '영한' },
        { word: 'key', meaning: '열쇠', type: '영한' },
        { word: 'love', meaning: '사랑', type: '영한' },
        { word: 'moon', meaning: '달', type: '영한' },
        { word: 'nose', meaning: '코', type: '영한' },
        { word: 'orange', meaning: '오렌지', type: '영한' },
        { word: 'pen', meaning: '펜', type: '영한' },
        { word: 'queen', meaning: '여왕', type: '영한' },
        { word: 'rain', meaning: '비', type: '영한' },
        { word: 'sun', meaning: '태양', type: '영한' },
        { word: 'tree', meaning: '나무', type: '영한' },
        { word: 'umbrella', meaning: '우산', type: '영한' },
        { word: 'water', meaning: '물', type: '영한' },
        { word: 'yellow', meaning: '노란색', type: '영한' },
        { word: 'zoo', meaning: '동물원', type: '영한' },
        { word: 'car', meaning: '자동차', type: '영한' },
        { word: 'door', meaning: '문', type: '영한' }
    ],
    medium: [
        { word: 'beautiful', meaning: '아름다운', type: '영한' },
        { word: 'challenge', meaning: '도전', type: '영한' },
        { word: 'discover', meaning: '발견하다', type: '영한' },
        { word: 'education', meaning: '교육', type: '영한' },
        { word: 'freedom', meaning: '자유', type: '영한' },
        { word: 'generous', meaning: '관대한', type: '영한' },
        { word: 'happiness', meaning: '행복', type: '영한' },
        { word: 'important', meaning: '중요한', type: '영한' },
        { word: 'journey', meaning: '여행', type: '영한' },
        { word: 'knowledge', meaning: '지식', type: '영한' },
        { word: 'language', meaning: '언어', type: '영한' },
        { word: 'mountain', meaning: '산', type: '영한' },
        { word: 'nature', meaning: '자연', type: '영한' },
        { word: 'opportunity', meaning: '기회', type: '영한' },
        { word: 'perfect', meaning: '완벽한', type: '영한' },
        { word: 'question', meaning: '질문', type: '영한' },
        { word: 'remember', meaning: '기억하다', type: '영한' },
        { word: 'success', meaning: '성공', type: '영한' },
        { word: 'together', meaning: '함께', type: '영한' },
        { word: 'understand', meaning: '이해하다', type: '영한' },
        { word: 'victory', meaning: '승리', type: '영한' },
        { word: 'wonderful', meaning: '훌륭한', type: '영한' },
        { word: 'excellent', meaning: '훌륭한', type: '영한' },
        { word: 'different', meaning: '다른', type: '영한' },
        { word: 'complete', meaning: '완전한', type: '영한' }
    ],
    hard: [
        { word: 'abundance', meaning: '풍부함', type: '영한' },
        { word: 'benevolent', meaning: '자비로운', type: '영한' },
        { word: 'conscientious', meaning: '양심적인', type: '영한' },
        { word: 'diligent', meaning: '성실한', type: '영한' },
        { word: 'eloquent', meaning: '웅변의', type: '영한' },
        { word: 'formidable', meaning: '무서운', type: '영한' },
        { word: 'gregarious', meaning: '사교적인', type: '영한' },
        { word: 'hierarchy', meaning: '계층', type: '영한' },
        { word: 'indigenous', meaning: '토착의', type: '영한' },
        { word: 'juxtapose', meaning: '나란히 놓다', type: '영한' },
        { word: 'kaleidoscope', meaning: '만화경', type: '영한' },
        { word: 'labyrinth', meaning: '미로', type: '영한' },
        { word: 'magnificent', meaning: '장대한', type: '영한' },
        { word: 'nonchalant', meaning: '무관심한', type: '영한' },
        { word: 'omnipotent', meaning: '전능한', type: '영한' },
        { word: 'paradox', meaning: '역설', type: '영한' },
        { word: 'quintessential', meaning: '전형적인', type: '영한' },
        { word: 'resilient', meaning: '탄력있는', type: '영한' },
        { word: 'sophisticated', meaning: '세련된', type: '영한' },
        { word: 'tremendous', meaning: '엄청난', type: '영한' },
        { word: 'ubiquitous', meaning: '어디에나 있는', type: '영한' },
        { word: 'vulnerable', meaning: '취약한', type: '영한' },
        { word: 'wondrous', meaning: '놀라운', type: '영한' },
        { word: 'xenophobia', meaning: '외국인 혐오', type: '영한' },
        { word: 'zealous', meaning: '열광적인', type: '영한' }
    ]
};

// 토익 Part 5 RC 문제 데이터베이스
const toeicQuestionsDatabase = {
    easy: [
        {
            sentence: 'The company _____ a new product next month.',
            options: ['will launch', 'launch', 'launched', 'launching'],
            correct: 0,
            explanation: '미래 시제 "will launch"가 적절합니다.'
        },
        {
            sentence: 'Please submit your report _____ Friday.',
            options: ['on', 'at', 'in', 'by'],
            correct: 3,
            explanation: '"by"는 "~까지"의 의미로 마감일을 나타냅니다.'
        },
        {
            sentence: 'The meeting was _____ by the manager.',
            options: ['attend', 'attended', 'attending', 'attendance'],
            correct: 1,
            explanation: '수동태이므로 "attended"가 적절합니다.'
        },
        {
            sentence: 'She is the most _____ employee in our department.',
            options: ['efficient', 'efficiency', 'efficiently', 'efficientness'],
            correct: 0,
            explanation: '형용사 "efficient"가 적절합니다.'
        },
        {
            sentence: 'We need to _____ the budget before the meeting.',
            options: ['review', 'reviewing', 'reviewed', 'reviews'],
            correct: 0,
            explanation: '"need to + 동사원형" 형태가 적절합니다.'
        },
        {
            sentence: 'The conference will be held _____ the main hall.',
            options: ['in', 'on', 'at', 'for'],
            correct: 0,
            explanation: '장소를 나타낼 때 "in"을 사용합니다.'
        },
        {
            sentence: 'All employees _____ attend the training session.',
            options: ['must', 'may', 'can', 'should'],
            correct: 0,
            explanation: '"must"는 의무를 나타냅니다.'
        },
        {
            sentence: 'The price has _____ significantly since last year.',
            options: ['increase', 'increased', 'increasing', 'increases'],
            correct: 1,
            explanation: '현재완료 시제이므로 "has increased"가 적절합니다.'
        },
        {
            sentence: 'Please contact me if you have any _____ questions.',
            options: ['further', 'farther', 'furthermore', 'furthering'],
            correct: 0,
            explanation: '"further"는 "추가의" 의미입니다.'
        },
        {
            sentence: 'The project _____ completed on time.',
            options: ['was', 'were', 'is', 'are'],
            correct: 0,
            explanation: '수동태 과거형이므로 "was"가 적절합니다.'
        }
    ],
    medium: [
        {
            sentence: 'The manager requested that all reports _____ submitted by Friday.',
            options: ['be', 'are', 'were', 'will be'],
            correct: 0,
            explanation: '가정법 현재형 "be"가 적절합니다.'
        },
        {
            sentence: 'Not only _____ the project on time, but also under budget.',
            options: ['did we complete', 'we completed', 'we complete', 'we will complete'],
            correct: 0,
            explanation: '도치구문이므로 "did we complete"가 적절합니다.'
        },
        {
            sentence: 'The company is considering _____ a branch office in Asia.',
            options: ['open', 'opening', 'opened', 'to open'],
            correct: 1,
            explanation: '"consider + -ing" 형태가 적절합니다.'
        },
        {
            sentence: 'It is essential _____ all employees attend the safety training.',
            options: ['that', 'what', 'which', 'who'],
            correct: 0,
            explanation: '가정법을 이끄는 "that"이 적절합니다.'
        },
        {
            sentence: 'The report _____ by the team leader has been approved.',
            options: ['prepared', 'preparing', 'prepares', 'prepare'],
            correct: 0,
            explanation: '과거분사가 수동의 의미로 적절합니다.'
        },
        {
            sentence: 'We look forward to _____ from you soon.',
            options: ['hear', 'hearing', 'heard', 'hears'],
            correct: 1,
            explanation: '"look forward to + -ing" 형태가 적절합니다.'
        },
        {
            sentence: 'The new policy will take effect _____ January 1st.',
            options: ['on', 'in', 'at', 'by'],
            correct: 0,
            explanation: '특정 날짜 앞에는 "on"을 사용합니다.'
        },
        {
            sentence: 'Had we known about the delay, we _____ alternative arrangements.',
            options: ['would have made', 'would make', 'will make', 'made'],
            correct: 0,
            explanation: '과거 가정법이므로 "would have made"가 적절합니다.'
        },
        {
            sentence: 'The company\'s profits have increased _____ 20% this quarter.',
            options: ['by', 'at', 'in', 'for'],
            correct: 0,
            explanation: '변화량을 나타낼 때 "by"를 사용합니다.'
        },
        {
            sentence: 'The employee _____ performance was outstanding received a promotion.',
            options: ['whose', 'who', 'which', 'that'],
            correct: 0,
            explanation: '소유격 관계대명사 "whose"가 적절합니다.'
        }
    ],
    hard: [
        {
            sentence: 'The board of directors unanimously agreed that the merger _____ in the best interest of the company.',
            options: ['was', 'were', 'is', 'are'],
            correct: 0,
            explanation: '과거 시제와 주어가 단수이므로 "was"가 적절합니다.'
        },
        {
            sentence: 'Had it not been for the unexpected circumstances, the project _____ completed ahead of schedule.',
            options: ['would have been', 'would be', 'will be', 'was'],
            correct: 0,
            explanation: '과거 가정법이므로 "would have been"이 적절합니다.'
        },
        {
            sentence: 'The corporation is committed to _____ sustainable business practices.',
            options: ['implement', 'implementing', 'implementation', 'implemented'],
            correct: 1,
            explanation: '"be committed to + -ing" 형태가 적절합니다.'
        },
        {
            sentence: 'It is imperative _____ all stakeholders be informed of the changes.',
            options: ['that', 'what', 'which', 'who'],
            correct: 0,
            explanation: '가정법을 이끄는 "that"이 적절합니다.'
        },
        {
            sentence: 'The proposal, _____ was submitted last month, is now under review.',
            options: ['which', 'who', 'that', 'what'],
            correct: 0,
            explanation: '비제한적 관계절이므로 "which"가 적절합니다.'
        },
        {
            sentence: 'The company\'s success can be attributed _____ its innovative approach.',
            options: ['to', 'for', 'with', 'by'],
            correct: 0,
            explanation: '"attribute to"는 "~에 기인하다"의 의미입니다.'
        },
        {
            sentence: 'Not until the deadline had passed _____ realize the importance of time management.',
            options: ['did they', 'they did', 'they', 'had they'],
            correct: 0,
            explanation: '도치구문이므로 "did they"가 적절합니다.'
        },
        {
            sentence: 'The committee recommended that the budget _____ increased by 15%.',
            options: ['be', 'is', 'was', 'will be'],
            correct: 0,
            explanation: '가정법 현재형 "be"가 적절합니다.'
        },
        {
            sentence: 'The research findings suggest that the new treatment _____ effective.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '주어가 단수이므로 "is"가 적절합니다.'
        },
        {
            sentence: 'The company is known for _____ cutting-edge technology.',
            options: ['develop', 'developing', 'development', 'developed'],
            correct: 1,
            explanation: '"be known for + -ing" 형태가 적절합니다.'
        },
        {
            sentence: 'The committee of experts _____ reached a consensus on the matter.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '"committee"는 단수 취급하므로 "has"가 적절합니다.'
        },
        {
            sentence: 'Neither the manager nor the employees _____ satisfied with the decision.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '"neither A nor B"에서 B에 가까운 주어를 따르지만, 여기서는 단수 취급합니다.'
        },
        {
            sentence: 'The number of participants _____ significantly increased this year.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '"the number of"는 단수 취급하므로 "has"가 적절합니다.'
        },
        {
            sentence: 'A number of employees _____ requested time off for the holiday.',
            options: ['has', 'have', 'is', 'are'],
            correct: 1,
            explanation: '"a number of"는 복수 취급하므로 "have"가 적절합니다.'
        },
        {
            sentence: 'The data _____ collected from various sources over the past year.',
            options: ['was', 'were', 'is', 'are'],
            correct: 0,
            explanation: '"data"는 단수 취급하므로 "was"가 적절합니다.'
        },
        {
            sentence: 'Each of the candidates _____ required to submit a portfolio.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '"each of"는 단수 취급하므로 "is"가 적절합니다.'
        },
        {
            sentence: 'The team, along with its coach, _____ preparing for the championship.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '주어가 단수이므로 "is"가 적절합니다.'
        },
        {
            sentence: 'Every one of the proposals _____ carefully reviewed by the board.',
            options: ['was', 'were', 'is', 'are'],
            correct: 0,
            explanation: '"every one of"는 단수 취급하므로 "was"가 적절합니다.'
        },
        {
            sentence: 'The majority of the staff _____ in favor of the new policy.',
            options: ['is', 'are', 'was', 'were'],
            correct: 1,
            explanation: '"the majority of + 복수명사"는 복수 취급하므로 "are"가 적절합니다.'
        },
        {
            sentence: 'The series of meetings _____ scheduled for next week.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '"series"는 단수 취급하므로 "is"가 적절합니다.'
        },
        {
            sentence: 'None of the information _____ accurate according to the report.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '"none of + 단수명사"는 단수 취급하므로 "is"가 적절합니다.'
        },
        {
            sentence: 'The staff _____ working overtime to meet the deadline.',
            options: ['is', 'are', 'was', 'were'],
            correct: 1,
            explanation: '"staff"는 집합명사로 복수 취급하므로 "are"가 적절합니다.'
        },
        {
            sentence: 'Either the CEO or the directors _____ responsible for the decision.',
            options: ['is', 'are', 'was', 'were'],
            correct: 1,
            explanation: '"either A or B"에서 B에 가까운 주어를 따르므로 "are"가 적절합니다.'
        },
        {
            sentence: 'The group of investors _____ meeting with the management team.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '주어가 단수이므로 "is"가 적절합니다.'
        },
        {
            sentence: 'All of the equipment _____ been properly maintained.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '"equipment"는 불가산명사로 단수 취급하므로 "has"가 적절합니다.'
        },
        {
            sentence: 'The statistics _____ that the market is growing steadily.',
            options: ['shows', 'show', 'is showing', 'are showing'],
            correct: 1,
            explanation: '"statistics"는 복수 취급하므로 "show"가 적절합니다.'
        },
        {
            sentence: 'One of the most important factors _____ the quality of service.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '주어가 단수이므로 "is"가 적절합니다.'
        },
        {
            sentence: 'The jury _____ reached a unanimous verdict.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '"jury"는 단수 취급하므로 "has"가 적절합니다.'
        },
        {
            sentence: 'More than one employee _____ expressed concern about the changes.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '"more than one + 단수명사"는 단수 취급하므로 "has"가 적절합니다.'
        },
        {
            sentence: 'The pair of shoes _____ on sale at the department store.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '"a pair of"는 단수 취급하므로 "is"가 적절합니다.'
        },
        {
            sentence: 'The news _____ been broadcast on all major networks.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '"news"는 단수 취급하므로 "has"가 적절합니다.'
        },
        {
            sentence: 'The company, as well as its subsidiaries, _____ experiencing growth.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '주어가 단수이므로 "is"가 적절합니다.'
        },
        {
            sentence: 'Neither the proposal nor the budget _____ approved by the board.',
            options: ['was', 'were', 'is', 'are'],
            correct: 0,
            explanation: '"neither A nor B"에서 B에 가까운 주어를 따르지만, 여기서는 단수 취급합니다.'
        },
        {
            sentence: 'The collection of rare books _____ displayed in the museum.',
            options: ['is', 'are', 'was', 'were'],
            correct: 0,
            explanation: '주어가 단수이므로 "is"가 적절합니다.'
        },
        {
            sentence: 'Half of the budget _____ already been allocated.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '"half of + 단수명사"는 단수 취급하므로 "has"가 적절합니다.'
        },
        {
            sentence: 'The faculty _____ divided on the issue of curriculum changes.',
            options: ['is', 'are', 'was', 'were'],
            correct: 1,
            explanation: '"faculty"는 집합명사로 복수 취급하므로 "are"가 적절합니다.'
        },
        {
            sentence: 'The rest of the documents _____ filed in the archive.',
            options: ['is', 'are', 'was', 'were'],
            correct: 1,
            explanation: '"the rest of + 복수명사"는 복수 취급하므로 "are"가 적절합니다.'
        },
        {
            sentence: 'The percentage of successful applicants _____ increased this year.',
            options: ['has', 'have', 'is', 'are'],
            correct: 0,
            explanation: '주어가 단수이므로 "has"가 적절합니다.'
        },
        {
            sentence: 'The police _____ investigating the incident thoroughly.',
            options: ['is', 'are', 'was', 'were'],
            correct: 1,
            explanation: '"police"는 복수 취급하므로 "are"가 적절합니다.'
        }
    ]
};

// 게임 시작 함수는 이미 위에서 정의됨

// 다음 문제 로드
function loadNextQuestion() {
    if (gameState.questionNum >= gameState.totalQuestions) {
        showResult();
        return;
    }
    
    gameState.questionNum++;
    gameState.currentQuestion = gameState.questions[gameState.questionNum - 1];
    gameState.isAnswered = false;
    gameState.timer = 30;
    
    // UI 업데이트
    updateUI();
    displayQuestion();
    startTimer();
}

// 문제 표시
function displayQuestion() {
    const question = gameState.currentQuestion;
    const questionTypeEl = document.getElementById('questionType');
    const questionTextEl = document.getElementById('questionText');
    const questionHintEl = document.getElementById('questionHint');
    const answersContainer = document.getElementById('answersContainer');
    
    if (!questionTypeEl || !questionTextEl || !questionHintEl || !answersContainer) return;
    
    // 문제 유형에 따라 다르게 표시
    if (gameState.quizType === 'vocab') {
        // 단어 퀴즈 (영한만)
        questionTypeEl.textContent = '영한';
        questionTextEl.textContent = question.word;
        questionHintEl.textContent = '이 영어 단어의 뜻은?';
        
        // 선택지 생성
        const correctAnswer = question.meaning;
        const wrongAnswers = getWrongAnswers(correctAnswer, gameState.difficulty);
        const allAnswers = [correctAnswer, ...wrongAnswers];
        shuffleArray(allAnswers);
        
        answersContainer.innerHTML = '';
        allAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn-quiz';
            button.textContent = answer;
            button.onclick = () => selectAnswer(answer, correctAnswer);
            answersContainer.appendChild(button);
        });
    } else {
        // 토익 RC 문제
        questionTypeEl.textContent = '토익 RC';
        questionTextEl.textContent = question.sentence;
        questionHintEl.textContent = '빈칸에 들어갈 가장 적절한 답을 선택하세요.';

        // 선택지 생성
        answersContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn-quiz';
            button.textContent = option;
            const correctAnswer = question.options[question.correct];
            button.onclick = () => selectAnswer(option, correctAnswer, question.explanation);
            answersContainer.appendChild(button);
        });
    }
    
    // 피드백 숨기기
    const feedback = document.getElementById('feedbackContent');
    feedback.classList.remove('show');
}

// 오답 선택지 생성
function getWrongAnswers(correctAnswer, difficulty) {
    const allQuestions = questionsDatabase[difficulty];
    const wrongAnswers = [];
    const usedIndices = new Set();
    
    while (wrongAnswers.length < 3) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            const wrongAnswer = allQuestions[randomIndex].meaning;
            if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }
    }
    
    return wrongAnswers;
}

// 배열 섞기
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 답 선택
function selectAnswer(selectedAnswer, correctAnswer, explanation = '') {
    if (gameState.isAnswered) return;
    
    gameState.isAnswered = true;
    clearInterval(gameState.timerInterval);
    
    const buttons = document.querySelectorAll('.answer-btn-quiz');
    buttons.forEach(btn => {
        btn.classList.add('disabled');
        if (btn.textContent.trim() === correctAnswer.trim()) {
            btn.classList.add('correct');
        } else if (btn.textContent.trim() === selectedAnswer.trim() && selectedAnswer !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });
    
    // 피드백 표시
    const feedback = document.getElementById('feedbackContent');
    feedback.classList.remove('correct', 'incorrect');
    
    if (selectedAnswer === correctAnswer) {
        feedback.classList.add('correct', 'show');
        if (explanation) {
            feedback.textContent = `정답입니다! ✓ ${explanation}`;
        } else {
            feedback.textContent = '정답입니다! ✓';
        }
        gameState.correctCount++;
        gameState.combo++;
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
        // 점수 계산 (시간 남은 만큼 + 연속 정답 보너스)
        const timeBonus = Math.floor(gameState.timer * 10);
        const comboBonus = gameState.combo * 50;
        const baseScore = 100;
        const scoreGain = baseScore + timeBonus + comboBonus;
        gameState.score += scoreGain;
        
        // 사용자 점수 업데이트
        const userParticipant = gameState.participants.find(p => p.username === userInfo.username);
        if (userParticipant) {
            userParticipant.score = gameState.score;
        }
        
        // 봇 점수 업데이트 (랜덤)
        gameState.participants.forEach(participant => {
            if (participant.username !== userInfo.username) {
                if (Math.random() > 0.3) { // 70% 확률로 정답
                    participant.score += Math.floor(Math.random() * 200 + 100);
                }
            }
        });
    } else {
        feedback.classList.add('incorrect', 'show');
        if (explanation) {
            feedback.textContent = `오답입니다. 정답: ${correctAnswer} (${explanation})`;
        } else {
            feedback.textContent = `오답입니다. 정답: ${correctAnswer}`;
        }
        gameState.incorrectCount++;
        gameState.combo = 0;
    }
    
    updateUI();
    updateParticipants(); // 참가자 목록 업데이트
    
    // 다음 문제로
    setTimeout(() => {
        loadNextQuestion();
    }, 3000); // 토익 문제는 설명이 있으므로 시간을 좀 더 줌
}

// 타이머 시작
function startTimer() {
    const timerFill = document.getElementById('timerFill');
    const timerText = document.getElementById('timerText');
    
    if (!timerFill || !timerText) return;
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        const percentage = (gameState.timer / 30) * 100;
        
        timerFill.style.width = percentage + '%';
        timerText.textContent = gameState.timer;
        
        // 경고 색상 변경
        timerFill.classList.remove('warning', 'danger');
        if (percentage <= 33) {
            timerFill.classList.add('warning');
        }
        if (percentage <= 10) {
            timerFill.classList.add('danger');
        }
        
        // 시간 초과
        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            if (!gameState.isAnswered) {
                const correctAnswer = gameState.quizType === 'vocab' 
                    ? (gameState.currentQuestion.meaning || gameState.currentQuestion.word)
                    : gameState.currentQuestion.options[gameState.currentQuestion.correct];
                selectAnswer('', correctAnswer); // 시간 초과 처리
            }
        }
    }, 1000);
}

// UI 업데이트
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('combo').textContent = gameState.combo;
    document.getElementById('questionNum').textContent = `${gameState.questionNum}/${gameState.totalQuestions}`;
}

// 결과 화면 표시
function showResult() {
    clearInterval(gameState.timerInterval);
    
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.classList.remove('active');
    gameScreen.style.display = 'none';
    document.getElementById('resultScreen').classList.add('active');
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctCount').textContent = gameState.correctCount;
    document.getElementById('incorrectCount').textContent = gameState.incorrectCount;
    document.getElementById('maxCombo').textContent = gameState.maxCombo;
    
    // 결과 메시지
    const resultMessage = document.getElementById('resultMessage');
    const accuracy = (gameState.correctCount / gameState.totalQuestions) * 100;
    
    if (accuracy === 100) {
        resultMessage.textContent = '🎉 완벽합니다! 모두 정답입니다!';
        resultMessage.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
    } else if (accuracy >= 80) {
        resultMessage.textContent = '👏 훌륭합니다! 잘하셨네요!';
        resultMessage.style.background = 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
    } else if (accuracy >= 60) {
        resultMessage.textContent = '👍 좋습니다! 조금 더 연습하면 완벽해질 거예요!';
        resultMessage.style.background = 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)';
    } else {
        resultMessage.textContent = '💪 괜찮아요! 다음에는 더 잘할 수 있을 거예요!';
        resultMessage.style.background = 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)';
    }
}

// 게임 다시 시작
function restartGame() {
    document.getElementById('resultScreen').classList.remove('active');
    startGame(gameState.difficulty);
}

// 메인으로 돌아가기
function goToStart() {
    document.getElementById('resultScreen').classList.remove('active');
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.style.display = 'none';
    gameScreen.classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
}

// 참가자 목록 업데이트 (단상 형태)
function updateParticipants() {
    const podiumsContainer = document.getElementById('podiumsContainer');
    
    if (!podiumsContainer) return;
    
    // 점수 순으로 정렬
    const sortedParticipants = [...gameState.participants].sort((a, b) => b.score - a.score);
    
    podiumsContainer.innerHTML = '';
    sortedParticipants.forEach((participant, index) => {
        const podiumWrapper = document.createElement('div');
        podiumWrapper.className = 'podium-wrapper';
        if (index === 0) {
            podiumWrapper.classList.add('leader');
        }
        
        podiumWrapper.innerHTML = `
            <div class="podium">
                <div class="podium-emblem">30 NEXON</div>
                <div class="podium-top"></div>
                <div class="podium-body">
                    <div class="podium-score">${participant.score}</div>
                </div>
            </div>
            <div class="avatar-on-podium">
                <div class="avatar-circle ${index === 0 ? 'leader-avatar' : ''}">
                    <img src="${participant.avatar}" alt="${participant.username}">
                </div>
                <div class="participant-name-podium">${participant.username}</div>
                ${index === 0 ? '<div class="crown">👑</div>' : ''}
            </div>
        `;
        
        podiumsContainer.appendChild(podiumWrapper);
    });
}

// 채팅 메시지 전송
function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    addChatMessage(userInfo.username, message, userInfo.avatar);
    chatInput.value = '';
    
    // 봇 응답 (랜덤)
    setTimeout(() => {
        const bot = gameState.participants[Math.floor(Math.random() * (gameState.participants.length - 1)) + 1];
        const responses = ['화이팅!', '좋아요!', '힘내요!', '정답!', '화이팅입니다!'];
        const botResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(bot.username, botResponse, bot.avatar);
    }, 1000 + Math.random() * 2000);
}

// 채팅 메시지 추가
function addChatMessage(username, message, avatar) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    if (username === '시스템') {
        messageDiv.classList.add('system');
    }
    
    const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    
    if (username === '시스템') {
        messageDiv.innerHTML = `
            <span class="chat-time">${time}</span>
            <span class="chat-text">${message}</span>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="chat-avatar-small">
                <img src="${avatar}" alt="${username}">
            </div>
            <div class="chat-content">
                <div class="chat-user">${username}</div>
                <div class="chat-text">${message}</div>
            </div>
            <span class="chat-time">${time}</span>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 메시지 수 제한
    if (chatMessages.children.length > 50) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

// 채팅 키 입력 처리
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// 채팅창 토글
function toggleChat() {
    const chatContainer = document.getElementById('chatContainer');
    const chatToggle = document.getElementById('chatToggle');
    
    if (!chatContainer || !chatToggle) return;
    
    gameState.chatOpen = !gameState.chatOpen;
    
    if (gameState.chatOpen) {
        chatContainer.style.display = 'flex';
        chatToggle.textContent = '▼';
    } else {
        chatContainer.style.display = 'none';
        chatToggle.textContent = '▲';
    }
}

// 페이지 로드 시 로그인 상태 확인
window.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    updateAvatarSelection();
});

