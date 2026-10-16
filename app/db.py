import sqlite3
import os
from app import config

def get_db_connection():
    """Подключение к SQLite базе 3x-ui"""
    db_path = getattr(config, "DB_PATH", "xui.db")
    if not os.path.exists(db_path):
        return None
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Ошибка подключения к БД 3x-ui: {e}")
        return None

async def get_client_data_from_db(tg_id: int):
    conn = get_db_connection()
    
    # Если файла базы нет (например, локальный тест)
    if not conn:
        # ВНИМАНИЕ: Если хочешь протестировать страницу 403 локально без файла БД,
        # раскомментируй строчку ниже (верни None):
        # return None
        
        return {
            "sub_id": f"demo_sub_{tg_id}",
            "up": 2400000000,
            "down": 11800000000,
            "total": 0,
            "enable": 1,
            "expiry_time": 0,
            "subPath": config.SUB_PATH,
            "exists": True
        }

    try:
        cursor = conn.cursor()
        
        # Ищем клиента в таблице clients по email или tg_id
        cursor.execute(
            "SELECT * FROM clients WHERE email LIKE ? OR tg_id = ?", 
            (f"%{tg_id}%", tg_id)
        )
        client_row = cursor.fetchone()
        
        if not client_row:
            conn.close()
            return None  # <--- Клиента нет в базе!

        traffic_row = None
        client_email = client_row["email"]
        cursor.execute(
            "SELECT up, down, total FROM client_traffics WHERE email = ?",
            (client_email,)
        )
        traffic_row = cursor.fetchone()

        cursor.execute("SELECT value FROM settings WHERE key = 'subPath'")
        setting_row = cursor.fetchone()
        sub_path = setting_row["value"] if setting_row else config.SUB_PATH

        conn.close()

        data = dict(client_row)
        if traffic_row:
            data["up"] = traffic_row["up"]
            data["down"] = traffic_row["down"]
            data["total"] = traffic_row["total"]
        data["subPath"] = sub_path
        data["exists"] = True
        return data

    except Exception as e:
        print(f"Ошибка запроса в БД 3x-ui: {e}")
        if conn:
            conn.close()
        return None

async def get_inbounds_from_db():
    """
    Достает список серверов/инбаундов из таблицы inbounds (remark, enable, port, protocol)
    """
    conn = get_db_connection()
    if not conn:
        # Мок-сервер для локальной разработки
        return [{
            "remark": "Сервер NL-01 (Нидерланды)",
            "enable": True,
            "port": 443,
            "protocol": "vless"
        }]

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT remark, enable, port, protocol FROM inbounds")
        rows = cursor.fetchall()
        conn.close()
        
        inbounds = []
        for row in rows:
            inbounds.append({
                "remark": row["remark"] or "Без названия",
                "enable": bool(row["enable"]),
                "port": row["port"],
                "protocol": row["protocol"]
            })
        return inbounds
    except Exception as e:
        print(f"Ошибка чтения inbounds из БД: {e}")
        if conn:
            conn.close()
        return []