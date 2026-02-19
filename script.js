// Navegação entre seções
const menuItems = document.querySelectorAll('.menu-item');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
const sections = document.querySelectorAll('.content-section');
const bgPrevBtn = document.getElementById('bgPrevBtn');
const bgNextBtn = document.getElementById('bgNextBtn');
const bgStopAutoBtn = document.getElementById('bgStopAutoBtn');
const bgIntervalSelect = document.getElementById('bgIntervalSelect');

const bgExtensions = ['png', 'gif', 'jpg', 'jpeg'];
const backgroundFolder = 'fundos/';
const maxScanIndex = 300;
const stopAfterMissingStreak = 20;
const defaultBackgroundAutoSwitchDelay = 20000;
const backgroundFadeDuration = 900;
const backgroundSwitchIntervalStorageKey = 'fspBackgroundSwitchInterval';

let availableBackgrounds = [];
let currentBackgroundIndex = 0;
let backgroundAutoSwitchInterval = null;
let backgroundTransitionTimeout = null;
let backgroundAutoSwitchDelay = defaultBackgroundAutoSwitchDelay;

function normalizeBackgroundAutoSwitchDelay(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return defaultBackgroundAutoSwitchDelay;
    }

    return parsed;
}

function setBackgroundAutoSwitchDelay(value) {
    backgroundAutoSwitchDelay = normalizeBackgroundAutoSwitchDelay(value);
    localStorage.setItem(backgroundSwitchIntervalStorageKey, String(backgroundAutoSwitchDelay));

    if (bgIntervalSelect) {
        bgIntervalSelect.value = String(backgroundAutoSwitchDelay);
    }
}

function checkImageExists(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

async function discoverBackgrounds() {
    const foundBackgrounds = [];
    let missingStreak = 0;

    for (let index = 1; index <= maxScanIndex; index += 1) {
        const candidatesForIndex = bgExtensions.map(ext => `${backgroundFolder}fundo_${index}.${ext}`);
        const checks = await Promise.all(candidatesForIndex.map(checkImageExists));
        const validForIndex = checks.filter(Boolean);

        if (validForIndex.length > 0) {
            foundBackgrounds.push(...validForIndex);
            missingStreak = 0;
        } else {
            missingStreak += 1;

            if (missingStreak >= stopAfterMissingStreak && foundBackgrounds.length > 0) {
                break;
            }
        }
    }

    return foundBackgrounds;
}

function applyBackground(fileName, withTransition = true) {
    const setBackground = () => {
        document.body.style.setProperty('--bg-current', `url('${fileName}')`);
        document.body.style.setProperty('--bg-next', `url('${fileName}')`);
        localStorage.setItem('fspSelectedBackground', fileName);
    };

    if (!withTransition) {
        setBackground();
        return;
    }

    if (backgroundTransitionTimeout) {
        clearTimeout(backgroundTransitionTimeout);
    }

    document.body.style.setProperty('--bg-next', `url('${fileName}')`);
    document.body.classList.add('bg-fade-transition');

    backgroundTransitionTimeout = setTimeout(() => {
        setBackground();
        document.body.classList.remove('bg-fade-transition');
        backgroundTransitionTimeout = null;
    }, backgroundFadeDuration);
}

function toggleBackgroundButtonsState() {
    const hasOptions = availableBackgrounds.length > 1;
    if (bgPrevBtn) bgPrevBtn.disabled = !hasOptions;
    if (bgNextBtn) bgNextBtn.disabled = !hasOptions;
}

function changeBackground(step) {
    if (availableBackgrounds.length === 0) return;

    currentBackgroundIndex =
        (currentBackgroundIndex + step + availableBackgrounds.length) % availableBackgrounds.length;

    applyBackground(availableBackgrounds[currentBackgroundIndex]);
}

function startBackgroundAutoSwitch() {
    if (backgroundAutoSwitchInterval) {
        clearInterval(backgroundAutoSwitchInterval);
    }

    if (availableBackgrounds.length <= 1) return;

    backgroundAutoSwitchInterval = setInterval(() => {
        changeBackground(1);
    }, backgroundAutoSwitchDelay);
}

function toggleBackgroundAutoSwitch() {
    if (backgroundAutoSwitchInterval) {
        clearInterval(backgroundAutoSwitchInterval);
        backgroundAutoSwitchInterval = null;

        if (bgStopAutoBtn) {
            bgStopAutoBtn.classList.add('is-stopped');
            bgStopAutoBtn.innerHTML = '<i class="fas fa-play"></i>';
            bgStopAutoBtn.setAttribute('aria-pressed', 'true');
            bgStopAutoBtn.setAttribute('aria-label', 'Retomar transição automática de fundo');
        }

        return;
    }

    startBackgroundAutoSwitch();

    if (bgStopAutoBtn) {
        bgStopAutoBtn.classList.remove('is-stopped');
        bgStopAutoBtn.innerHTML = '<i class="fas fa-pause"></i>';
        bgStopAutoBtn.setAttribute('aria-pressed', 'false');
        bgStopAutoBtn.setAttribute('aria-label', 'Pausar transição automática de fundo');
    }
}

async function setupBackgroundSwitcher() {
    if (!bgPrevBtn || !bgNextBtn) return;

    const savedAutoSwitchDelay = localStorage.getItem(backgroundSwitchIntervalStorageKey);
    setBackgroundAutoSwitchDelay(savedAutoSwitchDelay ?? defaultBackgroundAutoSwitchDelay);

    const found = await discoverBackgrounds();
    availableBackgrounds = [...new Set(found)];

    if (availableBackgrounds.length === 0) {
        availableBackgrounds = [`${backgroundFolder}fundo_1.jpg`];
    }

    const savedBackground = localStorage.getItem('fspSelectedBackground');
    const savedIndex = savedBackground ? availableBackgrounds.indexOf(savedBackground) : -1;

    currentBackgroundIndex = savedIndex >= 0 ? savedIndex : 0;
    applyBackground(availableBackgrounds[currentBackgroundIndex], false);
    toggleBackgroundButtonsState();
    startBackgroundAutoSwitch();

    bgPrevBtn.addEventListener('click', () => changeBackground(-1));
    bgNextBtn.addEventListener('click', () => changeBackground(1));

    if (bgStopAutoBtn) {
        bgStopAutoBtn.disabled = availableBackgrounds.length <= 1;
        bgStopAutoBtn.classList.remove('is-stopped');
        bgStopAutoBtn.innerHTML = '<i class="fas fa-pause"></i>';
        bgStopAutoBtn.setAttribute('aria-pressed', 'false');
        bgStopAutoBtn.setAttribute('aria-label', 'Pausar transição automática de fundo');
        bgStopAutoBtn.addEventListener('click', toggleBackgroundAutoSwitch);
    }

    if (bgIntervalSelect) {
        bgIntervalSelect.value = String(backgroundAutoSwitchDelay);
        bgIntervalSelect.addEventListener('change', function () {
            const wasRunning = Boolean(backgroundAutoSwitchInterval);
            setBackgroundAutoSwitchDelay(this.value);

            if (wasRunning) {
                startBackgroundAutoSwitch();
            }
        });
    }
}

function typeElementLetterByLetter(element, speed = 90) {
    if (!element) return;

    const fullText = element.dataset.fullText || element.textContent;
    element.dataset.fullText = fullText;

    if (element._typingTimeout) {
        clearTimeout(element._typingTimeout);
    }

    element.textContent = '';
    let index = 0;

    const typeNext = () => {
        element.textContent = fullText.slice(0, index + 1);
        index += 1;

        if (index < fullText.length) {
            element._typingTimeout = setTimeout(typeNext, speed);
        }
    };

    if (fullText.length > 0) {
        typeNext();
    }
}

function runSectionTyping(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const heroSubtitle = section.querySelector('.hero-subtitle');
    const sectionTitle = section.querySelector('.section-title');

    if (heroSubtitle) {
        typeElementLetterByLetter(heroSubtitle, 110);
    }

    if (sectionTitle) {
        typeElementLetterByLetter(sectionTitle, 110);
    }
}

function switchSection(sectionId, clickedItem, allItems) {
    allItems.forEach(i => i.classList.remove('active'));
    clickedItem.classList.add('active');
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    const allMenuItems = [...document.querySelectorAll('.menu-item'), ...document.querySelectorAll('.mobile-nav-item')];
    allMenuItems.forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    runSectionTyping(sectionId);
}

menuItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        switchSection(sectionId, this, menuItems);
    });
});

mobileNavItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        switchSection(sectionId, this, mobileNavItems);

        const mobileNav = document.getElementById('mobileNav');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileNav) mobileNav.classList.remove('open');
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    });
});

// Toggle dropdown mobile
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
        this.classList.toggle('active');
    });
}

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

const initialSection = document.querySelector('.content-section.active');
if (initialSection) {
    runSectionTyping(initialSection.id);
}

setupBackgroundSwitcher();

window.addEventListener('resize', refreshCurrentBackgroundOnResize);
