import sqlite3

class AniDatabase:
    def __init__(self, db_name="animgm.db"):
        self.db_name = db_name
        self._init_tables()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row  # Чтобы обращаться к полям по именам колонок (например, row['title'])
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_tables(self):
        """Инициализирует системные таблицы (например, историю пользователей), если их еще нет."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Таблица истории просмотра пользователей (Telegram ID -> Тайтл -> Серия)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_history (
                telegram_id INTEGER PRIMARY KEY,
                last_anime_id INTEGER,
                last_episode INTEGER,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (last_anime_id) REFERENCES animes (anime_id) ON DELETE SET NULL
            )
        """)
        
        conn.commit()
        conn.close()

    # --- МЕТОДЫ ДЛЯ РАБОТЫ С ПРОГРЕССОМ ПОЛЬЗОВАТЕЛЯ ---

    def set_user_progress(self, telegram_id: int, anime_id: int, episode_num: int):
        """Сохраняет или обновляет текущую позицию просмотра пользователя."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO user_history (telegram_id, last_anime_id, last_episode, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """, (telegram_id, anime_id, episode_num))
        conn.commit()
        conn.close()

    def get_user_progress(self, telegram_id: int) -> dict:
        """Возвращает последний просматриваемый тайтл и серию пользователя."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UH.telegram_id, UH.last_anime_id, UH.last_episode, A.title 
            FROM user_history UH
            LEFT JOIN animes A ON UH.last_anime_id = A.anime_id
            WHERE UH.telegram_id = ?
        """, (telegram_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "telegram_id": row["telegram_id"],
                "anime_id": row["last_anime_id"],
                "episode_num": row["last_episode"],
                "title": row["title"]
            }
        return None

    # --- МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ОБ АНИМЕ И ПЛЕЕРАХ ---

    def get_anime_info(self, anime_id: int) -> dict:
        """Возвращает общую информацию о тайтле по его ID."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM animes WHERE anime_id = ?", (anime_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_available_voices(self, anime_id: int) -> list:
        """Возвращает список всех студий озвучки, у которых есть серии для данного аниме."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT voice_name 
            FROM episodes 
            WHERE anime_id = ? 
            ORDER BY voice_name ASC
        """, (anime_id,))
        rows = cursor.fetchall()
        conn.close()
        return [row["voice_name"] for row in rows]

    def get_episode_iframe(self, anime_id: int, voice_name: str, episode_num: int) -> str:
        """Ищет и возвращает точную ссылку на iframe плеер для конкретного аниме, озвучки и серии."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT iframe_url 
            FROM episodes 
            WHERE anime_id = ? AND voice_name = ? AND episode_num = ?
        """, (anime_id, voice_name, episode_num))
        row = cursor.fetchone()
        conn.close()
        return row["iframe_url"] if row else None