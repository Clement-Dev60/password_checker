// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────

const SCORE_DATA = [
    { label: 'Très faible', color: '#ff4d4d', pct: 10 },
    { label: 'Faible', color: '#ff7a2f', pct: 28 },
    { label: 'Moyen', color: '#f5c518', pct: 52 },
    { label: 'Fort', color: '#4de8a0', pct: 76 },
    { label: 'Très fort', color: '#7c6af7', pct: 100 },
];

const TRANSLATIONS = {
    'Use a few words, avoid common phrases': 'Utilisez plusieurs mots, évitez les phrases communes.',
    'No need for symbols, digits, or uppercase letters': 'Pas besoin de symboles ni de majuscules.',
    'Add another word or two. Uncommon words are better.': 'Ajoutez un ou deux mots supplémentaires.',
    'Use a longer keyboard pattern with more turns': 'Utilisez un schéma clavier plus complexe.',
    'Avoid repeated words and characters': 'Évitez les répétitions de mots ou caractères.',
    'Avoid sequences': 'Évitez les séquences (abc, 123…).',
    'Avoid recent years': 'Évitez les années récentes.',
    'Avoid years that are associated with you': 'Évitez les années vous concernant.',
    'Avoid dates and years that are associated with you': 'Évitez les dates personnelles.',
    "Capitalization doesn't help very much": "La capitalisation seule n'apporte pas grand chose.",
    'All-uppercase is almost as easy to guess as all-lowercase': 'Tout en majuscules est presque aussi facile à deviner.',
    "Reversed words aren't much harder to guess": 'Les mots inversés sont facilement devinables.',
    "Predictable substitutions like '@' instead of 'a' don't help very much": "Les substitutions prévisibles (@ → a) n'aident pas.",
    "This is a top-10 common password": 'Ceci est dans le top 10 des mots de passes communs',
    "This is a top-100 common password": 'Ceci est dans le top 100 des mots de passes communs',
    "This is similar to a commonly used password": 'Ceci est similaire à un mot de passe utilisé fréquemment',
    "This is a very common password": 'Ceci est un mot de passe très commun',
};

const TIME_MAP = {
    'less than a second': '< 1 seconde',
    'half a minute': '30 secondes',
    'a minute': '1 minute',
    'an hour': '1 heure',
    'a day': '1 jour',
    'a week': '1 semaine',
    'a month': '1 mois',
    'a year': '1 an',
    'centuries': 'des siècles',
};

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function translate(str) {
    return TRANSLATIONS[str] || str;
}

function formatTime(display) {
    if (TIME_MAP[display]) return TIME_MAP[display];
    return display
        .replace('minutes', 'minutes')
        .replace('hours', 'heures')
        .replace('days', 'jours')
        .replace('months', 'mois')
        .replace('years', 'ans');
}

function setChip(id, ok) {
    document.getElementById(id).className = 'chip ' + (ok ? 'ok' : 'fail');
}

function resetChips() {
    ['c-len', 'c-maj', 'c-num', 'c-sym', 'c-long'].forEach(id => setChip(id, false));
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

function checkPassword() {
    const pwd = document.getElementById('pwd').value;
    const placeholder = document.getElementById('placeholder');

    if (!pwd) {
        placeholder.style.display = 'block';
        document.getElementById('score-row').classList.remove('visible');
        document.getElementById('stats').classList.remove('visible');
        document.getElementById('chips').classList.remove('visible');
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('bar').style.width = '0%';
        resetChips();
        return;
    }

    placeholder.style.display = 'none';

    const result = zxcvbn(pwd);
    const sd = SCORE_DATA[result.score];

    // Score label + bar
    const row = document.getElementById('score-row');
    row.classList.add('visible');

    const lbl = document.getElementById('score-label');
    lbl.textContent = sd.label;
    lbl.style.color = sd.color;
    document.getElementById('score-sub').textContent = `score ${result.score}/4`;

    const bar = document.getElementById('bar');
    bar.style.width = sd.pct + '%';
    bar.style.backgroundColor = sd.color;

    // Stats
    document.getElementById('stats').classList.add('visible');
    document.getElementById('t-online').textContent = formatTime(result.crack_times_display.online_throttling_100_per_hour);
    document.getElementById('t-offline').textContent = formatTime(result.crack_times_display.offline_slow_hashing_1e4_per_second);

    // Chips
    document.getElementById('chips').classList.add('visible');
    setChip('c-len', pwd.length >= 8);
    setChip('c-long', pwd.length >= 12);
    setChip('c-maj', /[A-Z]/.test(pwd));
    setChip('c-num', /[0-9]/.test(pwd));
    setChip('c-sym', /[^A-Za-z0-9]/.test(pwd));

    // Feedback
    const fb = document.getElementById('feedback');
    const parts = [];
    if (result.feedback.warning) parts.push(translate(result.feedback.warning));
    result.feedback.suggestions.forEach(s => parts.push(translate(s)));

    if (parts.length) {
        fb.classList.remove('hidden');
        setTimeout(() => fb.classList.add('visible'), 10);
        fb.innerHTML = parts.map(p => '→ ' + p).join('<br>');
    } else {
        fb.classList.remove('visible');
        fb.classList.add('hidden');
    }
}

// ─────────────────────────────────────────
// Toggle visibility
// ─────────────────────────────────────────

const EYE_OPEN = `
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  `;

const EYE_CLOSED = `
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  `;

function toggleVis() {
    const input = document.getElementById('pwd');
    const icon = document.getElementById('eye-icon');
    const isHidden = input.type === 'password';

    input.type = isHidden ? 'text' : 'password';
    icon.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
}

// ─────────────────────────────────────────
// Toast + Copy
// ─────────────────────────────────────────

let toastTimer = null;

function showToast(message = 'Mot de passe copié !') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    // Remet le timer à zéro si on rappelle la fonction rapidement
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function copy() {
    const password = document.getElementById('pwd');
    if (!password.value) return;

    navigator.clipboard.writeText(password.value)
        .then(() => showToast('Mot de passe copié !'))
        .catch(() => showToast('Erreur lors de la copie'));
}


// ─────────────────────────────────────────
// Generator
// ─────────────────────────────────────────

const CHARS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function toggleGenerator() {
    document.getElementById('gen-panel').classList.toggle('open');
}

function updateLengthDisplay() {
    const val = document.getElementById('gen-length').value;
    document.getElementById('gen-length-val').textContent = val;
}

function generatePassword() {
    const length = parseInt(document.getElementById('gen-length').value);
    const useMaj = document.getElementById('gen-maj').checked;
    const useNum = document.getElementById('gen-num').checked;
    const useSym = document.getElementById('gen-sym').checked;

    // Construit le pool de caractères
    let pool = CHARS.lower;
    if (useMaj) pool += CHARS.upper;
    if (useNum) pool += CHARS.numbers;
    if (useSym) pool += CHARS.symbols;

    // Garantit au moins un caractère de chaque type activé
    let pwd = '';
    if (useMaj) pwd += randomChar(CHARS.upper);
    if (useNum) pwd += randomChar(CHARS.numbers);
    if (useSym) pwd += randomChar(CHARS.symbols);
    pwd += randomChar(CHARS.lower); // toujours au moins une minuscule

    // Complète jusqu'à la longueur voulue
    while (pwd.length < length) {
        pwd += randomChar(pool);
    }

    // Mélange pour éviter que les caractères garantis soient toujours au début
    pwd = shuffle(pwd);

    // Injecte dans l'input et déclenche l'évaluation
    const input = document.getElementById('pwd');
    input.value = pwd;
    input.type = 'text'; // affiche le mdp généré
    document.getElementById('eye-icon').innerHTML = EYE_CLOSED;
    checkPassword();
}

function randomChar(str) {
    // crypto.getRandomValues pour un vrai aléatoire cryptographique
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return str[array[0] % str.length];
}

function shuffle(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const j = array[0] % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}