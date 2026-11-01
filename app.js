
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

let currentLanguage = "uk";

const translations = {
    uk: {
        greeting: "Привіт, агенте.",
        subtitle: "Готовий знайти шпигуна серед друзів?",
        newGame: "Нова гра",
        myPacks: "Мої паки",
        language: "Мова",
        stats: "Статистика",
        back: "Назад",
        game: "Створення гри",
        packs: "Твої паки",
        statistics: "Твоя статистика"
    },
    en: {
        greeting: "Hello, agent.",
        subtitle: "Ready to find the spy?",
        newGame: "New game",
        myPacks: "My packs",
        language: "Language",
        stats: "Statistics",
        back: "Back",
        game: "Create game",
        packs: "Your packs",
        statistics: "Your statistics"
    },
    ru: {
        greeting: "Привет, агент.",
        subtitle: "Готов найти шпиона среди друзей?",
        newGame: "Новая игра",
        myPacks: "Мои паки",
        language: "Язык",
        stats: "Статистика",
        back: "Назад",
        game: "Создание игры",
        packs: "Твои паки",
        statistics: "Твоя статистика"
    }
};

function setLanguage(lang) {
    currentLanguage = lang;

    const t = translations[lang];

    document.getElementById("greeting").textContent = t.greeting;
    document.getElementById("subtitle").textContent = t.subtitle;
    document.getElementById("newGame").textContent = t.newGame;
    document.getElementById("myPacks").textContent = t.myPacks;
    document.getElementById("language").textContent = t.language;
    document.getElementById("stats").textContent = t.stats;

    localStorage.setItem("spyLanguage", lang);
}

function openScreen(name) {
    const screen = document.getElementById("screen");
    const title = document.getElementById("screenTitle");
    const content = document.getElementById("screenContent");

    screen.classList.remove("hidden");

    const t = translations[currentLanguage];

    if (name === "game") {
        title.textContent = t.game;
        content.innerHTML = "<p>🎮 Тут буде створення ігрових кімнат.</p>";
    }

    if (name === "packs") {
        title.textContent = t.packs;
        content.innerHTML = "<p>📦 Тут будуть твої власні паки слів.</p>";
    }

    if (name === "stats") {
        title.textContent = t.statistics;
        content.innerHTML = "<p>🏆 Тут буде твоя статистика.</p>";
    }

    if (name === "language") {
        title.textContent = t.language;

        content.innerHTML = `
            <button onclick="setLanguage('uk')">🇺🇦 Українська</button>
            <button onclick="setLanguage('en')">🇬🇧 English</button>
            <button onclick="setLanguage('ru')">🇷🇺 Русский</button>
        `;
    }

    if (tg) tg.HapticFeedback?.impactOccurred("light");
}

function goHome() {
    document.getElementById("screen").classList.add("hidden");
}

const savedLanguage = localStorage.getItem("spyLanguage");

setLanguage(
    ["uk", "en", "ru"].includes(savedLanguage)
        ? savedLanguage
        : "uk"
);
