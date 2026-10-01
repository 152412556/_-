/**
 * Auth & Data layer — Военная кафедра
 * Режим Supabase (если настроен) или DEMO (localStorage)
 */

const AUTH_KEY = 'vk_auth';
const USERS_KEY = 'vk_registered_users';
const GRADES_KEY = 'vk_grades';
const SCHEDULE_KEY = 'vk_schedule';
const ANNOUNCE_KEY = 'vk_announcements';
const MATERIALS_KEY = 'vk_materials';

// Demo users (только для DEMO-режима)
const USERS = {
  student: {
    login: 'student',
    password: 'student',
    role: 'student',
    name: 'Иванов Алексей Сергеевич',
    short: 'Иванов А.С.',
    initials: 'ИА',
    group: 'ВК-301',
    specialty: 'Офицеры запаса — Боевое применение общевойсковых подразделений',
    course: 2
  },
  teacher: {
    login: 'teacher',
    password: 'teacher',
    role: 'teacher',
    name: 'Кенжетаев Тимур Маликович',
    short: 'Кенжетаев Т.М.',
    initials: 'КТ',
    rank: 'Майор запаса',
    position: 'Старший преподаватель'
  }
};

const DEFAULT_SCHEDULE = [
  { id: 1, day: 'Понедельник', time: '09:00–10:30', subject: 'Тактическая подготовка', room: 'Ауд. 12', group: 'ВК-301', teacher: 'Кенжетаев Т.М.' },
  { id: 2, day: 'Понедельник', time: '10:45–12:15', subject: 'Огневая подготовка', room: 'Тир', group: 'ВК-301', teacher: 'Накебаев А.С.' },
  { id: 3, day: 'Вторник', time: '09:00–10:30', subject: 'Строевая подготовка', room: 'Плац', group: 'ВК-301', teacher: 'Леонтьев Д.Л.' },
  { id: 4, day: 'Вторник', time: '14:00–15:30', subject: 'Военная топография', room: 'Ауд. 8', group: 'ВК-301', teacher: 'Кенжетаев Т.М.' },
  { id: 5, day: 'Среда', time: '09:00–10:30', subject: 'Уставы ВС РК', room: 'Ауд. 12', group: 'ВК-301', teacher: 'Аширбаев К.Т.' },
  { id: 6, day: 'Четверг', time: '10:45–12:15', subject: 'Тактическая подготовка', room: 'Ауд. 12', group: 'ВК-301', teacher: 'Кенжетаев Т.М.' },
  { id: 7, day: 'Пятница', time: '09:00–10:30', subject: 'Военно-патриотическое воспитание', room: 'Ауд. 5', group: 'ВК-301', teacher: 'Леонтьев Д.Л.' }
];

const DEFAULT_GRADES = [
  { id: 1, student: 'Иванов Алексей Сергеевич', group: 'ВК-301', subject: 'Тактическая подготовка', grade: 5, date: '2025-03-15', teacher: 'Кенжетаев Т.М.' },
  { id: 2, student: 'Иванов Алексей Сергеевич', group: 'ВК-301', subject: 'Огневая подготовка', grade: 4, date: '2025-03-18', teacher: 'Накебаев А.С.' },
  { id: 3, student: 'Иванов Алексей Сергеевич', group: 'ВК-301', subject: 'Строевая подготовка', grade: 5, date: '2025-03-20', teacher: 'Леонтьев Д.Л.' },
  { id: 4, student: 'Иванов Алексей Сергеевич', group: 'ВК-301', subject: 'Военная топография', grade: 4, date: '2025-03-22', teacher: 'Кенжетаев Т.М.' },
  { id: 5, student: 'Иванов Алексей Сергеевич', group: 'ВК-301', subject: 'Уставы ВС РК', grade: 5, date: '2025-03-25', teacher: 'Аширбаев К.Т.' },
  { id: 6, student: 'Петров Дмитрий Игоревич', group: 'ВК-301', subject: 'Тактическая подготовка', grade: 4, date: '2025-03-15', teacher: 'Кенжетаев Т.М.' },
  { id: 7, student: 'Смагулова Алия Ерлановна', group: 'ВК-302', subject: 'Тактическая подготовка', grade: 5, date: '2025-03-16', teacher: 'Кенжетаев Т.М.' }
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: 'Расписание экзаменов', text: 'Опубликовано расписание экзаменов весеннего семестра 2025/26.', date: '2025-04-18', author: 'Кенжетаев Т.М.' },
  { id: 2, title: 'Учебные сборы', text: 'Приказ о проведении учебных сборов. Списки взводов в личном кабинете.', date: '2025-04-12', author: 'Леонтьев Д.Л.' }
];

const DEFAULT_MATERIALS = [
  { id: 1, title: 'Памятка по форме одежды', text: 'На занятиях обязательна установленная форма. Знаки различия — по приказу начальника кафедры.', category: 'Памятка' },
  { id: 2, title: 'Меры безопасности на огневой подготовке', text: 'Строго соблюдать указания руководителя стрельб. Запрещено направлять оружие в сторону людей.', category: 'Безопасность' },
  { id: 3, title: 'Методичка: Военная топография', text: 'Основные условные знаки, работа с картой, ориентирование на местности.', category: 'Материал' }
];

// ---------- Supabase client ----------
let supabase = null;
let useSupabase = false;

function initSupabase() {
  const cfg = window.SUPABASE_CONFIG || {};
  if (cfg.enabled && cfg.url && cfg.anonKey && window.supabase) {
    supabase = window.supabase.createClient(cfg.url, cfg.anonKey);
    useSupabase = true;
    console.info('[VK] Supabase mode enabled');
  } else {
    useSupabase = false;
    console.info('[VK] DEMO mode (localStorage)');
  }
  return useSupabase;
}

function isSupabaseMode() {
  return useSupabase && supabase;
}

// ---------- Session helpers (demo) ----------
function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuth(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

function logout() {
  if (isSupabaseMode()) {
    supabase.auth.signOut().finally(() => {
      clearAuth();
      redirectToLogin();
    });
  } else {
    clearAuth();
    redirectToLogin();
  }
}

function redirectToLogin() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'pages/login.html';
  }
}

function requireAuth(allowedRoles) {
  // Sync check for demo; for Supabase cabinets use requireAuthAsync
  const auth = getAuth();
  if (!auth) {
    redirectToLogin();
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    if (auth.role === 'student') window.location.href = 'cabinet-student.html';
    else if (auth.role === 'teacher') window.location.href = 'cabinet-teacher.html';
    else redirectToLogin();
    return null;
  }
  return auth;
}

async function requireAuthAsync(allowedRoles) {
  if (isSupabaseMode()) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      redirectToLogin();
      return null;
    }
    const profile = await fetchProfile(session.user.id);
    if (!profile) {
      redirectToLogin();
      return null;
    }
    const auth = mapProfile(profile, session.user);
    setAuth(auth);
    if (allowedRoles && !allowedRoles.includes(auth.role)) {
      if (auth.role === 'student') window.location.href = 'cabinet-student.html';
      else if (auth.role === 'teacher') window.location.href = 'cabinet-teacher.html';
      else redirectToLogin();
      return null;
    }
    return auth;
  }
  return requireAuth(allowedRoles);
}

function mapProfile(profile, user) {
  const name = profile.full_name || user.email || '';
  const parts = name.split(' ');
  const short = parts.length >= 2
    ? parts[0] + ' ' + parts[1].charAt(0) + '.' + (parts[2] ? parts[2].charAt(0) + '.' : '')
    : name;
  return {
    id: profile.id,
    role: profile.role,
    name,
    short,
    initials: profile.initials || name.slice(0, 2).toUpperCase(),
    group: profile.group_name || '',
    rank: profile.rank || '',
    specialty: profile.specialty || '',
    course: profile.course || null,
    email: user.email
  };
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Profile fetch error', error);
    return null;
  }
  return data;
}

// ---------- Login / Register ----------
/**
 * login(loginStr, password, role)
 * DEMO: login/password из USERS
 * Supabase: email + password (роль берётся из профиля)
 */
async function login(loginStr, password, role) {
  if (isSupabaseMode()) {
    const email = loginStr.includes('@') ? loginStr : `${loginStr}@vk.local`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      return { ok: false, error: 'Профиль не найден. Обратитесь к администратору.' };
    }
    // Optional: check requested role matches
    if (role && profile.role !== role && profile.role !== 'admin') {
      await supabase.auth.signOut();
      return { ok: false, error: 'Неверная роль для этого аккаунта' };
    }
    const sessionUser = mapProfile(profile, data.user);
    setAuth(sessionUser);
    return { ok: true, user: sessionUser };
  }

  // DEMO mode
  const loginNorm = (loginStr || '').trim().toLowerCase();
  const registered = getRegisteredUsers();
  const found = registered.find(
    u => (u.login === loginNorm || u.email === loginNorm) && u.password === password
  );
  if (found) {
    if (role && found.role !== role) {
      return { ok: false, error: 'Этот аккаунт зарегистрирован как «' + (found.role === 'teacher' ? 'преподаватель' : 'студент') + '». Выберите нужную роль.' };
    }
    const session = { ...found, loggedAt: new Date().toISOString() };
    delete session.password;
    setAuth(session);
    return { ok: true, user: session };
  }

  // Встроенные демо-аккаунты
  const key = role === 'teacher' ? 'teacher' : 'student';
  const user = USERS[key];
  if (loginNorm === user.login && password === user.password) {
    const session = { ...user, loggedAt: new Date().toISOString() };
    setAuth(session);
    return { ok: true, user: session };
  }

  return { ok: false, error: 'Неверный логин или пароль. Зарегистрируйтесь или используйте демо-аккаунт.' };
}

/** Зарегистрированные пользователи (DEMO) */
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function makeShortName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length >= 3) return parts[0] + ' ' + parts[1].charAt(0) + '.' + parts[2].charAt(0) + '.';
  if (parts.length === 2) return parts[0] + ' ' + parts[1].charAt(0) + '.';
  return fullName || '';
}

/**
 * register({ email, password, fullName, role, groupName, rank })
 * Работает и в DEMO (localStorage), и в Supabase
 */
async function register({ email, password, fullName, role, groupName, rank }) {
  const loginNorm = (email || '').trim().toLowerCase();
  const name = (fullName || '').trim();
  const userRole = role === 'teacher' ? 'teacher' : 'student';

  if (!loginNorm || !password || !name) {
    return { ok: false, error: 'Заполните все обязательные поля' };
  }
  if (password.length < 4) {
    return { ok: false, error: 'Пароль должен быть не короче 4 символов' };
  }

  if (isSupabaseMode()) {
    const { data, error } = await supabase.auth.signUp({
      email: loginNorm.includes('@') ? loginNorm : `${loginNorm}@vk.local`,
      password,
      options: {
        data: {
          full_name: name,
          role: userRole,
          group_name: groupName || null,
          rank: rank || null
        }
      }
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, user: data.user };
  }

  // DEMO: сохраняем в localStorage
  const list = getRegisteredUsers();
  if (list.some(u => u.login === loginNorm || u.email === loginNorm)) {
    return { ok: false, error: 'Пользователь с таким логином/email уже зарегистрирован' };
  }
  // Не перезаписываем встроенные demo-логины
  if (loginNorm === 'student' || loginNorm === 'teacher') {
    return { ok: false, error: 'Этот логин зарезервирован. Выберите другой.' };
  }

  const parts = name.split(/\s+/);
  const newUser = {
    login: loginNorm,
    email: loginNorm.includes('@') ? loginNorm : null,
    password: password,
    role: userRole,
    name: name,
    short: makeShortName(name),
    initials: (parts[0] && parts[1])
      ? (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
      : name.slice(0, 2).toUpperCase(),
    group: userRole === 'student' ? (groupName || 'ВК-301') : null,
    rank: userRole === 'teacher' ? (rank || '') : null,
    position: userRole === 'teacher' ? 'Преподаватель' : null,
    specialty: userRole === 'student' ? '' : null,
    course: userRole === 'student' ? 1 : null,
    createdAt: new Date().toISOString()
  };

  list.push(newUser);
  saveRegisteredUsers(list);
  return { ok: true, user: { ...newUser, password: undefined } };
}

// ---------- Data layer ----------
function loadData(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(key, JSON.stringify(defaults));
  return JSON.parse(JSON.stringify(defaults));
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(list) {
  const nums = list.map(x => (typeof x.id === 'number' ? x.id : 0));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

function gradeClass(g) {
  if (g >= 5) return 'grade-5';
  if (g >= 4) return 'grade-4';
  if (g >= 3) return 'grade-3';
  return 'grade-2';
}

// Schedule
async function getSchedule() {
  if (isSupabaseMode()) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('day_of_week');
    if (error) {
      console.error(error);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      day: row.day_of_week,
      time: row.time_slot,
      subject: row.subject,
      room: row.classroom,
      group: row.group_name,
      teacher: row.teacher_name || ''
    }));
  }
  return loadData(SCHEDULE_KEY, DEFAULT_SCHEDULE);
}

async function addSchedule(item) {
  if (isSupabaseMode()) {
    const auth = getAuth();
    const { data, error } = await supabase.from('schedules').insert({
      day_of_week: item.day,
      time_slot: item.time,
      subject: item.subject,
      classroom: item.room,
      group_name: item.group,
      teacher_id: auth?.id || null,
      teacher_name: item.teacher
    }).select().single();
    if (error) throw error;
    return data;
  }
  const list = loadData(SCHEDULE_KEY, DEFAULT_SCHEDULE);
  list.push({ ...item, id: nextId(list) });
  saveData(SCHEDULE_KEY, list);
  return item;
}

async function deleteSchedule(id) {
  if (isSupabaseMode()) {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = loadData(SCHEDULE_KEY, DEFAULT_SCHEDULE).filter(x => x.id !== id);
  saveData(SCHEDULE_KEY, list);
}

// Grades
async function getGrades() {
  if (isSupabaseMode()) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('grade_date', { ascending: false });
    if (error) {
      console.error(error);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      student: row.student_name,
      studentId: row.student_id,
      group: row.group_name,
      subject: row.subject,
      grade: row.grade,
      date: row.grade_date,
      teacher: row.teacher_name || '',
      comments: row.comments
    }));
  }
  return loadData(GRADES_KEY, DEFAULT_GRADES);
}

async function addGrade(item) {
  if (isSupabaseMode()) {
    const auth = getAuth();
    const { data, error } = await supabase.from('grades').insert({
      student_name: item.student,
      student_id: item.studentId || null,
      group_name: item.group,
      subject: item.subject,
      grade: item.grade,
      grade_date: item.date || new Date().toISOString().slice(0, 10),
      teacher_id: auth?.id || null,
      teacher_name: item.teacher,
      comments: item.comments || null
    }).select().single();
    if (error) throw error;
    return data;
  }
  const list = loadData(GRADES_KEY, DEFAULT_GRADES);
  list.unshift({ ...item, id: nextId(list) });
  saveData(GRADES_KEY, list);
  return item;
}

async function deleteGrade(id) {
  if (isSupabaseMode()) {
    const { error } = await supabase.from('grades').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = loadData(GRADES_KEY, DEFAULT_GRADES).filter(x => x.id !== id);
  saveData(GRADES_KEY, list);
}

// Announcements
async function getAnnouncements() {
  if (isSupabaseMode()) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      text: row.content,
      date: (row.created_at || '').slice(0, 10),
      author: row.author_name || ''
    }));
  }
  return loadData(ANNOUNCE_KEY, DEFAULT_ANNOUNCEMENTS);
}

async function addAnnouncement(item) {
  if (isSupabaseMode()) {
    const auth = getAuth();
    const { data, error } = await supabase.from('announcements').insert({
      title: item.title,
      content: item.text,
      target_role: item.targetRole || 'all',
      author_id: auth?.id || null,
      author_name: item.author
    }).select().single();
    if (error) throw error;
    return data;
  }
  const list = loadData(ANNOUNCE_KEY, DEFAULT_ANNOUNCEMENTS);
  list.unshift({ ...item, id: nextId(list) });
  saveData(ANNOUNCE_KEY, list);
  return item;
}

async function deleteAnnouncement(id) {
  if (isSupabaseMode()) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = loadData(ANNOUNCE_KEY, DEFAULT_ANNOUNCEMENTS).filter(x => x.id !== id);
  saveData(ANNOUNCE_KEY, list);
}

// Materials
async function getMaterials() {
  if (isSupabaseMode()) {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      text: row.content,
      category: row.category
    }));
  }
  return loadData(MATERIALS_KEY, DEFAULT_MATERIALS);
}

async function addMaterial(item) {
  if (isSupabaseMode()) {
    const auth = getAuth();
    const { data, error } = await supabase.from('materials').insert({
      title: item.title,
      content: item.text,
      category: item.category,
      author_id: auth?.id || null
    }).select().single();
    if (error) throw error;
    return data;
  }
  const list = loadData(MATERIALS_KEY, DEFAULT_MATERIALS);
  list.unshift({ ...item, id: nextId(list) });
  saveData(MATERIALS_KEY, list);
  return item;
}

async function deleteMaterial(id) {
  if (isSupabaseMode()) {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = loadData(MATERIALS_KEY, DEFAULT_MATERIALS).filter(x => x.id !== id);
  saveData(MATERIALS_KEY, list);
}

// Init on load
if (typeof window !== 'undefined') {
  // Will be called after supabase-js CDN and config are loaded
  window.initSupabase = initSupabase;
}
