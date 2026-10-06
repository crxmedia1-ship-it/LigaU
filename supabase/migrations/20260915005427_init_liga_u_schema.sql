-- LIGA U — schema inicial: enums, tablas, funciones, RLS, índices y semilla

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE TYPE public.user_role AS ENUM ('superadmin', 'mesa_tecnica');
CREATE TYPE public.sport_category AS ENUM ('individual', 'colectivo');
CREATE TYPE public.team_gender AS ENUM ('male', 'female', 'mixed');
CREATE TYPE public.match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
CREATE TYPE public.pass_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE public.redemption_type AS ENUM ('web', 'physical');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role public.user_role,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios autenticados. El rol staff (superadmin / mesa_tecnica) se asigna manualmente; nunca desde user_metadata.';
COMMENT ON COLUMN public.profiles.role IS 'NULL = usuario público. Solo superadmin y mesa_tecnica acceden al CMS.';

CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL UNIQUE,
  logo_url text,
  colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_type public.sport_category NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities (id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports (id) ON DELETE CASCADE,
  gender public.team_gender NOT NULL DEFAULT 'mixed',
  coach_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, sport_id, gender)
);

CREATE TABLE public.athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  full_name text NOT NULL,
  jersey_number integer,
  position text,
  photo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT athletes_jersey_number_positive CHECK (jersey_number IS NULL OR jersey_number > 0)
);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES public.sports (id) ON DELETE RESTRICT,
  home_team_id uuid NOT NULL REFERENCES public.teams (id) ON DELETE RESTRICT,
  away_team_id uuid NOT NULL REFERENCES public.teams (id) ON DELETE RESTRICT,
  match_date timestamptz NOT NULL,
  location text,
  home_score integer,
  away_score integer,
  match_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.match_status NOT NULL DEFAULT 'scheduled',
  mvp_athlete_id uuid REFERENCES public.athletes (id) ON DELETE SET NULL,
  round_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_distinct_teams CHECK (home_team_id <> away_team_id),
  CONSTRAINT matches_scores_non_negative CHECK (
    (home_score IS NULL OR home_score >= 0)
    AND (away_score IS NULL OR away_score >= 0)
  )
);

CREATE TABLE public.match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams (id) ON DELETE RESTRICT,
  athlete_id uuid NOT NULL REFERENCES public.athletes (id) ON DELETE RESTRICT,
  assist_athlete_id uuid REFERENCES public.athletes (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  value integer NOT NULL DEFAULT 1,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT match_events_event_type_not_empty CHECK (length(trim(event_type)) > 0)
);

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image_url text,
  sport_id uuid REFERENCES public.sports (id) ON DELETE SET NULL,
  university_id uuid REFERENCES public.universities (id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  episode_number integer NOT NULL UNIQUE,
  description text,
  cover_url text,
  youtube_url text,
  spotify_url text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT podcast_episodes_number_positive CHECK (episode_number > 0)
);

CREATE TABLE public.pass_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  category text NOT NULL,
  location_tag text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pass_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES public.pass_sponsors (id) ON DELETE CASCADE,
  discount_title text NOT NULL,
  status public.pass_status NOT NULL DEFAULT 'active',
  redemption_type public.redemption_type NOT NULL,
  promo_code text,
  instructions text,
  external_url text,
  expires_at timestamptz,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pass_benefits_click_count_non_negative CHECK (click_count >= 0)
);

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('superadmin'::public.user_role, 'mesa_tecnica'::public.user_role)
  );
$$;

CREATE OR REPLACE FUNCTION private.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'::public.user_role
  );
$$;

REVOKE ALL ON FUNCTION private.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_superadmin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_superadmin() TO authenticated;

CREATE INDEX teams_university_id_idx ON public.teams (university_id);
CREATE INDEX teams_sport_id_idx ON public.teams (sport_id);
CREATE INDEX athletes_team_id_idx ON public.athletes (team_id);
CREATE INDEX athletes_user_id_idx ON public.athletes (user_id);
CREATE INDEX athletes_active_idx ON public.athletes (team_id) WHERE is_active;
CREATE INDEX matches_sport_id_idx ON public.matches (sport_id);
CREATE INDEX matches_home_team_id_idx ON public.matches (home_team_id);
CREATE INDEX matches_away_team_id_idx ON public.matches (away_team_id);
CREATE INDEX matches_mvp_athlete_id_idx ON public.matches (mvp_athlete_id);
CREATE INDEX matches_match_date_idx ON public.matches (match_date DESC);
CREATE INDEX matches_status_date_idx ON public.matches (status, match_date DESC);
CREATE INDEX match_events_match_id_idx ON public.match_events (match_id);
CREATE INDEX match_events_team_id_idx ON public.match_events (team_id);
CREATE INDEX match_events_athlete_id_idx ON public.match_events (athlete_id);
CREATE INDEX match_events_assist_athlete_id_idx ON public.match_events (assist_athlete_id);
CREATE INDEX match_events_type_idx ON public.match_events (event_type);
CREATE INDEX news_sport_id_idx ON public.news (sport_id);
CREATE INDEX news_university_id_idx ON public.news (university_id);
CREATE INDEX news_published_at_idx ON public.news (published_at DESC NULLS LAST);
CREATE INDEX news_featured_idx ON public.news (is_featured, published_at DESC) WHERE is_featured;
CREATE INDEX podcast_episodes_published_at_idx ON public.podcast_episodes (published_at DESC NULLS LAST);
CREATE INDEX pass_sponsors_active_idx ON public.pass_sponsors (is_active);
CREATE INDEX pass_sponsors_category_idx ON public.pass_sponsors (category);
CREATE INDEX pass_benefits_sponsor_id_idx ON public.pass_benefits (sponsor_id);
CREATE INDEX pass_benefits_status_idx ON public.pass_benefits (status);
CREATE INDEX profiles_role_idx ON public.profiles (role);

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER universities_set_updated_at BEFORE UPDATE ON public.universities FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER sports_set_updated_at BEFORE UPDATE ON public.sports FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER teams_set_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER athletes_set_updated_at BEFORE UPDATE ON public.athletes FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER matches_set_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER news_set_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER podcast_episodes_set_updated_at BEFORE UPDATE ON public.podcast_episodes FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER pass_sponsors_set_updated_at BEFORE UPDATE ON public.pass_sponsors FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER pass_benefits_set_updated_at BEFORE UPDATE ON public.pass_benefits FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1), '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own_or_staff
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR private.is_staff());

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role IS NOT DISTINCT FROM private.current_user_role());

CREATE POLICY profiles_update_superadmin
  ON public.profiles FOR UPDATE TO authenticated
  USING (private.is_superadmin())
  WITH CHECK (private.is_superadmin());

CREATE POLICY profiles_delete_superadmin
  ON public.profiles FOR DELETE TO authenticated
  USING (private.is_superadmin());

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'universities',
    'sports',
    'teams',
    'athletes',
    'matches',
    'match_events',
    'news',
    'podcast_episodes'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      t || '_select_public', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (private.is_staff())',
      t || '_insert_staff', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (private.is_staff()) WITH CHECK (private.is_staff())',
      t || '_update_staff', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (private.is_staff())',
      t || '_delete_staff', t
    );
  END LOOP;
END $$;

CREATE POLICY pass_sponsors_select_public
  ON public.pass_sponsors FOR SELECT TO anon, authenticated
  USING (is_active = true OR private.is_superadmin());

CREATE POLICY pass_sponsors_insert_superadmin
  ON public.pass_sponsors FOR INSERT TO authenticated
  WITH CHECK (private.is_superadmin());

CREATE POLICY pass_sponsors_update_superadmin
  ON public.pass_sponsors FOR UPDATE TO authenticated
  USING (private.is_superadmin())
  WITH CHECK (private.is_superadmin());

CREATE POLICY pass_sponsors_delete_superadmin
  ON public.pass_sponsors FOR DELETE TO authenticated
  USING (private.is_superadmin());

CREATE POLICY pass_benefits_select_public
  ON public.pass_benefits FOR SELECT TO anon, authenticated
  USING (status = 'active'::public.pass_status OR private.is_superadmin());

CREATE POLICY pass_benefits_insert_superadmin
  ON public.pass_benefits FOR INSERT TO authenticated
  WITH CHECK (private.is_superadmin());

CREATE POLICY pass_benefits_update_superadmin
  ON public.pass_benefits FOR UPDATE TO authenticated
  USING (private.is_superadmin())
  WITH CHECK (private.is_superadmin());

CREATE POLICY pass_benefits_delete_superadmin
  ON public.pass_benefits FOR DELETE TO authenticated
  USING (private.is_superadmin());

INSERT INTO public.universities (name, short_name, colors) VALUES
  ('Universidad Central de Venezuela', 'UCV', '{"primary":"#7A003C","secondary":"#F5E6C8"}'::jsonb),
  ('Universidad Católica Andrés Bello', 'UCAB', '{"primary":"#FFD100","secondary":"#111111"}'::jsonb),
  ('Universidad Metropolitana', 'UNIMET', '{"primary":"#0033A0","secondary":"#FFFFFF"}'::jsonb),
  ('Universidad Nueva Esparta', 'UNE', '{"primary":"#1B4F72","secondary":"#F4D03F"}'::jsonb),
  ('Universidad Simón Bolívar', 'USB', '{"primary":"#F26522","secondary":"#003DA5"}'::jsonb),
  ('Universidad Santa María', 'USM', '{"primary":"#8B0000","secondary":"#FFD700"}'::jsonb),
  ('Universidad Alejandro de Humboldt', 'UAH', '{"primary":"#0D47A1","secondary":"#FFC107"}'::jsonb),
  ('Universidad Monteávila', 'UMA', '{"primary":"#1A237E","secondary":"#C5A572"}'::jsonb);

INSERT INTO public.sports (name, slug, category_type) VALUES
  ('Fútbol Campo', 'futbol-campo', 'colectivo'),
  ('Futsal', 'futsal', 'colectivo'),
  ('Baloncesto', 'baloncesto', 'colectivo'),
  ('Voleibol Cancha', 'voleibol-cancha', 'colectivo'),
  ('Ajedrez', 'ajedrez', 'individual'),
  ('Rugby', 'rugby', 'colectivo'),
  ('Tenis de Mesa', 'tenis-de-mesa', 'individual'),
  ('Voley Playa', 'voley-playa', 'colectivo'),
  ('Tenis Campo', 'tenis-campo', 'individual');
