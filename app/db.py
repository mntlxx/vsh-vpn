import json
import uuid
import subprocess
import aiosqlite
from app import config

async def get_or_create_client(tg_id: int, name: str):
    email = str(tg_id)
    async with aiosqlite.connect(config.DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        # Получаем настройки инбаунда
        async with db.execute("SELECT settings FROM inbounds WHERE id = ?", (config.INBOUND_ID,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                return None
            settings = json.loads(row[0])

        clients = settings.get("clients", [])
        existing_client = None
        
        for client in clients:
            if client.get("email") == email:
                existing_client = client
                break

        # Если клиент уже есть, возвращаем его данные
        if existing_client:
            return {
                "uuid": existing_client.get("id"),
                "subId": existing_client.get("subId"),
                "email": email
            }

        # Если нет — создаем нового
        new_uuid = str(uuid.uuid4())
        new_sub_id = uuid.uuid4().hex[:16] # Короткий токен для подписки
        
        new_client = {
            "id": new_uuid,
            "flow": "xtls-rprx-vision",
            "email": email,
            "limitIp": 0,
            "totalGB": 0,
            "expiryTime": 0,
            "enable": True,
            "tgId": str(tg_id),
            "subId": new_sub_id
        }
        
        clients.append(new_client)
        settings["clients"] = clients

        # Обновляем JSON в таблице inbounds
        await db.execute(
            "UPDATE inbounds SET settings = ? WHERE id = ?",
            (json.dumps(settings), config.INBOUND_ID)
        )

        # Создаем запись в трафике
        await db.execute(
            """
            INSERT OR IGNORE INTO client_traffics 
            (inbound_id, enable, email, up, down, expiry_time, total, reset) 
            VALUES (?, 1, ?, 0, 0, 0, 0, 0)
            """,
            (config.INBOUND_ID, email)
        )
        await db.commit()

        # Перезапускаем Xray в 3x-ui, чтобы применился новый клиент
        subprocess.run(["systemctl", "restart", "x-ui"], check=False)

        return {
            "uuid": new_uuid,
            "subId": new_sub_id,
            "email": email
        }