
import os
import json
import time
import hmac
import hashlib
import random
import secrets
import string

from pathlib import Path
from urllib.parse import parse_qsl

from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ==========================================
# CONFIGURATION
# ==========================================

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError(
        "BOT_TOKEN is missing. Set it in environment variables."
    )

BASE_DIR = Path(__file__).parent
PACKS_FILE = BASE_DIR / "packs_default.json"

if not PACKS_FILE.exists():
    raise RuntimeError("packs_default.json not found")

with open(PACKS_FILE, "r", encoding="utf-8") as file:
    DEFAULT_PACKS = json.load(file)

app = FastAPI(title="TOTALLY SPY API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://unprocessed34.github.io"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=[
        "Content-Type",
        "X-Telegram-Init-Data"
    ],
)

# Prototype storage. Rooms disappear when the server restarts.
rooms = {}


# ==========================================
# TELEGRAM AUTHENTICATION
# ==========================================

def verify_telegram_data(init_data: str):
    if not init_data:
        raise HTTPException(
            status_code=401,
            detail="Telegram authorization required"
        )

    try:
        parsed = dict(
            parse_qsl(init_data, keep_blank_values=True)
        )

        received_hash = parsed.pop("hash", None)

        if not received_hash:
            raise ValueError("Missing hash")

        auth_date = int(parsed.get("auth_date", "0"))

        if time.time() - auth_date > 86400:
            raise ValueError("Authorization expired")

        data_check_string = "\n".join(
            f"{key}={value}"
            for key, value in sorted(parsed.items())
        )

        secret_key = hmac.new(
            b"WebAppData",
            BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()

        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(
            calculated_hash,
            received_hash
        ):
            raise ValueError("Invalid signature")

        telegram_user = json.loads(parsed["user"])

        return {
            "id": int(telegram_user["id"]),
            "name": telegram_user.get("first_name", "Agent"),
            "language": telegram_user.get("language_code", "uk")
        }

    except (
        ValueError,
        KeyError,
        TypeError,
        json.JSONDecodeError
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Telegram authorization"
        )


def get_current_user(
    x_telegram_init_data: str = Header(default="")
):
    return verify_telegram_data(x_telegram_init_data)


# ==========================================
# REQUEST MODELS
# ==========================================

class CreateRoomRequest(BaseModel):
    pack_id: str
    spy_count: int = Field(default=1, ge=1, le=3)


class JoinRoomRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


# ==========================================
# TRANSLATIONS AND WORDS
# ==========================================

def normalize_language(language):
    if language.startswith("en"):
        return "en"

    if language.startswith("ru"):
        return "ru"

    return "uk"


def get_pack(pack_id):
    pack = DEFAULT_PACKS.get(pack_id)

    if not pack:
        raise HTTPException(404, "Pack not found")

    return pack


def get_pack_words(pack_id):
    pack = get_pack(pack_id)
    words = pack.get("words", [])

    if len(words) < 2:
        raise HTTPException(400, "Pack has too few words")

    return words


def translated_word(word_data, language):
    if isinstance(word_data, dict):
        return (
            word_data.get(language)
            or word_data.get("uk")
            or next(iter(word_data.values()), "?")
        )

    return str(word_data)


def get_pack_name(pack_id, language):
    pack = get_pack(pack_id)

    return (
        pack.get("names", {}).get(language)
        or pack.get("names", {}).get("uk")
        or pack_id
    )


# ==========================================
# SPY CLUES
# ==========================================

CLUES = {
    "uk": {
        "Парасолька":
            "Про неї згадують, коли небо змінює плани.",
        "Яблуко":
            "Його часто пов'язують із вибором, знанням і спокусою.",
        "Море":
            "Воно може здаватися спокійним, але ніколи не буває цілком передбачуваним.",
        "Літак":
            "Він скорочує відстані, хоча сам не має постійного місця.",
        "Книга":
            "У ній можна загубитися, не зробивши жодного кроку.",
        "Телефон":
            "Він тримає поруч тих, хто може бути дуже далеко.",
        "Годинник":
            "Його помічають особливо часто, коли чогось чекають.",
        "Міст":
            "Він з'єднує те, що інакше залишалося б розділеним.",
        "Ключ":
            "Його цінність стає очевидною перед зачиненими дверима.",
        "Дзеркало":
            "Воно показує знайоме, але не завжди так, як очікуєш."
    },

    "en": {
        "Umbrella":
            "People remember it when the sky changes its plans.",
        "Apple":
            "It is often linked with choice, knowledge and temptation.",
        "Sea":
            "It may look calm, but it is never entirely predictable.",
        "Airplane":
            "It shortens distances without having a permanent place.",
        "Book":
            "You can get lost in it without taking a single step.",
        "Phone":
            "It keeps close those who may be very far away.",
        "Clock":
            "People notice it most when they are waiting.",
        "Bridge":
            "It connects things that would otherwise remain apart.",
        "Key":
            "Its value becomes clear in front of a locked door.",
        "Mirror":
            "It shows something familiar, but not always as expected."
    },

    "ru": {
        "Зонт":
            "О нём вспоминают, когда небо меняет планы.",
        "Яблоко":
            "Его часто связывают с выбором, знанием и искушением.",
        "Море":
            "Оно может казаться спокойным, но никогда не бывает полностью предсказуемым.",
        "Самолёт":
            "Он сокращает расстояния, не имея постоянного места.",
        "Книга":
            "В ней можно потеряться, не сделав ни одного шага.",
        "Телефон":
            "Он держит рядом тех, кто может быть очень далеко.",
        "Часы":
            "Их особенно часто замечают, когда чего-то ждут.",
        "Мост":
            "Он соединяет то, что иначе оставалось бы разделённым.",
        "Ключ":
            "Его ценность становится очевидной перед закрытой дверью.",
        "Зеркало":
            "Оно показывает знакомое, но не всегда так, как ожидаешь."
    }
}


FALLBACK_CLUES = {
    "uk": [
        "Його справжнє значення помітніше в певній ситуації, ніж саме по собі.",
        "З ним знайомі майже всі, але використовують його по-різному.",
        "Його легко недооцінити, поки не виникне потреба.",
        "Воно має свою роль у повсякденному житті, хоча про це рідко замислюються.",
        "Його можна впізнати за наслідками, навіть не побачивши самого."
    ],

    "en": [
        "Its real importance becomes clearer in a particular situation.",
        "Almost everyone knows it, but people use it differently.",
        "It is easy to underestimate until it is needed.",
        "It has a role in everyday life that people rarely consider.",
        "You can recognize its effects without seeing it directly."
    ],

    "ru": [
        "Его настоящее значение заметнее в определённой ситуации.",
        "Почти все его знают, но используют по-разному.",
        "Его легко недооценить, пока оно не понадобится.",
        "У него есть своя роль в повседневной жизни, о которой редко задумываются.",
        "Его можно узнать по последствиям, даже не увидев самого."
    ]
}


def make_spy_hint(word, language):
    language = normalize_language(language)

    clue = CLUES.get(language, {}).get(word)

    if clue:
        return clue

    return random.choice(FALLBACK_CLUES[language])


# ==========================================
# ROOM HELPERS
# ==========================================

def make_room_code():
    alphabet = string.ascii_uppercase + string.digits

    while True:
        code = "".join(
            secrets.choice(alphabet)
            for _ in range(6)
        )

        if code not in rooms:
            return code


def get_room(code):
    room = rooms.get(code.upper())

    if not room:
        raise HTTPException(404, "Room not found")

    return room


def get_player(room, user):
    return room["players"].get(str(user["id"]))


def require_player(room, user):
    player = get_player(room, user)

    if not player:
        raise HTTPException(
            403,
            "You are not a member of this room"
        )

    return player


def public_room_state(room, user):
    player = require_player(room, user)

    result = {
        "code": room["code"],
        "status": room["status"],
        "host_id": room["host_id"],
        "spy_count": room["spy_count"],
        "pack_id": room["pack_id"],
        "pack_name": get_pack_name(
            room["pack_id"],
            normalize_language(user["language"])
        ),
        "players": [
            {
                "id": item["id"],
                "name": item["name"],
                "is_host": item["id"] == room["host_id"]
            }
            for item in room["players"].values()
        ],
        "my_role": None
    }

    # A player receives only their own role.
    if room["status"] == "playing":
        if player["role"] == "spy":
            result["my_role"] = {
                "role": "spy",
                "hint": player["hint"]
            }
        else:
            result["my_role"] = {
                "role": "player",
                "word": player["word"]
            }

    return result


# ==========================================
# HOME AND PACKS
# ==========================================

@app.get("/")
def home():
    return {
        "name": "TOTALLY SPY",
        "status": "online"
    }


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/me")
def me(user=Depends(get_current_user)):
    return {
        "id": user["id"],
        "name": user["name"],
        "language": normalize_language(user["language"])
    }


@app.get("/api/packs")
def list_packs(user=Depends(get_current_user)):
    language = normalize_language(user["language"])

    return [
        {
            "id": pack_id,
            "name": get_pack_name(pack_id, language),
            "word_count": len(pack.get("words", []))
        }
        for pack_id, pack in DEFAULT_PACKS.items()
    ]


# ==========================================
# CREATE ROOM
# ==========================================

@app.post("/api/rooms")
def create_room(
    data: CreateRoomRequest,
    user=Depends(get_current_user)
):
    get_pack_words(data.pack_id)

    code = make_room_code()
    user_id = str(user["id"])

    rooms[code] = {
        "code": code,
        "host_id": user["id"],
        "status": "waiting",
        "pack_id": data.pack_id,
        "spy_count": data.spy_count,
        "players": {
            user_id: {
                "id": user["id"],
                "name": user["name"],
                "language": normalize_language(user["language"]),
                "role": None,
                "word": None,
                "hint": None
            }
        }
    }

    return public_room_state(rooms[code], user)


# ==========================================
# JOIN ROOM
# ==========================================

@app.post("/api/rooms/join")
def join_room(
    data: JoinRoomRequest,
    user=Depends(get_current_user)
):
    room = get_room(data.code)

    if room["status"] != "waiting":
        raise HTTPException(
            400,
            "Game has already started"
        )

    user_id = str(user["id"])

    if user_id not in room["players"]:
        if len(room["players"]) >= 20:
            raise HTTPException(400, "Room is full")

        room["players"][user_id] = {
            "id": user["id"],
            "name": user["name"],
            "language": normalize_language(user["language"]),
            "role": None,
            "word": None,
            "hint": None
        }

    return public_room_state(room, user)


# ==========================================
# ROOM STATE
# ==========================================

@app.get("/api/rooms/{code}")
def room_state(
    code: str,
    user=Depends(get_current_user)
):
    room = get_room(code)
    return public_room_state(room, user)


# ==========================================
# START GAME
# ==========================================

@app.post("/api/rooms/{code}/start")
def start_game(
    code: str,
    user=Depends(get_current_user)
):
    room = get_room(code)

    if user["id"] != room["host_id"]:
        raise HTTPException(
            403,
            "Only the host can start the game"
        )

    if room["status"] != "waiting":
        raise HTTPException(
            400,
            "Game has already started"
        )

    players = list(room["players"].values())

    if len(players) < 3:
        raise HTTPException(
            400,
            "At least 3 players are required"
        )

    if room["spy_count"] >= len(players):
        raise HTTPException(
            400,
            "Too many spies"
        )

    words = get_pack_words(room["pack_id"])
    secret_word_data = random.choice(words)

    spies = random.sample(
        players,
        room["spy_count"]
    )

    spy_ids = {
        player["id"]
        for player in spies
    }

    for player in players:
        language = normalize_language(
            player["language"]
        )

        word = translated_word(
            secret_word_data,
            language
        )

        if player["id"] in spy_ids:
            player["role"] = "spy"
            player["word"] = None
            player["hint"] = make_spy_hint(
                word,
                language
            )
        else:
            player["role"] = "player"
            player["word"] = word
            player["hint"] = None

    room["status"] = "playing"

    return {
        "status": "playing",
        "message": "Roles assigned. Open your own role."
    }
