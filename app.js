const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#090909");
        tg.setBackgroundColor("#090909");
    } catch (error) {
        console.log("Telegram theme settings unavailable");
    }
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
        statistics: "Твоя статистика",
        gamePlaceholder: "🎮 Тут буде створення ігрових кімнат.",
        packsPlaceholder: "📦 Тут будуть твої власні паки слів.",
        statsPlaceholder: "🏆 Тут буде твоя статистика."
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
        statistics: "Your statistics",
        gamePlaceholder: "🎮 Game room creation will be here.",
        packsPlaceholder: "📦 Your custom word packs will be here.",
        statsPlaceholder: "🏆 Your statistics will be here."
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
        statistics: "Твоя статистика",
        gamePlaceholder: "🎮 Здесь будет создание игровых комнат.",
        packsPlaceholder: "📦 Здесь будут твои собственные паки слов.",
        statsPlaceholder: "🏆 Здесь будет твоя статистика."
    }
};

function setLanguage(lang) {
    if (!translations[lang]) return;

    currentLanguage = lang;

    const t = translations[lang];

    document.documentElement.lang = lang;

    document.getElementById("greeting").textContent = t.greeting;
    document.getElementById("subtitle").textContent = t.subtitle;
    document.getElementById("newGame").textContent = t.newGame;
    document.getElementById("myPacks").textContent = t.myPacks;
    document.getElementById("language").textContent = t.language;
    document.getElementById("stats").textContent = t.stats;
    document.getElementById("backText").textContent = t.back;

    try {
        localStorage.setItem("spyLanguage", lang);
    } catch (error) {
        console.log("Language could not be saved");
    }

    const screen = document.getElementById("screen");

    if (!screen.classList.contains("hidden")) {
        const title = document.getElementById("screenTitle");

        if (title.dataset.screen === "language") {
            title.textContent = t.language;
        }
    }
}

function openScreen(name) {
    const screen = document.getElementById("screen");
    const title = document.getElementById("screenTitle");
    const content = document.getElementById("screenContent");

    const t = translations[currentLanguage];

    screen.classList.remove("hidden");

    title.dataset.screen = name;
    content.innerHTML = "";

    if (name === "game") {
        title.textContent = t.game;
        content.textContent = t.gamePlaceholder;
    }

    if (name === "packs") {
        title.textContent = t.packs;
        content.textContent = t.packsPlaceholder;
    }

    if (name === "stats") {
        title.textContent = t.statistics;
        content.textContent = t.statsPlaceholder;
    }

    if (name === "language") {
        title.textContent = t.language;

        const languages = [
            ["uk", "🇺🇦 Українська"],
            ["en", "🇬🇧 English"],
            ["ru", "🇷🇺 Русский"]
        ];

        languages.forEach(([code, label]) => {
            const button = document.createElement("button");

            button.textContent =
                (currentLanguage === code ? "✓  " : "") + label;

            button.addEventListener("click", () => {
                setLanguage(code);
                openScreen("language");
                haptic();
            });

            content.appendChild(button);
        });
    }

    haptic();
}

function goHome() {
    document.getElementById("screen").classList.add("hidden");
    haptic();
}

function haptic() {
    try {
        tg?.HapticFeedback?.impactOccurred("light");
    } catch (error) {
        // Haptic feedback is optional.
    }
}

let savedLanguage = "uk";

try {
    savedLanguage = localStorage.getItem("spyLanguage") || "uk";
} catch (error) {
    console.log("Could not read saved language");
}

setLanguage(
    ["uk", "en", "ru"].includes(savedLanguage)
        ? savedLanguage
        : "uk"
);