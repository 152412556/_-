-- ============================================================
-- Военная кафедра — Торайгыров университет
-- Схема базы данных Supabase (PostgreSQL)
-- Выполните этот скрипт в SQL Editor панели Supabase
-- ============================================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILES (профили пользователей, связан с auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  group_name TEXT,
  rank TEXT,
  specialty TEXT,
  course INT,
  initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_group ON public.profiles(group_name);

-- ------------------------------------------------------------
-- SCHEDULES (расписание занятий)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  subject TEXT NOT NULL,
  group_name TEXT NOT NULL,
  classroom TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  teacher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_group ON public.schedules(group_name);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON public.schedules(teacher_id);

-- ------------------------------------------------------------
-- GRADES (оценки)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  group_name TEXT,
  subject TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 5),
  grade_date DATE DEFAULT CURRENT_DATE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  teacher_name TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_group ON public.grades(group_name);

-- ------------------------------------------------------------
-- ANNOUNCEMENTS (объявления)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'student', 'teacher')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.announcements(created_at DESC);

-- ------------------------------------------------------------
-- MATERIALS (учебные материалы / памятки)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Материал',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- NEWS (новости сайта)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Учёба',
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_created ON public.news(created_at DESC);

-- ------------------------------------------------------------
-- DOCUMENTS (документы)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Общее',
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Profiles: все авторизованные читают; обновлять свой профиль
CREATE POLICY "Profiles are viewable by authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Schedules: все читают; преподаватели пишут
CREATE POLICY "Schedules viewable by authenticated"
  ON public.schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert schedules"
  ON public.schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

CREATE POLICY "Teachers can update schedules"
  ON public.schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

CREATE POLICY "Teachers can delete schedules"
  ON public.schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Grades: студенты видят свои; преподаватели — все + CRUD
CREATE POLICY "Students see own grades"
  ON public.grades FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

CREATE POLICY "Teachers manage grades"
  ON public.grades FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Announcements: все читают; преподаватели пишут
CREATE POLICY "Announcements viewable by authenticated"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Materials: все читают; преподаватели пишут
CREATE POLICY "Materials viewable by authenticated"
  ON public.materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers manage materials"
  ON public.materials FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- News & Documents: публичное чтение (anon + auth), запись — teacher/admin
CREATE POLICY "News public read"
  ON public.news FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Teachers manage news"
  ON public.news FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

CREATE POLICY "Documents public read"
  ON public.documents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Teachers manage documents"
  ON public.documents FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- ============================================================
-- TRIGGER: автосоздание профиля при регистрации
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, group_name, rank, initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'group_name',
    NEW.raw_user_meta_data->>'rank',
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 2))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DEMO SEED (опционально — после создания тестовых пользователей)
-- ============================================================
-- После регистрации student@test.kz и teacher@test.kz через Auth
-- можно вручную обновить профили и добавить демо-данные.
--
-- UPDATE public.profiles SET role = 'teacher', rank = 'Майор запаса', full_name = 'Кенжетаев Тимур Маликович'
--   WHERE id = '<teacher-uuid>';
-- UPDATE public.profiles SET role = 'student', group_name = 'ВК-301', full_name = 'Иванов Алексей Сергеевич'
--   WHERE id = '<student-uuid>';
