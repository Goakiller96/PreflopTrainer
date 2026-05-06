// ===================== main.js (ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ) =====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Preflop Trainer запущен');

    // ---------- Элементы ----------
    const setupPanel = document.getElementById('setupPanel');
    const gamePanel = document.getElementById('gamePanel');
    const startBtn = document.getElementById('startBtn');
    const allPositionsCheck = document.getElementById('allPositions');
    const playerHand = document.getElementById('playerHand');
    const currentPositionEl = document.getElementById('currentPosition');
    const resultPanel = document.getElementById('resultPanel');
    const resultMessage = document.getElementById('resultMessage');
    const nextBtn = document.getElementById('nextBtn');
    const foldBtn = document.getElementById('foldBtn');
    const raiseBtn = document.getElementById('raiseBtn');
    const sessionCorrectSpan = document.getElementById('sessionCorrect');
    const sessionTotalSpan = document.getElementById('sessionTotal');
    const sessionPercentSpan = document.getElementById('sessionPercent');
    const situationInfo = document.getElementById('situationInfo');
    const actionsPanel = document.getElementById('actionsPanel');
    const raiseSizeBlock = document.getElementById('raiseSizeBlock');
    const errorModeIndicator = document.getElementById('errorModeIndicator');
    
    // ---------- Элементы статистики ----------
    const statsModal = document.getElementById('statsModal');
    const statsBtn = document.getElementById('statsBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    const reviewErrorsBtn = document.getElementById('reviewErrorsBtn');
    const totalHandsSpan = document.getElementById('totalHands');
    const correctHandsSpan = document.getElementById('correctHands');
    const accuracySpan = document.getElementById('accuracy');
    const errorCountSpan = document.getElementById('errorCount');

    // ---------- Переменные ----------
    let selectedPositions = [];
    let currentHand = null;
    let currentHandResolved = false;
    let currentMode = 'rfi';
    let selectedRaiseSize = '3';
    let stats = { total: 0, correct: 0 };
    let sessionStats = { total: 0, correct: 0 };
    
    // Массив для хранения ошибок
    let errorHands = [];
    let isErrorMode = false;
    let currentErrorIndex = 0;

    // ==================== КОЛОДА ====================
    const ranks = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
    const suits = [
        { symbol: '♠', color: '#000000', name: 'spades' },
        { symbol: '♥', color: '#e62e2e', name: 'hearts' },
        { symbol: '♦', color: '#3973e6', name: 'diamonds' },
        { symbol: '♣', color: '#2eb82e', name: 'clubs' }
    ];

    const positionNames = { ep: 'EP', mp: 'MP', co: 'CO', btn: 'BTN', sb: 'SB', bb: 'BB' };
    const positionOrder = ['ep', 'mp', 'co', 'btn', 'sb', 'bb'];
    
    function isInPosition(heroPos, villainPos) {
        return positionOrder.indexOf(heroPos) > positionOrder.indexOf(villainPos);
    }

    // ==================== RFI ДИАПАЗОНЫ ====================
    const rfiRanges = {
        ep: new Set(['AA','KK','QQ','JJ','TT','99','88','77','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','KQs','KJs','KTs','K9s','QJs','QTs','JTs','T9s','AKo','AQo','AJo','KQo']),
        mp: new Set(['AA','KK','QQ','JJ','TT','99','88','77','66','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','QJs','QTs','Q9s','JTs','T9s','AKo','AQo','AJo','ATo','KQo','KJo']),
        co: new Set(['AA','KK','QQ','JJ','TT','99','88','77','66','55','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','T9s','T8s','98s','87s','AKo','AQo','AJo','ATo','KQo','KJo','KTo','QJo','QTo','JTo']),
        btn: new Set(['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','JTs','J9s','J8s','J7s','J6s','J5s','T9s','T8s','T7s','T6s','98s','97s','96s','87s','86s','76s','75s','65s','64s','54s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','KQo','KJo','KTo','K9o','QJo','QTo','Q9o','JTo','J9o','T9o']),
        sb: new Set(['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s','JTs','J9s','J8s','J7s','J6s','J5s','J4s','T9s','T8s','T7s','T6s','98s','97s','96s','87s','86s','85s','76s','75s','65s','64s','54s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','KQo','KJo','KTo','K9o','QJo','QTo','Q9o','JTo','J9o','T9o'])
    };

    // ==================== ДИАПАЗОНЫ ЗАЩИТЫ BB ====================
    
    const callRangeEP30 = new Set([
        '99', '88', '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
        'K9s', 'T9s', 'T8s', '98s', '87s', '76s', '65s', '54s',
        'AQo', 'KQo'
    ]);
    
    const extraCallRangeEP25 = new Set([
        'K8s', 'K7s', 'K6s', 'K5s', 'Q9s', 'J9s', '97s', '86s', '75s', '64s', '53s', '43s', 'AJo'
    ]);
    
    const callRangeMP30 = new Set([
        '88', '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
        'K9s', 'K8s', 'Q9s', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s',
        'AQo', 'KQo'
    ]);
    
    const extraCallRangeMP25 = new Set([
        'K7s', 'K6s', 'K5s', 'Q8s', 'J8s', '53s', '43s', 'AJo', 'ATo', 'KJo', 'QJo'
    ]);
    
    const callRangeCO30 = new Set([
        '88', '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
        'K9s', 'K8s', 'K7s', 'K6s', 'Q9s', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s', '43s',
        'AJo', 'ATo', 'KQo', 'KJo', 'QJo'
    ]);
    
    const extraCallRangeCO25 = new Set([
        'K5s', 'K4s', 'K3s', 'K2s', 'Q8s', 'Q7s', 'Q6s', 'J8s', 'KTo', 'QTo'
    ]);
    
    const callRangeBTN30 = new Set([
        '88', '77', '66', '55', '44', '33', '22',
        'A8s', 'A7s', 'A3s', 'A2s',
        'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
        'Q7s', 'Q6s', 'Q5s', 'J7s', 'T7s', '97s', '87s', '86s', '75s', '64s', '43s',
        'KTo', 'QJo', 'QTo', 'JTo'
    ]);
    
    const extraCallRangeBTN25 = new Set([
        'A6s', 'J6s', 'J5s', 'T6s', '96s', '85s', '74s', '53s', 'A8o'
    ]);
    
    const callRangeSB30 = new Set([
        '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A4s', 'A3s', 'A2s',
        'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
        'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s',
        'JTs', 'J9s', 'J8s', 'J7s',
        'T8s', 'T7s', '97s', '86s', '75s', '64s', '43s',
        'ATo', 'A9o', 'KQo', 'KTo', 'QJo', 'QTo', 'JTo'
    ]);
    
    const extraCallRangeSB25 = new Set(['85s', '74s', '53s']);
    
    const randomRange50 = new Set([
        '99', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'AQo'
    ]);
    
    const randomRangeBTN50 = new Set([
        '99', 'A9s', 'K9s', 'Q9s', 'Q8s', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '87s', '76s', '65s', '54s', 'AJo', 'A9o', 'KQo', 'KJo'
    ]);
    
    const randomRangeSB50 = new Set([
        'A5s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'T9s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s', '98s', '96s', '95s', '87s', '76s', '65s', '54s',
        'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'K9o', 'K8o', 'Q9o', 'J9o', 'T9o', 'T8o', '98o'
    ]);
    
    const threebetRange = new Set([
        'AA', 'KK', 'QQ', 'JJ', 'TT',
        'AKs', 'AQs', 'AJs', 'ATs',
        'KQs', 'KJs', 'KTs',
        'QJs', 'QTs',
        'JTs',
        'AKo'
    ]);
    
    const threebetRangeBTN = new Set([
        'AA', 'KK', 'QQ', 'JJ', 'TT',
        'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s',
        'KQs', 'KJs', 'KTs',
        'QJs', 'QTs',
        'JTs',
        'AKo', 'AQo'
    ]);
    
    const threebetRangeSB = new Set([
        'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88',
        'AKs', 'AQs', 'AJs', 'ATs',
        'KQs', 'KJs',
        'QJs',
        'AKo', 'AQo', 'AJo'
    ]);
    
    const threebetRanges = {
        vs_ep: new Set(['AA','KK','QQ','JJ','TT','AKs','AQs','AKo']),
        vs_mp: new Set(['AA','KK','QQ','JJ','TT','99','AKs','AQs','AJs','AKo','AQo']),
        vs_co: new Set(['AA','KK','QQ','JJ','TT','99','88','AKs','AQs','AJs','ATs','AKo','AQo','AJo']),
        vs_btn: new Set(['AA','KK','QQ','JJ','TT','99','88','77','AKs','AQs','AJs','ATs','A9s','AKo','AQo','AJo','ATo']),
        vs_sb: new Set(['AA','KK','QQ','JJ','TT','99','88','77','66','AKs','AQs','AJs','ATs','A9s','A8s','AKo','AQo','AJo','ATo','A9o'])
    };

    function getDefendBBAction(handCode, raiseSize, villainPos) {
        if (villainPos === 'btn') {
            if (threebetRangeBTN.has(handCode)) return 'raise';
            if (randomRangeBTN50.has(handCode)) return 'random';
            if (callRangeBTN30.has(handCode)) return 'call';
            if (raiseSize === 2.5 && extraCallRangeBTN25.has(handCode)) return 'call';
            return 'fold';
        }
        
        if (villainPos === 'sb') {
            if (threebetRangeSB.has(handCode)) return 'raise';
            if (randomRangeSB50.has(handCode)) return 'random';
            if (callRangeSB30.has(handCode)) return 'call';
            if (raiseSize === 2.5 && extraCallRangeSB25.has(handCode)) return 'call';
            return 'fold';
        }
        
        if (threebetRange.has(handCode)) return 'raise';
        if (randomRange50.has(handCode)) return 'random';
        
        if (villainPos === 'ep') {
            if (callRangeEP30.has(handCode)) return 'call';
            if (raiseSize === 2.5 && extraCallRangeEP25.has(handCode)) return 'call';
        } else if (villainPos === 'mp') {
            if (callRangeMP30.has(handCode)) return 'call';
            if (raiseSize === 2.5 && extraCallRangeMP25.has(handCode)) return 'call';
        } else if (villainPos === 'co') {
            if (callRangeCO30.has(handCode)) return 'call';
            if (raiseSize === 2.5 && extraCallRangeCO25.has(handCode)) return 'call';
        }
        
        return 'fold';
    }

    // ==================== ФУНКЦИИ ОТОБРАЖЕНИЯ ====================
    
    function clearBetsOnTable() {
        document.querySelectorAll('.bet-chip').forEach(el => {
            el.classList.remove('visible');
            el.textContent = '';
        });
        document.querySelectorAll('.position').forEach(pos => {
            pos.classList.remove('position--villain');
            pos.style.borderColor = '';
            pos.style.boxShadow = '';
        });
    }

    function showBetOnPosition(position, betSize) {
        clearBetsOnTable();
        
        const betChip = document.querySelector(`.position-wrapper--${position} .bet-chip`);
        if (betChip) {
            betChip.textContent = `${betSize} BB`;
            betChip.classList.add('visible');
        }
        const posElement = document.querySelector(`.position[data-pos="${position}"]`);
        if (posElement) {
            posElement.classList.add('position--villain');
        }
    }

    function getHandCode(card1, card2) {
        const rankOrder = {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'T':10,'J':11,'Q':12,'K':13,'A':14};
        let r1 = card1.rank, r2 = card2.rank;
        let highRank = rankOrder[r1] >= rankOrder[r2] ? r1 : r2;
        let lowRank = rankOrder[r1] >= rankOrder[r2] ? r2 : r1;
        if (highRank === lowRank) return highRank + lowRank;
        const isSuited = (card1.suit.name === card2.suit.name);
        return highRank + lowRank + (isSuited ? 's' : 'o');
    }

    function getRandomCard() {
        return {
            rank: ranks[Math.floor(Math.random() * ranks.length)],
            suit: suits[Math.floor(Math.random() * suits.length)]
        };
    }

    function generateHand() {
        let c1, c2;
        do {
            c1 = getRandomCard();
            c2 = getRandomCard();
        } while (c1.rank === c2.rank && c1.suit.name === c2.suit.name);
        return [c1, c2];
    }

    function renderHand(hand) {
        playerHand.innerHTML = '';
        hand.forEach(card => {
            let el = document.createElement('div');
            el.className = 'card';
            el.innerHTML = '<div style="color: ' + card.suit.color + ';">' + card.rank + '</div><div class="card__suit" style="color: ' + card.suit.color + ';">' + card.suit.symbol + '</div>';
            playerHand.appendChild(el);
        });
    }

    // ==================== ГЕНЕРАЦИЯ СИТУАЦИЙ ====================
    
    function generateRfiSituation() {
        const rfiPositions = selectedPositions.filter(p => p !== 'bb');
        const heroPos = rfiPositions.length > 0 ? rfiPositions[Math.floor(Math.random() * rfiPositions.length)] : 'ep';
        const cards = generateHand();
        const handCode = getHandCode(cards[0], cards[1]);
        const correctAction = rfiRanges[heroPos]?.has(handCode) ? 'raise' : 'fold';
        return { cards, handCode, heroPos, correctAction };
    }

    function generateThreebetSituation() {
        const heroPos = selectedPositions[Math.floor(Math.random() * selectedPositions.length)];
        const availableVillains = selectedPositions.filter(p => positionOrder.indexOf(p) < positionOrder.indexOf(heroPos));
        let villainPos = availableVillains.length > 0 ? availableVillains[Math.floor(Math.random() * availableVillains.length)] : selectedPositions.filter(p => p !== heroPos)[0];
        const isIP = isInPosition(heroPos, villainPos);
        const raiseSize = isIP ? 3 : 4;
        const cards = generateHand();
        const handCode = getHandCode(cards[0], cards[1]);
        const rangeKey = `vs_${villainPos}`;
        let correctAction = threebetRanges[rangeKey]?.has(handCode) ? '3bet' : 'fold';
        return { cards, handCode, heroPos, villainPos, raiseSize, correctAction };
    }

    function generateVsThreebetSituation() {
        const heroPos = selectedPositions[Math.floor(Math.random() * selectedPositions.length)];
        const villainPos = selectedPositions.filter(p => p !== heroPos)[Math.floor(Math.random() * (selectedPositions.length - 1))];
        const isIP = isInPosition(villainPos, heroPos);
        const threebetSize = isIP ? 3 : 4;
        const cards = generateHand();
        const handCode = getHandCode(cards[0], cards[1]);
        let correctAction = 'fold';
        return { cards, handCode, heroPos, villainPos, threebetSize, correctAction };
    }

    function generateIsolateSituation() {
        const heroPos = selectedPositions[Math.floor(Math.random() * selectedPositions.length)];
        const limperPos = selectedPositions.filter(p => p !== heroPos)[Math.floor(Math.random() * (selectedPositions.length - 1))];
        const cards = generateHand();
        const handCode = getHandCode(cards[0], cards[1]);
        let correctAction = 'fold';
        return { cards, handCode, heroPos, limperPos, correctAction };
    }

    function generateDefendBBSituation() {
        const heroPos = 'bb';
        const availableVillains = selectedPositions.filter(p => p !== 'bb');
        let villainPos = availableVillains.length > 0 ? availableVillains[Math.floor(Math.random() * availableVillains.length)] : 'ep';
        
        let raiseSize;
        if (selectedRaiseSize === 'both') {
            raiseSize = Math.random() < 0.5 ? 2.5 : 3;
        } else {
            raiseSize = parseFloat(selectedRaiseSize);
        }
        
        const cards = generateHand();
        const handCode = getHandCode(cards[0], cards[1]);
        const correctAction = getDefendBBAction(handCode, raiseSize, villainPos);
        
        return { cards, handCode, heroPos, villainPos, raiseSize, correctAction };
    }

    // ==================== УПРАВЛЕНИЕ ВИДИМОСТЬЮ ПОЗИЦИЙ ====================
    
    function updatePositionsVisibility() {
        const bbCheckbox = document.querySelector('.pos-check[value="bb"]');
        const bbLabel = bbCheckbox?.parentElement;
        
        if (!bbCheckbox) return;
        
        if (currentMode === 'rfi' || currentMode === 'defend_bb') {
            if (bbLabel) bbLabel.style.display = 'none';
            if (bbCheckbox.checked) {
                bbCheckbox.checked = false;
            }
        } else {
            if (bbLabel) bbLabel.style.display = '';
        }
        
        const visibleCheckboxes = document.querySelectorAll('.pos-check:not([style*="display: none"])');
        const allChecked = visibleCheckboxes.length === document.querySelectorAll('.pos-check:not([style*="display: none"]):checked').length;
        allPositionsCheck.checked = allChecked;
    }

    // ==================== ФУНКЦИИ РАБОТЫ С ОШИБКАМИ ====================
    
    function addErrorToList(handData) {
        errorHands.unshift({
            handCode: handData.handCode,
            position: handData.position,
            villainPos: handData.villainPos,
            raiseSize: handData.raiseSize,
            correctAction: handData.correctAction,
            mode: handData.mode,
            timestamp: Date.now()
        });
        updateErrorCountDisplay();
        saveErrorsToLocalStorage();
    }
    
    function removeErrorFromList(index) {
        errorHands.splice(index, 1);
        updateErrorCountDisplay();
        saveErrorsToLocalStorage();
    }
    
    function updateErrorCountDisplay() {
        if (errorCountSpan) {
            errorCountSpan.textContent = errorHands.length;
        }
    }
    
    function saveErrorsToLocalStorage() {
        localStorage.setItem('pokerErrors', JSON.stringify(errorHands));
    }
    
    function loadErrorsFromLocalStorage() {
        const saved = localStorage.getItem('pokerErrors');
        if (saved) {
            errorHands = JSON.parse(saved);
            updateErrorCountDisplay();
        }
    }
    
    function generateHandFromCode(handCode) {
        const rank1 = handCode[0];
        const rank2 = handCode[1];
        const isSuited = handCode.includes('s');
        const isPair = (rank1 === rank2);
        
        let card1 = { rank: rank1, suit: suits[0] };
        let card2 = { rank: rank2, suit: suits[0] };
        
        if (isPair) {
            let suit1, suit2;
            do {
                suit1 = suits[Math.floor(Math.random() * suits.length)];
                suit2 = suits[Math.floor(Math.random() * suits.length)];
            } while (suit1.name === suit2.name);
            card1.suit = suit1;
            card2.suit = suit2;
        } else if (isSuited) {
            const suit = suits[Math.floor(Math.random() * suits.length)];
            card1.suit = suit;
            card2.suit = suit;
        } else {
            let suit1, suit2;
            do {
                suit1 = suits[Math.floor(Math.random() * suits.length)];
                suit2 = suits[Math.floor(Math.random() * suits.length)];
            } while (suit1.name === suit2.name);
            card1.suit = suit1;
            card2.suit = suit2;
        }
        
        return [card1, card2];
    }
    
    function startErrorReview() {
        if (errorHands.length === 0) {
            showTemporaryMessage('🎉 Отличная работа! Нет ошибок для повторения!', '#00ff9d');
            statsModal.style.display = 'none';
            return;
        }
        
        isErrorMode = true;
        currentErrorIndex = 0;
        
        if (errorModeIndicator) {
            errorModeIndicator.style.display = 'inline-block';
        }
        
        statsModal.style.display = 'none';
        setupPanel.style.display = 'none';
        gamePanel.style.display = 'block';
        
        clearBetsOnTable();
        resultPanel.classList.remove('active');
        resultMessage.innerHTML = '';
        
        loadErrorForReview();
    }
    
    function loadErrorForReview() {
        if (currentErrorIndex >= errorHands.length) {
            finishErrorReview();
            return;
        }
        
        clearBetsOnTable();
        resultPanel.classList.remove('active');
        resultMessage.innerHTML = '';
        
        const error = errorHands[currentErrorIndex];
        currentMode = error.mode;
        
        const cards = generateHandFromCode(error.handCode);
        
        currentHand = {
            cards: cards,
            position: error.position,
            handCode: error.handCode,
            correctAction: error.correctAction,
            situation: {
                heroPos: error.position,
                villainPos: error.villainPos,
                raiseSize: error.raiseSize
            },
            isErrorReview: true,
            errorIndex: currentErrorIndex
        };
        currentHandResolved = false;
        
        currentPositionEl.innerHTML = `<strong>${positionNames[error.position]}</strong>`;
        
        document.querySelectorAll('.position').forEach(pos => {
            pos.classList.remove('position--active');
            if (pos.dataset.pos === error.position) {
                pos.classList.add('position--active');
            }
        });
        
        renderHand(cards);
        
        let actionText = '';
        if (error.mode === 'defend_bb') {
            actionText = `🔄 ПОВТОР: ${positionNames[error.villainPos]} открылся ${error.raiseSize}bb. Защита BB.`;
            showBetOnPosition(error.villainPos, error.raiseSize);
        } else if (error.mode === '3bet') {
            actionText = `🔄 ПОВТОР: ${positionNames[error.villainPos]} открылся ${error.raiseSize}bb. Ваш 3-бет?`;
            showBetOnPosition(error.villainPos, error.raiseSize);
        } else if (error.mode === 'rfi') {
            actionText = `🔄 ПОВТОР: Все сбросили. Ваша позиция: ${positionNames[error.position]}. RFI?`;
            clearBetsOnTable();
        } else {
            actionText = `🔄 ПОВТОР ошибки. Ваше действие?`;
        }
        
        situationInfo.innerHTML = actionText;
        renderActions(error.mode, { raiseSize: error.raiseSize });
    }
    
    function finishErrorReview() {
        isErrorMode = false;
        currentErrorIndex = 0;
        
        if (errorModeIndicator) {
            errorModeIndicator.style.display = 'none';
        }
        
        if (errorHands.length > 0) {
            showTemporaryMessage(`✅ Работа над ошибками завершена! Осталось ошибок: ${errorHands.length}. Продолжайте тренировку.`, '#00ff9d', 3000);
        } else {
            showTemporaryMessage(`🎉 Отлично! Все ошибки исправлены!`, '#00ff9d', 3000);
        }
        
        startNewHand();
    }
    
    function finishErrorReviewAndExit() {
        isErrorMode = false;
        currentErrorIndex = 0;
        
        if (errorModeIndicator) {
            errorModeIndicator.style.display = 'none';
        }
        
        showTemporaryMessage(`Выход из режима работы над ошибками`, '#ffd700', 1500);
        startNewHand();
    }
    
    function showTemporaryMessage(message, color, duration = 2000, callback = null) {
        resultMessage.innerHTML = message;
        resultMessage.style.color = color;
        resultPanel.classList.add('active');
        setTimeout(() => {
            resultPanel.classList.remove('active');
            if (callback) callback();
        }, duration);
    }
    
    function handleAnswerInErrorMode(selectedAction) {
        if (currentHandResolved) return;
        
        const error = errorHands[currentErrorIndex];
        const isCorrect = (selectedAction === error.correctAction);
        const actionNames = { fold: 'ФОЛД', call: 'КОЛЛ', raise: 'РЕЙЗ', '3bet': '3БЕТ', '4bet': '4БЕТ', random: '50/50' };
        
        if (isCorrect) {
            removeErrorFromList(currentErrorIndex);
            resultMessage.innerHTML = `✅ ПРАВИЛЬНО! Ошибка исправлена!`;
            resultMessage.style.color = '#00ff9d';
            currentHandResolved = true;
            resultPanel.classList.add('active');
            
            setTimeout(() => {
                if (currentErrorIndex < errorHands.length) {
                    loadErrorForReview();
                } else {
                    finishErrorReview();
                }
                resultPanel.classList.remove('active');
            }, 1000);
        } else {
            const correctText = actionNames[error.correctAction] || error.correctAction;
            resultMessage.innerHTML = `❌ СНОВА НЕПРАВИЛЬНО!<br>Правильно: ${correctText}`;
            resultMessage.style.color = '#ff9999';
            currentHandResolved = true;
            resultPanel.classList.add('active');
            currentErrorIndex++;
            
            setTimeout(() => {
                if (currentErrorIndex < errorHands.length) {
                    loadErrorForReview();
                } else {
                    finishErrorReview();
                }
                resultPanel.classList.remove('active');
            }, 2000);
        }
        
        updateErrorCountDisplay();
    }

    // ==================== ОСНОВНЫЕ ФУНКЦИИ ====================
    
    function renderActions(mode, context = {}) {
        const actionConfigs = {
            rfi: { buttons: ['fold', 'raise'], names: { fold: '✗ FOLD', raise: '▲ RAISE' } },
            '3bet': { buttons: ['fold', 'call', '3bet'], names: { fold: '✗ FOLD', call: '○ CALL', '3bet': `▲ 3BET (${context.raiseSize || 3}x)` } },
            vs3bet: { buttons: ['fold', 'call', '4bet'], names: { fold: '✗ FOLD', call: '○ CALL', '4bet': '▲ 4BET' } },
            isolate: { buttons: ['fold', 'call', 'raise'], names: { fold: '✗ FOLD', call: '○ CALL', raise: '▲ RAISE' } },
            defend_bb: { 
                buttons: ['fold', 'call', 'random', 'raise'], 
                names: { 
                    fold: '✗ FOLD', 
                    call: `○ CALL (${context.raiseSize || 2.5}bb)`, 
                    random: '🎲 50/50', 
                    raise: '▲ 3BET' 
                } 
            }
        };
        
        const config = actionConfigs[mode];
        if (!config) return;
        
        const actionButtons = {
            fold: `<button class="action-btn action-btn--fold" data-action="fold">${config.names.fold}</button>`,
            call: `<button class="action-btn action-btn--call" data-action="call">${config.names.call}</button>`,
            random: `<button class="action-btn action-btn--random" data-action="random">${config.names.random}</button>`,
            raise: `<button class="action-btn action-btn--raise" data-action="raise">${config.names.raise}</button>`,
            '3bet': `<button class="action-btn action-btn--3bet" data-action="3bet">${config.names['3bet']}</button>`,
            '4bet': `<button class="action-btn action-btn--4bet" data-action="4bet">${config.names['4bet']}</button>`
        };
        
        let html = '';
        config.buttons.forEach(action => { html += actionButtons[action] || ''; });
        actionsPanel.innerHTML = html;
        
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn.dataset.action));
        });
    }

    function updateSessionStatsUI() {
        sessionCorrectSpan.textContent = sessionStats.correct;
        sessionTotalSpan.textContent = sessionStats.total;
        let percent = sessionStats.total === 0 ? 0 : Math.round((sessionStats.correct / sessionStats.total) * 100);
        sessionPercentSpan.textContent = percent;
    }

    function updateGlobalStatsModal() {
        totalHandsSpan.textContent = stats.total;
        correctHandsSpan.textContent = stats.correct;
        let percent = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
        accuracySpan.textContent = percent + '%';
    }

    function saveStats() { localStorage.setItem('pokerStats', JSON.stringify(stats)); }
    
    function loadStats() {
        let saved = localStorage.getItem('pokerStats');
        stats = saved ? JSON.parse(saved) : { total: 0, correct: 0 };
        updateGlobalStatsModal();
    }
    
    function resetStats() {
        stats = { total: 0, correct: 0 };
        sessionStats = { total: 0, correct: 0 };
        errorHands = [];
        saveStats();
        saveErrorsToLocalStorage();
        updateGlobalStatsModal();
        updateSessionStatsUI();
        updateErrorCountDisplay();
        resultPanel.classList.remove('active');
        if (gamePanel.style.display === 'block') startNewHand();
        showTemporaryMessage('🗑 Статистика и ошибки сброшены', '#00ff9d', 2000);
    }
    
    function resetToSetupScreen() {
        if (isErrorMode) {
            isErrorMode = false;
            currentErrorIndex = 0;
            if (errorModeIndicator) {
                errorModeIndicator.style.display = 'none';
            }
            clearBetsOnTable();
        }
        setupPanel.style.display = 'flex';
        gamePanel.style.display = 'none';
        currentHand = null;
        currentHandResolved = false;
        resultPanel.classList.remove('active');
        clearBetsOnTable();
        updatePositionsVisibility();
    }

    function startNewHand() {
        if (selectedPositions.length === 0 && !isErrorMode) return;
        if (isErrorMode) return;
        
        clearBetsOnTable();
        
        let situation;
        let context = {};
        
        switch(currentMode) {
            case 'rfi':
                situation = generateRfiSituation();
                break;
            case '3bet':
                situation = generateThreebetSituation();
                context = { raiseSize: situation.raiseSize };
                showBetOnPosition(situation.villainPos, situation.raiseSize);
                break;
            case 'vs3bet':
                situation = generateVsThreebetSituation();
                context = { threebetSize: situation.threebetSize };
                showBetOnPosition(situation.villainPos, situation.threebetSize);
                break;
            case 'isolate':
                situation = generateIsolateSituation();
                showBetOnPosition(situation.limperPos, 1);
                break;
            case 'defend_bb':
                situation = generateDefendBBSituation();
                context = { raiseSize: situation.raiseSize };
                showBetOnPosition(situation.villainPos, situation.raiseSize);
                break;
            default:
                situation = generateRfiSituation();
        }
        
        currentHand = {
            cards: situation.cards,
            position: situation.heroPos,
            handCode: situation.handCode,
            correctAction: situation.correctAction,
            situation: situation
        };
        currentHandResolved = false;
        
        currentPositionEl.innerHTML = `<strong>${positionNames[situation.heroPos]}</strong>`;
        
        document.querySelectorAll('.position').forEach(pos => {
            pos.classList.remove('position--active');
            if (pos.dataset.pos === situation.heroPos) {
                pos.classList.add('position--active');
            }
        });
        
        renderHand(situation.cards);
        renderActions(currentMode, context);
        resultPanel.classList.remove('active');
        resultMessage.innerHTML = '';
    }

    function handleAnswer(selectedAction) {
        if (currentHandResolved) return;
        if (!currentHand) return;
        
        if (isErrorMode) {
            handleAnswerInErrorMode(selectedAction);
            return;
        }
        
        let isCorrect = (selectedAction === currentHand.correctAction);
        currentHandResolved = true;
        
        stats.total++;
        if (isCorrect) {
            stats.correct++;
        } else {
            addErrorToList({
                handCode: currentHand.handCode,
                position: currentHand.position,
                villainPos: currentHand.situation?.villainPos,
                raiseSize: currentHand.situation?.raiseSize,
                correctAction: currentHand.correctAction,
                mode: currentMode
            });
        }
        sessionStats.total++;
        if (isCorrect) sessionStats.correct++;
        
        saveStats();
        updateGlobalStatsModal();
        updateSessionStatsUI();
        
        const actionNames = { fold: 'ФОЛД', call: 'КОЛЛ', raise: 'РЕЙЗ', '3bet': '3БЕТ', '4bet': '4БЕТ', random: '50/50' };
        
        if (isCorrect) {
            resultMessage.innerHTML = `✅ ПРАВИЛЬНО! (${actionNames[selectedAction]})`;
            resultMessage.style.color = '#00ff9d';
        } else {
            let correctText = actionNames[currentHand.correctAction] || currentHand.correctAction;
            resultMessage.innerHTML = `❌ НЕПРАВИЛЬНО!<br>Правильно: ${correctText}`;
            resultMessage.style.color = '#ff9999';
        }
        
        resultPanel.classList.add('active');
    }

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    function initModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isErrorMode) {
                    isErrorMode = false;
                    currentErrorIndex = 0;
                    if (errorModeIndicator) {
                        errorModeIndicator.style.display = 'none';
                    }
                    clearBetsOnTable();
                    showTemporaryMessage('Выход из режима работы над ошибками', '#ffd700', 1500);
                }
                
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                if (currentMode === 'defend_bb') {
                    raiseSizeBlock.style.display = 'block';
                } else {
                    raiseSizeBlock.style.display = 'none';
                }
                
                updatePositionsVisibility();
                
                if (gamePanel.style.display === 'block') {
                    startNewHand();
                }
            });
        });
    }
    
    function initSizeButtons() {
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedRaiseSize = btn.dataset.size;
            });
        });
    }
    
    const resetToSetupLink = document.getElementById('resetToSetup');
    if (resetToSetupLink) {
        resetToSetupLink.addEventListener('click', (e) => {
            e.preventDefault();
            resetToSetupScreen();
        });
    }
    
    allPositionsCheck.addEventListener('change', (e) => {
        let isChecked = e.target.checked;
        document.querySelectorAll('.pos-check:not([style*="display: none"])').forEach(cb => {
            cb.checked = isChecked;
        });
    });
    
    document.addEventListener('change', (e) => {
        if (e.target.classList && e.target.classList.contains('pos-check')) {
            const visibleCheckboxes = document.querySelectorAll('.pos-check:not([style*="display: none"])');
            const allChecked = visibleCheckboxes.length === document.querySelectorAll('.pos-check:not([style*="display: none"]):checked').length;
            allPositionsCheck.checked = allChecked;
        }
    });
    
    startBtn.addEventListener('click', () => {
        selectedPositions = [];
        document.querySelectorAll('.pos-check:not([style*="display: none"]):checked').forEach(cb => {
            selectedPositions.push(cb.value);
        });
        
        if (selectedPositions.length === 0) {
            showTemporaryMessage('❌ Выберите хотя бы одну позицию!', '#ff6666', 2000);
            return;
        }
        
        sessionStats = { total: 0, correct: 0 };
        updateSessionStatsUI();
        
        setupPanel.style.display = 'none';
        gamePanel.style.display = 'block';
        startNewHand();
    });
    
    statsBtn.addEventListener('click', () => {
        updateGlobalStatsModal();
        statsModal.style.display = 'flex';
    });
    
    closeModalBtn.addEventListener('click', () => statsModal.style.display = 'none');
    resetStatsBtn.addEventListener('click', resetStats);
    
    if (reviewErrorsBtn) {
        reviewErrorsBtn.addEventListener('click', startErrorReview);
    }
    
    window.addEventListener('click', (e) => { if (e.target === statsModal) statsModal.style.display = 'none'; });
    
    nextBtn.addEventListener('click', () => {
        if (isErrorMode) {
            currentErrorIndex++;
            if (currentErrorIndex < errorHands.length) {
                loadErrorForReview();
                resultPanel.classList.remove('active');
            } else {
                finishErrorReview();
            }
        } else {
            resultPanel.classList.remove('active');
            startNewHand();
        }
    });
    
    if (foldBtn) foldBtn.addEventListener('click', () => handleAnswer('fold'));
    if (raiseBtn) raiseBtn.addEventListener('click', () => handleAnswer('raise'));
    
    initModeButtons();
    initSizeButtons();
    loadStats();
    loadErrorsFromLocalStorage();
    updatePositionsVisibility();
    
    console.log('✅ Тренажёр готов!');
});