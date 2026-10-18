import os
import json
import sqlite3
import threading
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DB_FILE = os.path.join(DATA_DIR, "smeta24.db")
LEADS_JSON = os.path.join(DATA_DIR, "leads.json")
WALLETS_JSON = os.path.join(DATA_DIR, "wallets.json")

_db_lock = threading.Lock()

def get_connection() -> sqlite3.Connection:
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    """Baza sxemasini yaratish va mavjud JSON fayllardan avtomatik migratsiya qilish."""
    with _db_lock:
        conn = get_connection()
        cursor = conn.cursor()

        # 1. Leads jadvali
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                client_name TEXT,
                client_phone TEXT NOT NULL,
                region TEXT,
                area TEXT,
                budget TEXT,
                lead_type TEXT,
                price INTEGER DEFAULT 10000,
                created_at TEXT,
                status TEXT DEFAULT 'open',
                purchased_by TEXT DEFAULT '[]'
            )
        """)

        # 2. Wallets jadvali
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wallets (
                user_id TEXT PRIMARY KEY,
                balance INTEGER DEFAULT 15000,
                updated_at TEXT
            )
        """)
        conn.commit()

        # 3. JSON fayllardan migratsiya (agar bazada ma'lumotlar bo'lmasa)
        cursor.execute("SELECT COUNT(*) as cnt FROM leads")
        if cursor.fetchone()["cnt"] == 0 and os.path.exists(LEADS_JSON):
            try:
                with open(LEADS_JSON, "r", encoding="utf-8") as f:
                    leads_data = json.load(f)
                    for l in leads_data:
                        cursor.execute("""
                            INSERT OR IGNORE INTO leads 
                            (id, title, client_name, client_phone, region, area, budget, lead_type, price, created_at, status, purchased_by)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            l.get("id"),
                            l.get("title"),
                            l.get("client_name"),
                            l.get("client_phone"),
                            l.get("region"),
                            l.get("area"),
                            l.get("budget"),
                            l.get("lead_type"),
                            l.get("price", 10000),
                            l.get("created_at"),
                            l.get("status", "open"),
                            json.dumps(l.get("purchased_by", []))
                        ))
                conn.commit()
            except Exception as e:
                print(f"Leads JSON migratsiyasida xatolik: {e}")

        cursor.execute("SELECT COUNT(*) as cnt FROM wallets")
        if cursor.fetchone()["cnt"] == 0 and os.path.exists(WALLETS_JSON):
            try:
                with open(WALLETS_JSON, "r", encoding="utf-8") as f:
                    wallets_data = json.load(f)
                    for uid, bal in wallets_data.items():
                        cursor.execute("""
                            INSERT OR IGNORE INTO wallets (user_id, balance, updated_at)
                            VALUES (?, ?, ?)
                        """, (str(uid), int(bal), datetime.now(timezone.utc).isoformat()))
                conn.commit()
            except Exception as e:
                print(f"Wallets JSON migratsiyasida xatolik: {e}")

        conn.close()

# Dastur ishga tushganda avtomatik ishga tushirish
init_db()
