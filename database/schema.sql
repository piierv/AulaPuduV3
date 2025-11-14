-- ============================================
-- AULAPUDU 2.0 - DATABASE SCHEMA
-- Esquema completo de base de datos para Supabase
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users (extendida de auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  role TEXT DEFAULT 'spectator' CHECK (role IN ('presenter', 'spectator', 'admin')),
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: sessions
-- ============================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  presenter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  current_slide INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Índices para sessions
CREATE INDEX IF NOT EXISTS idx_sessions_code ON public.sessions(code);
CREATE INDEX IF NOT EXISTS idx_sessions_presenter ON public.sessions(presenter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);

-- ============================================
-- TABLA: attendees (espectadores en sesiones)
-- ============================================
CREATE TABLE IF NOT EXISTS public.attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'kicked')),
  metadata JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE
);

-- Índices para attendees
CREATE INDEX IF NOT EXISTS idx_attendees_session ON public.attendees(session_id);
CREATE INDEX IF NOT EXISTS idx_attendees_status ON public.attendees(status);

-- ============================================
-- TABLA: presentations
-- ============================================
CREATE TABLE IF NOT EXISTS public.presentations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presenter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  content_type TEXT CHECK (content_type IN ('pdf', 'slides', 'html', '3d')),
  content_url TEXT,
  slides JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para presentations
CREATE INDEX IF NOT EXISTS idx_presentations_presenter ON public.presentations(presenter_id);

-- ============================================
-- TABLA: exams
-- ============================================
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  presenter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER, -- en segundos
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Índices para exams
CREATE INDEX IF NOT EXISTS idx_exams_session ON public.exams(session_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);

-- ============================================
-- TABLA: exam_questions
-- ============================================
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'open_ended')),
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  options JSONB, -- Para opciones múltiples
  correct_answer TEXT, -- Respuesta correcta
  points INTEGER DEFAULT 1,
  time_limit INTEGER, -- en segundos, opcional por pregunta
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para exam_questions
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON public.exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_order ON public.exam_questions(order_index);

-- ============================================
-- TABLA: exam_responses
-- ============================================
CREATE TABLE IF NOT EXISTS public.exam_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES public.attendees(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para exam_responses
CREATE INDEX IF NOT EXISTS idx_exam_responses_exam ON public.exam_responses(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_responses_attendee ON public.exam_responses(attendee_id);

-- ============================================
-- TABLA: reactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES public.attendees(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('thumbs_up', 'heart', 'surprised', 'question')),
  slide_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Solo una reacción de cada tipo por usuario por sesión
  UNIQUE(session_id, attendee_id, reaction_type)
);

-- Índices para reactions
CREATE INDEX IF NOT EXISTS idx_reactions_session ON public.reactions(session_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.reactions(reaction_type);

-- ============================================
-- TABLA: polls (encuestas rápidas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de opciones
  multiple_choice BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Índices para polls
CREATE INDEX IF NOT EXISTS idx_polls_session ON public.polls(session_id);

-- ============================================
-- TABLA: poll_responses
-- ============================================
CREATE TABLE IF NOT EXISTS public.poll_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES public.attendees(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL, -- Array de opciones seleccionadas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un espectador solo puede responder una vez por poll
  UNIQUE(poll_id, attendee_id)
);

-- Índices para poll_responses
CREATE INDEX IF NOT EXISTS idx_poll_responses_poll ON public.poll_responses(poll_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear un perfil cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para llamar a la función cuando se crea un nuevo usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Policies para sessions
CREATE POLICY "Sessions are viewable by everyone" 
  ON public.sessions FOR SELECT 
  USING (true);

CREATE POLICY "Presenters can create sessions" 
  ON public.sessions FOR INSERT 
  WITH CHECK (auth.uid() = presenter_id);

CREATE POLICY "Presenters can update own sessions" 
  ON public.sessions FOR UPDATE 
  USING (auth.uid() = presenter_id);

-- Policies para attendees
CREATE POLICY "Attendees viewable by session participants" 
  ON public.attendees FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can join as attendee" 
  ON public.attendees FOR INSERT 
  WITH CHECK (true);

-- Policies para reactions
CREATE POLICY "Reactions viewable by session participants" 
  ON public.reactions FOR SELECT 
  USING (true);

CREATE POLICY "Attendees can create reactions" 
  ON public.reactions FOR INSERT 
  WITH CHECK (true);

-- Policies para exams y respuestas
CREATE POLICY "Exams viewable by session participants" 
  ON public.exams FOR SELECT 
  USING (true);

CREATE POLICY "Exam responses insertable by attendees" 
  ON public.exam_responses FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar un perfil de prueba
-- INSERT INTO public.profiles (id, display_name, role)
-- VALUES (auth.uid(), 'Usuario de Prueba', 'presenter');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de sesiones con conteo de espectadores
CREATE OR REPLACE VIEW public.sessions_with_stats AS
SELECT 
  s.*,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') as active_attendees,
  COUNT(DISTINCT r.id) as total_reactions
FROM public.sessions s
LEFT JOIN public.attendees a ON s.id = a.session_id
LEFT JOIN public.reactions r ON s.id = r.session_id
GROUP BY s.id;

-- Vista de resultados de exámenes
CREATE OR REPLACE VIEW public.exam_results AS
SELECT 
  e.id as exam_id,
  e.title as exam_title,
  a.id as attendee_id,
  a.name as attendee_name,
  COUNT(er.id) as questions_answered,
  SUM(CASE WHEN er.is_correct THEN 1 ELSE 0 END) as correct_answers,
  SUM(er.points_earned) as total_points
FROM public.exams e
JOIN public.exam_responses er ON e.id = er.exam_id
JOIN public.attendees a ON er.attendee_id = a.id
GROUP BY e.id, e.title, a.id, a.name;

COMMENT ON TABLE public.sessions IS 'Sesiones en vivo creadas por presentadores';
COMMENT ON TABLE public.attendees IS 'Espectadores unidos a sesiones';
COMMENT ON TABLE public.exams IS 'Exámenes creados durante sesiones';
COMMENT ON TABLE public.reactions IS 'Reacciones en tiempo real de espectadores';
COMMENT ON TABLE public.polls IS 'Encuestas rápidas durante presentaciones';