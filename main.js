// ===================== main.js (ПОЛНАЯ ВЕРСИЯ) =====================
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
    const sessionCorrectSpan = document.getElementById('sessionCorrect');
    const sessionTotalSpan = document.getElementById('sessionTotal');
    const sessionPercentSpan = document.getElementById('sessionPercent');
    const situationInfo = document.getElementById('situationInfo');
    const actionsPanel = document.getElementById('actionsPanel');
    const raiseSizeBlock = document.getElementById('raiseSizeBlock');
    
    // ---------- Элементы статистики ----------
    const statsModal = document.getElementById('statsModal');
    const statsBtn = document.getElementById('statsBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    const totalHandsSpan = document.getElementById('totalHands');
    const correctHandsSpan = document.getElementById('correctHands');
    const accuracySpan = document.getElementById('accuracy');

    // ---------- Переменные ----------
    let selectedPositions = [];
    let currentHand = null;
    let currentHandResolved = false;
    let currentMode = 'rfi';
    let selectedRaiseSize = '3';
    let stats = { total: 0, correct: 0 };
    let sessionStats = { total: 0, correct: 0 };

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

    // ==================== ДИАПАЗОНЫ ЗАЩИТЫ BB ПРОТИВ EP ====================
    const callRangeEP30 = new Set([
        '99', '88', '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
        'K9s',
        'T9s', 'T8s',
        '98s', '87s', '76s', '65s', '54s',
        'AQo', 'KQo'
    ]);
    
    const extraCallRangeEP25 = new Set([
        'K8s', 'K7s', 'K6s', 'K5s',
        'Q9s',
        'J9s',
        '97s',
        '86s',
        '75s',
        '64s',
        '53s',
        '43s',
        'AJo'
    ]);

    // ==================== ДИАПАЗОНЫ ЗАЩИТЫ BB ПРОТИВ MP ====================
    const callRangeMP30 = new Set([
        '88', '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
        'K9s', 'K8s',
        'Q9s',
        'J9s',
        'T9s', 'T8s',
        '98s', '97s',
        '87s', '86s',
        '76s', '75s',
        '65s', '64s',
        '54s',
        'AQo', 'KQo'
    ]);
    
    const extraCallRangeMP25 = new Set([
        'K7s', 'K6s', 'K5s',
        'Q8s',
        'J8s',
        '53s', '43s',
        'AJo', 'ATo',
        'KJo', 'QJo'
    ]);

    // ==================== ДИАПАЗОНЫ ЗАЩИТЫ BB ПРОТИВ CO ====================
    const callRangeCO30 = new Set([
        '88', '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A2s',
        'K9s', 'K8s', 'K7s', 'K6s',
        'Q9s',
        'J9s',
        'T9s', 'T8s',
        '98s', '97s',
        '87s', '86s',
        '76s', '75s',
        '65s', '64s',
        '54s', '53s',
        '43s',
        'AJo', 'ATo',
        'KQo', 'KJo',
        'QJo'
    ]);
    
    const extraCallRangeCO25 = new Set([
        'K5s', 'K4s', 'K3s', 'K2s',
        'Q8s', 'Q7s', 'Q6s',
        'J8s',
        'KTo', 'QTo'
    ]);

    // ==================== ДИАПАЗОНЫ ЗАЩИТЫ BB ПРОТИВ BTN ====================
    const callRangeBTN30 = new Set([
        '88', '77', '66', '55', '44', '33', '22',
        'A8s', 'A7s', 'A3s', 'A2s',
        'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
        'Q7s', 'Q6s', 'Q5s',
        'J7s',
        'T7s',
        '97s',
        '87s', '86s',
        '75s',
        '64s',
        '43s',
        'KTo',
        'QJo', 'QTo',
        'JTo'
    ]);
    
    const extraCallRangeBTN25 = new Set([
        'A6s',
        'J6s', 'J5s',
        'T6s',
        '96s',
        '85s',
        '74s',
        '53s',
        'A8o'
    ]);

    // ==================== ДИАПАЗОНЫ ЗАЩИТЫ BB ПРОТИВ SB ====================
    const callRangeSB30 = new Set([
        '77', '66', '55', '44', '33', '22',
        'A9s', 'A8s', 'A7s', 'A6s', 'A4s', 'A3s', 'A2s',
        'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
        'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s',
        'JTs', 'J9s', 'J8s', 'J7s',
        'T8s', 'T7s',
        '97s',
        '86s',
        '75s',
        '64s',
        '43s',
        'ATo', 'A9o',
        'KQo', 'KTo',
        'QJo', 'QTo',
        'JTo'
    ]);
    
    const extraCallRangeSB25 = new Set([
        '85s',
        '74s',
        '53s'
    ]);

    // ==================== ОБЩИЕ ДИАПАЗОНЫ ====================
    
    // Базовый диапазон 50/50
    const randomRange50 = new Set([
        '99',
        'AJs', 'ATs',
        'A5s', 'A4s', 'A3s',
        'KJs', 'KTs',
        'QJs', 'QTs',
        'JTs',
        'AQo'
    ]);
    
    // Диапазон 50/50 для BTN (расширенный)
    const randomRangeBTN50 = new Set([
        '99',
        'A9s',
        'K9s',
        'Q9s', 'Q8s',
        'J9s', 'J8s',
        'T9s', 'T8s',
        '98s',
        '87s',
        '76s',
        '65s',
        '54s',
        'AJo', 'A9o',
        'KQo', 'KJo'
    ]);
    
    // Диапазон 50/50 для SB (расширенный)
    const randomRangeSB50 = new Set([
        'A5s',
        'Q5s', 'Q4s', 'Q3s', 'Q2s',
        'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
        'T9s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
        '98s', '96s', '95s',
        '87s',
        '76s',
        '65s',
        '54s',
        'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
        'K9o', 'K8o',
        'Q9o',
        'J9o',
        'T9o', 'T8o',
        '98o'
    ]);
    
    // Базовый диапазон 3бета
    const threebetRange = new Set([
        'AA', 'KK', 'QQ', 'JJ', 'TT',
        'AKs', 'AQs', 'AJs', 'ATs',
        'KQs', 'KJs', 'KTs',
        'QJs', 'QTs',
        'JTs',
        'AKo'
    ]);
    
    // Диапазон 3бета для BTN (расширенный)
    const threebetRangeBTN = new Set([
        'AA', 'KK', 'QQ', 'JJ', 'TT',
        'AKs', 'AQs', 'AJs', 'ATs',
        'A5s', 'A4s',
        'KQs', 'KJs', 'KTs',
        'QJs', 'QTs',
        'JTs',
        'AKo', 'AQo'
    ]);
    
    // Диапазон 3бета для SB (расширенный)
    const threebetRangeSB = new Set([
        'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88',
        'AKs', 'AQs', 'AJs', 'ATs',
        'KQs', 'KJs',
        'QJs',
        'AKo', 'AQo', 'AJo'
    ]);

    // Функция определения действия для защиты BB
    function getDefendBBAction(handCode, raiseSize, villainPos) {
        // Для BTN используем расширенные диапазоны
        if (villainPos === 'btn') {
            if (threebetRangeBTN.has(handCode)) {
                return 'raise';
            }
            if (randomRangeBTN50.has(handCode)) {
                return 'random';
            }
            if (callRangeBTN30.has(handCode)) {
                return 'call';
            }
            if (raiseSize === 2.5 && extraCallRangeBTN25.has(handCode)) {
                return 'call';
            }
            return 'fold';
        }
        
        // Для SB используем расширенные диапазоны
        if (villainPos === 'sb') {
            if (threebetRangeSB.has(handCode)) {
                return 'raise';
            }
            if (randomRangeSB50.has(handCode)) {
                return 'random';
            }
            if (callRangeSB30.has(handCode)) {
                return 'call';
            }
            if (raiseSize === 2.5 && extraCallRangeSB25.has(handCode)) {
                return 'call';
            }
            return 'fold';
        }
        
        // Для EP, MP, CO используем базовые диапазоны
        if (threebetRange.has(handCode)) {
            return 'raise';
        }
        
        if (randomRange50.has(handCode)) {
            return 'random';
        }
        
        if (villainPos === 'ep') {
            if (callRangeEP30.has(handCode)) {
                return 'call';
            }
            if (raiseSize === 2.5 && extraCallRangeEP25.has(handCode)) {
                return 'call';
            }
        } else if (villainPos === 'mp') {
            if (callRangeMP30.has(handCode)) {
                return 'call';
            }
            if (raiseSize === 2.5 && extraCallRangeMP25.has(handCode)) {
                return 'call';
            }
        } else if (villainPos === 'co') {
            if (callRangeCO30.has(handCode)) {
                return 'call';
            }
            if (raiseSize === 2.5 && extraCallRangeCO25.has(handCode)) {
                return 'call';
            }
        }
        
        return 'fold';
    }

    // ==================== ДИАПАЗОНЫ ДЛЯ 3BET ====================
    const threebetRanges = {
        vs_ep: new Set(['AA','KK','QQ','JJ','TT','AKs','AQs','AKo']),
        vs_mp: new Set(['AA','KK','QQ','JJ','TT','99','AKs','AQs','AJs','AKo','AQo']),
        vs_co: new Set(['AA','KK','QQ','JJ','TT','99','88','AKs','AQs','AJs','ATs','AKo','AQo','AJo']),
        vs_btn: new Set(['AA','KK','QQ','JJ','TT','99','88','77','AKs','AQs','AJs','ATs','A9s','AKo','AQo','AJo','ATo']),
        vs_sb: new Set(['AA','KK','QQ','JJ','TT','99','88','77','66','AKs','AQs','AJs','ATs','A9s','A8s','AKo','AQo','AJo','ATo','A9o'])
    };

    // ==================== ФУНКЦИИ ОТОБРАЖЕНИЯ ====================
    
    function clearBetsOnTable() {
        document.querySelectorAll('.bet-chip').forEach(el => {
            el.classList.remove('visible');
            el.textContent = '';
        });
        document.querySelectorAll('.position').forEach(pos => {
            pos.classList.remove('position--villain');
        });
    }

    function showBetOnPosition(position, betSize) {
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
        
        if (currentMode === 'rfi') {
            if (bbLabel) bbLabel.style.display = 'none';
            if (bbCheckbox.checked) {
                bbCheckbox.checked = false;
            }
        } else if (currentMode === 'defend_bb') {
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
        saveStats();
        updateGlobalStatsModal();
        updateSessionStatsUI();
        resultPanel.classList.remove('active');
        if (gamePanel.style.display === 'block') startNewHand();
    }
    
    function resetToSetupScreen() {
        setupPanel.style.display = 'flex';
        gamePanel.style.display = 'none';
        currentHand = null;
        currentHandResolved = false;
        resultPanel.classList.remove('active');
        clearBetsOnTable();
        updatePositionsVisibility();
        console.log('Возврат на экран настроек');
    }

    function startNewHand() {
        if (selectedPositions.length === 0) return;
        
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
        
        console.log(`Режим: ${currentMode}, Рука: ${situation.handCode}, Герой: ${situation.heroPos}, Оппонент: ${situation.villainPos || '—'}, Действие: ${situation.correctAction}`);
    }

    function handleAnswer(selectedAction) {
        if (currentHandResolved) return;
        if (!currentHand) return;
        
        let isCorrect = (selectedAction === currentHand.correctAction);
        
        currentHandResolved = true;
        
        stats.total++;
        if (isCorrect) stats.correct++;
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
            resultMessage.innerHTML = `❌ НЕПРАВИЛЬНО!<br>Вы: ${actionNames[selectedAction]} | Правильно: ${correctText}`;
            resultMessage.style.color = '#ff9999';
        }
        
        resultPanel.classList.add('active');
    }

    // ---------- ИНИЦИАЛИЗАЦИЯ ----------
    function initModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                if (currentMode === 'defend_bb') {
                    raiseSizeBlock.style.display = 'block';
                } else {
                    raiseSizeBlock.style.display = 'none';
                }
                
                updatePositionsVisibility();
                console.log('Режим изменён на:', currentMode);
            });
        });
    }
    
    function initSizeButtons() {
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedRaiseSize = btn.dataset.size;
                console.log('Размер рейза:', selectedRaiseSize);
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
            alert('❌ Выберите хотя бы одну позицию!');
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
    window.addEventListener('click', (e) => { if (e.target === statsModal) statsModal.style.display = 'none'; });
    nextBtn.addEventListener('click', startNewHand);
    
    initModeButtons();
    initSizeButtons();
    loadStats();
    updatePositionsVisibility();
    
    console.log('✅ Тренажёр готов! Добавлены диапазоны для защиты BB против EP, MP, CO, BTN, SB');
});