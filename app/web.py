from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from app import config
from app.db import get_or_create_client

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/api/get_config/{tg_id}")
async def api_get_config(tg_id: int):
    # Автоматически создаем или получаем клиента из БД 3x-ui
    client_data = await get_or_create_client(tg_id, f"User-{tg_id}")
    if not client_data:
        return {"error": "Failed to create client"}

    user_uuid = client_data["uuid"]
    sub_id = client_data["subId"]

    # Формируем прямую VLESS ссылку
    vless_link = (
        f"vless://{user_uuid}@{config.SERVER_IP}:{config.SERVER_PORT}?"
        f"type=tcp&security=reality&pbk={config.PUBLIC_KEY}&fp=chrome"
        f"&sni={config.SNI}&sid={config.SHORT_ID}&flow=xtls-rprx-vision#"
        f"VoidSpace%20HUB"
    )

    # Ссылка на подписку (Subscription link), которую кушают клиенты (NekoBox, v2rayN и т.д.)
    # 3x-ui автоматически генерирует эндпоинт подписок, либо мы можем отдавать прямую строку
    sub_link = f"http://{config.SERVER_IP}:{config.SERVER_PORT}/sub/{sub_id}"

    return {
        "vless_link": vless_link,
        "sub_link": sub_link
    }