
const tg = window.Telegram?.WebApp;
const API = "https://totally-spy.onrender.com";

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor("#090909");
    tg.setBackgroundColor("#090909");
}

let currentLanguage = localStorage.getItem("spyLanguage") || "uk";
let currentRoom = null;
let refreshTimer = null;

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
        packs: "Ігрові паки",
        statistics: "Твоя статистика",
        choosePack: "Вибери пак слів",
        spies: "Кількість шпигунів",
        create: "Створити кімнату",
        join: "Приєднатися до кімнати",
        code: "Код кімнати",
        enterCode: "Введи код",
        players: "Гравці",
        waiting: "Очікуємо гравців...",
        start: "Почати гру",
        copy: "Скопіювати код",
        copied: "Код скопійовано!",
        role: "Твоя роль",
        spy: "ТИ ШПИГУН",
        player: "ТИ ГРАВЕЦЬ",
        hint: "Твоя підказка",
        word: "Секретне слово",
        loading: "Завантаження...",
        error: "Сталася помилка",
        needTelegram: "Відкрий Mini App через Telegram, щоб грати.",
        noPlayers: "Потрібно щонайменше 3 гравці.",
        hostOnly: "Почати гру може тільки творець кімнати.",
        joinButton: "Увійти",
        close: "Закрити",
        chooseLanguage: "Вибери мову",
        waitingRole: "Очікуємо початку гри...",
        spyCountError: "Шпигунів має бути менше, ніж гравців.",
        gameStarted: "Гру розпочато!",
        statsText: "Статистика з'явиться в наступних оновленнях."
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
        packs: "Game packs",
        statistics: "Your statistics",
        choosePack: "Choose a word pack",
        spies: "Number of spies",
        create: "Create room",
        join: "Join a room",
        code: "Room code",
        enterCode: "Enter code",
        players: "Players",
        waiting: "Waiting for players...",
        start: "Start game",
        copy: "Copy code",
        copied: "Code copied!",
        role: "Your role",
        spy: "YOU ARE THE SPY",
        player: "YOU ARE A PLAYER",
        hint: "Your hint",
        word: "Secret word",
        loading: "Loading...",
        error: "Something went wrong",
        needTelegram: "Open the Mini App through Telegram to play.",
        noPlayers: "At least 3 players are required.",
        hostOnly: "Only the room host can start the game.",
        joinButton: "Join",
        close: "Close",
        chooseLanguage: "Choose language",
        waitingRole: "Waiting for the game to start...",
        spyCountError: "There must be fewer spies than players.",
        gameStarted: "Game started!",
        statsText: "Statistics will arrive in a future update."
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
        packs: "Игровые паки",
        statistics: "Твоя статистика",
        choosePack: "Выбери пак слов",
        spies: "Количество шпионов",
        create: "Создать комнату",
        join: "Присоединиться",
        code: "Код комнаты",
        enterCode: "Введи код",
        players: "Игроки",
        waiting: "Ожидаем игроков...",
        start: "Начать игру",
        copy: "Скопировать код",
        copied: "Код скопирован!",
        role: "Твоя роль",
        spy: "ТЫ ШПИОН",
        player: "ТЫ ИГРОК",
        hint: "Твоя подсказка",
        word: "Секретное слово",
        loading: "Загрузка...",
        error: "Произошла ошибка",
        needTelegram: "Открой Mini App через Telegram, чтобы играть.",
        noPlayers: "Нужно минимум 3 игрока.",
        hostOnly: "Начать игру может только создатель комнаты.",
        joinButton: "Войти",
        close: "Закрыть",
        chooseLanguage: "Выбери язык",
        waitingRole: "Ожидаем начала игры...",
        spyCountError: "Шпионов должно быть меньше, чем игроков.",
        gameStarted: "Игра началась!",
        statsText: "Статистика появится в следующих обновлениях."
    }
};

const t = () => translations[currentLanguage] || translations.uk;

function element(id) {
    return document.getElementById(id);
}

function showError(message) {
    const content = element("screenContent");
    if (!content) return;

    content.innerHTML = "";
    const p = document.createElement("p");
    p.className = "error-message";
    p.textContent = message;
    content.appendChild(p);
}

function makeButton(text, className, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className || "menu-button";
    button.textContent = text;
    button.addEventListener("click", action);
    return button;
}

function makeLabel(text) {
    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = text;
    return label;
}

function makeInput(placeholder, maxLength = 30) {
    const input = document.createElement("input");
    input.placeholder = placeholder;
    input.maxLength = maxLength;
    input.autocomplete = "off";
    input.className = "game-input";
    return input;
}

function setLanguage(lang) {
    if (!translations[lang]) return;

    currentLanguage = lang;
    localStorage.setItem("spyLanguage", lang);

    element("greeting").textContent = t().greeting;
    element("subtitle").textContent = t().subtitle;
    element("newGame").textContent = t().newGame;
    element("myPacks").textContent = t().myPacks;
    element("language").textContent = t().language;
    element("stats").textContent = t().stats;

    if (tg) tg.HapticFeedback?.selectionChanged();
}

function openScreen(name) {
    clearInterval(refreshTimer);

    element("screen").classList.remove("hidden");

    if (name === "game") {
        showGameScreen();
    } else if (name === "packs") {
        showPacksScreen();
    } else if (name === "stats") {
        showStatsScreen();
    } else if (name === "language") {
        showLanguageScreen();
    }

    tg?.HapticFeedback?.impactOccurred("light");
}

function goHome() {
    clearInterval(refreshTimer);
    element("screen").classList.add("hidden");
    currentRoom = null;
}

function setTitle(title) {
    element("screenTitle").textContent = title;
    element("screenContent").innerHTML = "";
}

function getInitData() {
    return tg?.initData || "";
}

async function api(path, options = {}) {
    const initData = getInitData();

    if (!initData) {
        throw new Error(t().needTelegram);
    }

    const response = await fetch(API + path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData,
            ...(options.headers || {})
        }
    });

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.detail || `${t().error}: ${response.status}`
        );
    }

    return data;
}

// ======================================
// NEW GAME
// ======================================

async function showGameScreen() {
    setTitle(t().game);

    const content = element("screenContent");
    const loading = document.createElement("p");
    loading.textContent = t().loading;
    content.appendChild(loading);

    try {
        const packs = await api("/api/packs");
        content.innerHTML = "";

        const packLabel = makeLabel(t().choosePack);
        const packSelect = document.createElement("select");
        packSelect.className = "game-input";

        packs.forEach(pack => {
            const option = document.createElement("option");
            option.value = pack.id;
            option.textContent = pack.name;
            packSelect.appendChild(option);
        });

        const spyLabel = makeLabel(t().spies);
        const spySelect = document.createElement("select");
        spySelect.className = "game-input";

        [1, 2, 3].forEach(number => {
            const option = document.createElement("option");
            option.value = number;
            option.textContent = number;
            spySelect.appendChild(option);
        });

        content.append(
            packLabel,
            packSelect,
            spyLabel,
            spySelect
        );

        content.appendChild(
            makeButton(t().create, "primary-button", async () => {
                try {
                    const room = await api("/api/rooms", {
                        method: "POST",
                        body: JSON.stringify({
                            pack_id: packSelect.value,
                            spy_count: Number(spySelect.value)
                        })
                    });

                    currentRoom = room;
                    showRoomScreen();
                } catch (error) {
                    showError(error.message);
                }
            })
        );

        content.appendChild(
            makeButton(t().join, "menu-button", showJoinScreen)
        );

    } catch (error) {
        showError(error.message);
    }
}

// ======================================
// JOIN ROOM
// ======================================

function showJoinScreen() {
    setTitle(t().join);

    const content = element("screenContent");
    const label = makeLabel(t().code);
    const input = makeInput(t().enterCode, 6);

    input.style.textTransform = "uppercase";

    content.append(label, input);

    content.appendChild(
        makeButton(t().joinButton, "primary-button", async () => {
            const code = input.value.trim().toUpperCase();

            if (code.length !== 6) {
                showError("Код має містити 6 символів.");
                return;
            }

            try {
                currentRoom = await api("/api/rooms/join", {
                    method: "POST",
                    body: JSON.stringify({ code })
                });

                showRoomScreen();
            } catch (error) {
                showError(error.message);
            }
        })
    );
}

// ======================================
// ROOM SCREEN
// ======================================

function showRoomScreen() {
    clearInterval(refreshTimer);
    setTitle(`${t().code}: ${currentRoom.code}`);

    const content = element("screenContent");

    const code = document.createElement("div");
    code.className = "room-code";
    code.textContent = currentRoom.code;

    content.appendChild(code);

    content.appendChild(
        makeButton(t().copy, "menu-button", async () => {
            try {
                await navigator.clipboard.writeText(currentRoom.code);
                alert(t().copied);
            } catch {
                alert(currentRoom.code);
            }
        })
    );

    const playersTitle = document.createElement("h3");
    playersTitle.textContent = t().players;
    content.appendChild(playersTitle);

    const playersList = document.createElement("div");
    playersList.id = "playersList";
    content.appendChild(playersList);

    const startButton = makeButton(
        t().start,
        "primary-button",
        startGame
    );

    startButton.id = "startGameButton";

    if (currentRoom.host_id !== currentRoom.players?.find(
        p => p.is_host
    )?.id) {
        startButton.classList.add("hidden");
    }

    content.appendChild(startButton);

    const status = document.createElement("p");
    status.id = "roomStatus";
    status.textContent = t().waiting;
    content.appendChild(status);

    updateRoom();

    refreshTimer = setInterval(updateRoom, 2500);
}

async function updateRoom() {
    if (!currentRoom) return;

    try {
        const room = await api(
            `/api/rooms/${encodeURIComponent(currentRoom.code)}`
        );

        currentRoom = room;

        if (room.status === "playing") {
            clearInterval(refreshTimer);
            showMyRole(room);
            return;
        }

        const list = element("playersList");
        if (list) {
            list.innerHTML = "";

            room.players.forEach(player => {
                const item = document.createElement("div");
                item.className = "player-item";
                item.textContent =
                    "🕵️ " + player.name +
                    (player.is_host ? " 👑" : "");

                list.appendChild(item);
            });
        }

        const startButton = element("startGameButton");

        if (startButton) {
            startButton.classList.toggle(
                "hidden",
                room.host_id !== room.players.find(
                    player => player.is_host
                )?.id
            );
        }

    } catch (error) {
        const status = element("roomStatus");
        if (status) status.textContent = error.message;
    }
}

// ======================================
// START GAME
// ======================================

async function startGame() {
    if (!currentRoom) return;

    try {
        await api(
            `/api/rooms/${encodeURIComponent(currentRoom.code)}/start`,
            { method: "POST" }
        );

        tg?.HapticFeedback?.notificationOccurred("success");
        await updateRoom();

    } catch (error) {
        showError(error.message);
    }
}

// ======================================
// PLAYER ROLE
// ======================================

function showMyRole(room) {
    setTitle(t().role);

    const content = element("screenContent");
    const role = room.my_role;

    if (!role) {
        showError("Не вдалося отримати твою роль. Онови кімнату.");
        return;
    }

    const card = document.createElement("div");
    card.className = "role-card";

    if (role.role === "spy") {
        const heading = document.createElement("h2");
        heading.textContent = t().spy;

        const hintTitle = document.createElement("p");
        hintTitle.textContent = t().hint;

        const hint = document.createElement("div");
        hint.className = "role-word";
        hint.textContent = role.hint;

        card.append(heading, hintTitle, hint);
    } else {
        const heading = document.createElement("h2");
        heading.textContent = t().player;

        const wordTitle = document.createElement("p");
        wordTitle.textContent = t().word;

        const word = document.createElement("div");
        word.className = "role-word";
        word.textContent = role.word;

        card.append(heading, wordTitle, word);
    }

    content.appendChild(card);

    const note = document.createElement("p");
    note.textContent = "Не показуй свою роль іншим гравцям!";
    content.appendChild(note);

    tg?.HapticFeedback?.notificationOccurred("success");
}

// ======================================
// PACKS
// ======================================

async function showPacksScreen() {
    setTitle(t().packs);

    const content = element("screenContent");
    const loading = document.createElement("p");
    loading.textContent = t().loading;
    content.appendChild(loading);

    try {
        const packs = await api("/api/packs");
        content.innerHTML = "";

        packs.forEach(pack => {
            const item = document.createElement("div");
            item.className = "player-item";
            item.textContent =
                "📦 " + pack.name +
                " — " + pack.word_count;

            content.appendChild(item);
        });

    } catch (error) {
        showError(error.message);
    }
}

// ======================================
// LANGUAGE
// ======================================

function showLanguageScreen() {
    setTitle(t().chooseLanguage);

    const content = element("screenContent");

    [
        ["uk", "🇺🇦 Українська"],
        ["en", "🇬🇧 English"],
        ["ru", "🇷🇺 Русский"]
    ].forEach(([lang, name]) => {
        content.appendChild(
            makeButton(name, "menu-button", () => {
                setLanguage(lang);
                openScreen("language");
            })
        );
    });
}

// ======================================
// STATISTICS
// ======================================

function showStatsScreen() {
    setTitle(t().statistics);

    const p = document.createElement("p");
    p.textContent = t().statsText;

    element("screenContent").appendChild(p);
}

// ======================================
// INIT
// ======================================

setLanguage(
    ["uk", "en", "ru"].includes(currentLanguage)
        ? currentLanguage
        : "uk"
);
