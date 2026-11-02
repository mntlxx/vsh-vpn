import sqlite3
import re
import time
from playwright.sync_api import sync_playwright
from pathlib import Path

def extract_anime_id(url: str) -> int:
    """Вытаскивает числовой ID аниме из ссылки."""
    match = re.search(r'/(\d+)-', url)
    if match:
        return int(match.group(1))
    match_digits = re.search(r'(\d+)', url)
    return int(match_digits.group(1)) if match_digits else 0

def init_global_db(db_name="./db/anigm.db"):
    """Создает чистые таблицы без лишних колонок."""

    path = Path(db_name)
    path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Таблица метаданных тайтлов
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS animes (
            anime_id INTEGER PRIMARY KEY,
            title TEXT,
            description TEXT,
            age_rating TEXT,
            year TEXT,
            last_episode TEXT,
            total_episodes TEXT,
            tags TEXT,
            director TEXT,
            studio TEXT,
            url TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Таблица эпизодов (без избыточного episodes_info)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS episodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anime_id INTEGER,
            voice_name TEXT,
            episode_num INTEGER,
            iframe_url TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (anime_id) REFERENCES animes (anime_id) ON DELETE CASCADE,
            UNIQUE(anime_id, voice_name, episode_num)
        )
    """)
    
    conn.commit()
    return conn

def save_to_global_db(conn, anime_url: str, metadata: dict, voices_data: list):
    """Сохраняет тайтл и чистый список серий в общие таблицы."""
    cursor = conn.cursor()
    anime_id = extract_anime_id(anime_url)
    
    if not anime_id:
        print("❌ Ошибка: не удалось определить ID аниме.")
        return

    # 1. Записываем информацию о тайтле
    cursor.execute("""
        INSERT OR REPLACE INTO animes 
        (anime_id, title, description, age_rating, year, last_episode, total_episodes, tags, director, studio, url, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (
        anime_id, metadata["title"], metadata["description"], metadata["age_rating"],
        metadata["year"], metadata["last_episode"], metadata["total_episodes"],
        metadata["tags"], metadata["director"], metadata["studio"], anime_url
    ))
    
    # 2. Записываем серии в таблицу episodes (без лишних полей)
    for item in voices_data:
        cursor.execute("""
            INSERT OR REPLACE INTO episodes (anime_id, voice_name, episode_num, iframe_url, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (anime_id, item['name'], item['episode_num'], item['iframe']))
        
    conn.commit()
    print(f"💾 Данные успешно записаны в чистые таблицы для аниме ID: {anime_id} ({metadata['title']})")

def parse_anime_metadata(page) -> dict:
    """Парсит метаданные тайтла."""
    metadata = {
        "title": "Неизвестно", "description": "", "age_rating": "",
        "year": "", "last_episode": "", "total_episodes": "",
        "tags": "", "director": "", "studio": ""
    }
    
    try:
        h1 = page.locator("h1").first
        if h1.count() > 0:
            metadata["title"] = h1.inner_text().strip()
            
        desc = page.locator(".full-story, .story, .description").first
        if desc.count() > 0:
            metadata["description"] = desc.inner_text().strip()
            
        info_items = page.locator("ul.info li")
        for i in range(info_items.count()):
            item = info_items.nth(i)
            try:
                label = item.locator("span").inner_text().strip().lower()
                value = item.locator("b").inner_text().strip()
                
                if "год" in label: metadata["year"] = value
                elif "возраст" in label: metadata["age_rating"] = value
                elif "режиссёр" in label or "режиссер" in label: metadata["director"] = value
                elif "последняя серия" in label: metadata["last_episode"] = value
                elif "всего серий" in label: metadata["total_episodes"] = value
                elif "студия" in label: metadata["studio"] = value
                elif "жанры" in label:
                    links = item.locator("a")
                    metadata["tags"] = ", ".join([links.nth(j).inner_text().strip() for j in range(links.count())])
            except:
                continue
    except Exception as e:
        print(f"⚠️ Ошибка парсинга метаданных: {e}")
        
    return metadata

def get_all_voices_and_episodes(page_url: str, max_episodes: int = 3):
    print(f"🔍 Открываем страницу: {page_url}")
    results = []
    metadata = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        try:
            page.goto(page_url, timeout=30000)
            page.wait_for_selector(".tr-list button.tr-it", timeout=10000)
            
            metadata = parse_anime_metadata(page)
            
            voice_buttons = page.locator(".tr-list button.tr-it")
            count = voice_buttons.count()
            print(f"📋 Найдено студий озвучки: {count}\n")
            
            for i in range(count):
                btn = page.locator(".tr-list button.tr-it").nth(i)
                name = btn.locator(".tr-t").inner_text().strip()
                
                if "sub" in (btn.get_attribute("data-t") or ""):
                    continue
                
                print(f"--- Студия [{i+1}/{count}]: {name} ---")
                
                if "on" not in (btn.get_attribute("class") or ""):
                    try:
                        btn.scroll_into_view_if_needed()
                        btn.click(timeout=5000)
                        time.sleep(1.0)
                    except:
                        try:
                            btn.click(force=True)
                            time.sleep(1.0)
                        except:
                            continue
                
                try:
                    page.wait_for_selector(".tr-eps button.tr-ep", timeout=4000)
                    ep_buttons = page.locator(".tr-eps button.tr-ep")
                    target_ep_count = min(ep_buttons.count(), max_episodes)
                    
                    for e_idx in range(target_ep_count):
                        print(f"Эпизод: {e_idx}")
                        e_btn = page.locator(".tr-eps button.tr-ep").nth(e_idx)
                        ep_text = e_btn.inner_text().strip()
                        if not ep_text.isdigit(): continue
                        ep_num = int(ep_text)
                        
                        if "on" not in (e_btn.get_attribute("class") or ""):
                            e_btn.scroll_into_view_if_needed()
                            e_btn.click(timeout=3000)
                            time.sleep(0.7)
                        
                        iframe_element = page.wait_for_selector("iframe[src*='kodik'], iframe[src*='player'], iframe[src*='solod']", timeout=4000)
                        if iframe_element:
                            src = iframe_element.get_attribute('src')
                            if src:
                                iframe_link = 'https:' + src if src.startswith('//') else src
                                results.append({
                                    "name": name,
                                    "episode_num": ep_num,
                                    "iframe": iframe_link
                                })
                except Exception as e:
                    print(f"⚠️ Ошибка серий для {name}: {e}")
                    
        except Exception as e:
            print(f"⚠️ Ошибка сессии: {e}")
        browser.close()
        
    return metadata, results

if __name__ == "__main__":
    print("Parser mode: AnimeYard")
    test_url = str(input("Введите ссылку на тайтл из сайта AnimeYard (все автоматически подтянется, от названия до iframe):\n > "))
    
    metadata, collected_data = get_all_voices_and_episodes(test_url, max_episodes=1500)
    
    if collected_data and metadata:
        db = init_global_db("../db/anigm.db")
        save_to_global_db(db, test_url, metadata, collected_data)
        db.close()
        print("Готово! База данных сохранена от этого пути как ../db/anigm.db.")