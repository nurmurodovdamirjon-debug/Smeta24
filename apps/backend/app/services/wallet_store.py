import json
import threading
from datetime import datetime, timezone
from typing import Any
from app.db.database import get_connection

_wallet_lock = threading.Lock()
DEFAULT_INITIAL_BALANCE = 15000

def get_user_balance(user_id: Any) -> int:
    """Foydalanuvchi joriy balansini SQLite bazasidan qaytaradi. Yangi user bo'lsa 15 000 bonus beriladi."""
    user_str = str(user_id)
    with _wallet_lock:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT balance FROM wallets WHERE user_id = ?", (user_str,))
        row = cursor.fetchone()
        if row:
            balance = int(row["balance"])
            conn.close()
            return balance
        
        # Yangi foydalanuvchi - 15000 bonus
        now_str = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?)",
            (user_str, DEFAULT_INITIAL_BALANCE, now_str)
        )
        conn.commit()
        conn.close()
        return DEFAULT_INITIAL_BALANCE

def add_user_balance(user_id: Any, amount: int) -> int:
    """Foydalanuvchi balansini to'ldirish (credit)."""
    if amount <= 0:
        return get_user_balance(user_id)
    user_str = str(user_id)
    with _wallet_lock:
        conn = get_connection()
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        
        cursor.execute("SELECT balance FROM wallets WHERE user_id = ?", (user_str,))
        row = cursor.fetchone()
        if row:
            new_balance = int(row["balance"]) + amount
            cursor.execute(
                "UPDATE wallets SET balance = ?, updated_at = ? WHERE user_id = ?",
                (new_balance, now_str, user_str)
            )
        else:
            new_balance = DEFAULT_INITIAL_BALANCE + amount
            cursor.execute(
                "INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?)",
                (user_str, new_balance, now_str)
            )
        conn.commit()
        conn.close()
        return new_balance

def deduct_user_balance(user_id: Any, amount: int) -> bool:
    """
    Foydalanuvchi balansidan mablag' yechish (debit).
    Agar mablag' yetarli bo'lsa, tranzaksiya bilan yechib True qaytaradi.
    Yetarli bo'lmasa, balans o'zgarmaydi va False qaytaradi.
    """
    if amount <= 0:
        return True
    user_str = str(user_id)
    with _wallet_lock:
        conn = get_connection()
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        
        cursor.execute("SELECT balance FROM wallets WHERE user_id = ?", (user_str,))
        row = cursor.fetchone()
        current_balance = int(row["balance"]) if row else DEFAULT_INITIAL_BALANCE
        
        if current_balance < amount:
            conn.close()
            return False
            
        new_balance = current_balance - amount
        if row:
            cursor.execute(
                "UPDATE wallets SET balance = ?, updated_at = ? WHERE user_id = ?",
                (new_balance, now_str, user_str)
            )
        else:
            cursor.execute(
                "INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?)",
                (user_str, new_balance, now_str)
            )
        conn.commit()
        conn.close()
        return True
