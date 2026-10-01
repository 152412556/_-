/**
 * Конфигурация Supabase
 * ---------------------------
 * 1. Создайте проект на https://supabase.com
 * 2. Project Settings → API → скопируйте Project URL и anon public key
 * 3. Вставьте значения ниже
 * 4. Выполните schema.sql в SQL Editor
 * 5. Authentication → Providers → Email: включите Email
 *
 * Если URL и KEY оставлены пустыми — сайт работает в DEMO-режиме (localStorage).
 */

window.SUPABASE_CONFIG = {
  url: '',   // например: 'https://abcdefgh.supabase.co'
  anonKey: '' // например: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};

// Режим: true = использовать Supabase (если url/key заданы), иначе demo
window.SUPABASE_CONFIG.enabled = !!(
  window.SUPABASE_CONFIG.url &&
  window.SUPABASE_CONFIG.anonKey &&
  !window.SUPABASE_CONFIG.url.includes('xxxx')
);
