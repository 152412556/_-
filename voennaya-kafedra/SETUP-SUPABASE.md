# Подключение Supabase — Военная кафедра

Сайт работает в двух режимах:

| Режим | Когда | Данные |
|-------|--------|--------|
| **DEMO** | URL/ключ не заданы | localStorage (как на этапе 2) |
| **Supabase** | URL и anon key прописаны | Реальная БД + Auth |

---

## 1. Создайте проект Supabase

1. Зайдите на [https://supabase.com](https://supabase.com) → New project  
2. Запомните **Project URL** и **anon public key**  
   (Settings → API)

## 2. Выполните схему БД

1. В панели Supabase откройте **SQL Editor**  
2. Скопируйте содержимое файла `schema.sql`  
3. Нажмите **Run**

Создадутся таблицы:

- `profiles` — профили (роль, группа, звание)
- `schedules` — расписание
- `grades` — оценки
- `announcements` — объявления
- `materials` — учебные материалы
- `news` — новости
- `documents` — документы  

и политики RLS + триггер автосоздания профиля.

## 3. Включите Email Auth

Authentication → Providers → **Email** → Enable  
(по желанию отключите «Confirm email» для тестов)

## 4. Пропишите ключи в проекте

Откройте `js/supabase-config.js` и вставьте:

```js
window.SUPABASE_CONFIG = {
  url: 'https://ВАШ_ПРОЕКТ.supabase.co',
  anonKey: 'ВАШ_ANON_KEY'
};
```

Файл `.env.example` — образец для будущего Vite/React:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Создайте пользователей

### Вариант A — через сайт
1. Откройте `pages/login.html`  
2. Вкладка **Регистрация** (появляется только в режиме Supabase)  
3. Зарегистрируйте студента и преподавателя  

### Вариант B — через панель Supabase
Authentication → Users → Add user  
Затем в Table Editor → `profiles` укажите `role` = `student` или `teacher`.

## 6. Проверка

1. Войдите как преподаватель → добавьте занятие / оценку / объявление  
2. Войдите как студент → данные должны отобразиться из БД  

---

## Структура файлов (этап 3)

```
voennaya-kafedra/
├── schema.sql              # SQL-схема + RLS
├── .env.example            # Пример переменных окружения
├── SETUP-SUPABASE.md       # Эта инструкция
├── js/
│   ├── supabase-config.js  # ← сюда вставить URL и KEY
│   ├── auth.js             # Auth + data layer (Supabase / DEMO)
│   └── main.js
└── pages/
    ├── login.html          # Вход + регистрация
    ├── cabinet-student.html
    └── cabinet-teacher.html
```

## Важно

- Пока `url` и `anonKey` пустые — сайт **продолжает работать в DEMO-режиме**.  
- Для продакшена не коммитьте реальные ключи в публичный репозиторий.  
- Anon key безопасен для фронтенда при включённом RLS (политики уже в `schema.sql`).
