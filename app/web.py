from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

from app import config
from app.db import get_client_data_from_db, get_inbounds_from_db

from app.yt_service import router as yt_router

app = FastAPI(title="VoidSpace HUB")

app.include_router(yt_router)

# Монтирование статики
app.mount("/css", StaticFiles(directory="static/css"), name="css")
app.mount("/js", StaticFiles(directory="static/js"), name="js")
app.mount("/svg", StaticFiles(directory="static/svg"), name="svg")
app.mount("/testing", StaticFiles(directory="static/testing"), name="testing")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = "static/html/index.html"
    if not os.path.exists(html_path):
        html_path = "static/html/index.html"
    with open(html_path, "r", encoding="utf-8") as f:
        return f.read()

@app.get("/403", response_class=HTMLResponse)
async def access_denied_page():
    html_path = "static/html/403.html"
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "Access Denied", 403

@app.get("/logo.png")
async def get_logo():
    return FileResponse("static/logo.png")

@app.get("/api/get_config/{tg_id}")
async def api_get_config(tg_id: int):
    client = await get_client_data_from_db(tg_id)
    
    # Если клиент равен None — отдаем 404
    if not client:
        return JSONResponse(
            content={"access_denied": True, "error": "User not found"}, 
            status_code=404
        )

    # Клиент найден — отдаем его конфигурацию
    up_bytes = client.get("up", 0)
    down_bytes = client.get("down", 0)
    total_bytes = client.get("total", 0)
    
    used_bytes = up_bytes + down_bytes
    used_gb = round(used_bytes / (1024**3), 2)
    down_gb = round(down_bytes / (1024**3), 2)
    up_gb = round(up_bytes / (1024**3), 2)

    sub_id = client.get("sub_id", f"sub_{tg_id}")
    sub_path = client.get("subPath", config.SUB_PATH).strip("/")
    sub_link = f"http://{config.SERVER_IP}:{config.SERVER_PORT}/{sub_path}/{sub_id}"

    expiry = client.get("expiry_time", 0)
    expire_date = "Бессрочно" if expiry == 0 else "По расписанию"
    
    enable_val = client.get("enable", 1)
    is_active = True if (enable_val == 1 or enable_val is True) else False

    return JSONResponse(content={
        "access_denied": False,
        "is_active": is_active,
        "status": "Активна" if is_active else "Неактивна",
        "support_username": "@mntlxx72",
        "sub_link": sub_link,
        "used_bytes": f"{used_gb:.2f}",
        "download": f"{down_gb:.2f} GB",
        "upload": f"{up_gb:.2f} GB",
        "expire_days": "∞" if expiry == 0 else "30",
        "expire_date": expire_date
    })

@app.get("/api/system_status")
async def system_status():
    """Отдает реальные инбаунды из таблицы inbounds для отображения серверов"""
    inbounds = await get_inbounds_from_db()
    
    servers_status = {}
    for i, ib in enumerate(inbounds):
        servers_status[f"server_{i}"] = {
            "name": ib["remark"],
            "status": "online" if ib["enable"] else "offline",
            "protocol": ib["protocol"],
            "port": ib["port"]
        }

    return JSONResponse(content={
        "servers": servers_status,
        "youtubegm": {"status": "online"},
        "parser_worker": {"status": "online"}
    })