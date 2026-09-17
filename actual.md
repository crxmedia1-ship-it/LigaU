# LIGA U — Documento Maestro de Arquitectura y Especificación Técnica

## 1. Visión General del Producto
- **Nombre:** LIGA U (PWA deportiva e institucional universitaria).
- **Ubicación:** Caracas, Venezuela (Instagram: @ligauve).
- **Propósito:** Portal público para consulta de calendarios, resultados, clasificaciones automáticas, estadísticas de atletas, noticias, podcasts y club de beneficios comerciales (Liga U Pass) integrado con CarnetX; respaldado por un Backoffice CMS con control de accesos por roles (RBAC).

## 2. Stack Tecnológico y Cuentas
- **Framework Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Shadcn UI.
- **Base de Datos & Auth:** Supabase (PostgreSQL con Row Level Security y Vistas SQL automáticas). *Cuenta propiedad de Liga U*.
- **Almacenamiento Multimedia:** Cloudinary (Signed Server Actions para logos, fotos y banners). *Cuenta propiedad de Liga U*.
- **Hosting & CI/CD:** Vercel (conectado al repositorio de GitHub).
- **PWA & Offline:** Soporte PWA para instalación móvil y caché optimizado.

## 3. Entidades Base del Torneo
- **Universidades (8):** UCV, UCAB, UNIMET, UNE, USB, USM, UAH, UMA.
- **Disciplinas Deportivas (9):** Fútbol Campo, Futsal, Baloncesto, Voleibol Cancha, Ajedrez, Rugby, Tenis de Mesa, Voley Playa, Tenis Campo.

## 4. Matriz de Roles y Seguridad (RBAC & RLS)
- **Superadmin (Dueño de la plataforma):**
  - Acceso total a todo el sistema.
  - **Hub Comercial Exclusivo:** Gestión total de patrocinadores (`pass_sponsors`) y beneficios (`pass_benefits`), métricas de clics/interés y control de usuarios. (La mesa técnica tiene acceso bloqueado a este módulo por RLS y UI).
- **Mesa Técnica / Coordinador de Liga:**
  - Gestión operativa de partidos, calendarios y carga post-partido.
  - Gestión de plantillas de atletas y publicación de noticias/crónicas.

## 5. Lógica de Carga y Reglas de Negocio
- **Flujo de Carga Post-Partido:**
  - El coordinador abre el partido finalizado en el panel.
  - **Filtro en cascada:** El selector de MVP y de eventos (goleadores, asistencias, tarjetas, anotadores) se restringe estrictamente a los atletas registrados en las plantillas de los 2 equipos del encuentro.
  - **Formularios adaptativos por deporte:**
    - *Fútbol / Futsal:* Marcador global, goles por atleta, asistencias y tarjetas (amarilla/roja).
    - *Baloncesto:* Marcador global, parciales por cuartos (Q1-Q4) y puntos de máximos anotadores.
    - *Voleibol / Tenis / Tenis de Mesa:* Desglose set por set en `match_details` (JSONB).
    - *Ajedrez:* Puntos por mesa o resultado global.
  - **Recálculo automático:** Al pasar el partido a estado `FINISHED`, las Vistas SQL recalculan automáticamente las tablas de posiciones por deporte, la tabla de goleadores/líderes y el Medallero Institucional General.

## 6. Integración Comercial: Liga U Pass + CarnetX
- **Visualización Pública:** Catálogo interactivo de beneficios filtrable por categoría (Gastronomía, Entretenimiento, Salud, etc.) y ubicación (Caracas, Nacional, etc.).
- **Modal de Canje:**
  - *Beneficios Web:* Visualización y copiado de código promocional.
  - *Beneficios Físicos:* Modal instructivo para presentar o escanear el carnet digital de CarnetX en el establecimiento comercial (sin dependencias de webhooks externos).

## 7. Modelo de Datos Relacional (Entidades Principales)
- `universities` (id, name, short_name, logo_url, colors JSONB)
- `sports` (id, name, slug, category_type: Individual/Colectivo)
- `teams` (id, university_id, sport_id, gender, coach_name)
- `athletes` (id, team_id, user_id NULLABLE, full_name, jersey_number, position, photo_url, is_active)
- `matches` (id, sport_id, home_team_id, away_team_id, match_date, location, home_score, away_score, match_details JSONB, status, mvp_athlete_id, round_name)
- `match_events` (id, match_id, team_id, athlete_id, assist_athlete_id NULLABLE, event_type, value, detail)
- `news` (id, title, slug, excerpt, content, cover_image_url, sport_id, university_id, is_featured, published_at)
- `podcast_episodes` (id, title, episode_number, description, cover_url, youtube_url, spotify_url, published_at)
- `pass_sponsors` (id, name, logo_url, category, location_tag, is_active)
- `pass_benefits` (id, sponsor_id, discount_title, status, redemption_type, promo_code, instructions, external_url, expires_at, click_count)

## 8. Arquitectura de Módulos de la Aplicación
- **Frontend Público:**
  - `/` (Home con Ticker de resultados, Medallero Top, MVP semanal, Noticias y Banner Pass)
  - `/competicion` (Fixture interactivo, Tablas de Posiciones, Líderes estadísticos y Detalle de partido)
  - `/universidades` y `/universidades/[id]` (Perfiles institucionales y rosters)
  - `/atletas/[id]` (Ficha individual con historial de partidos, estadísticas acumuladas y MVPs)
  - `/noticias` y `/noticias/[slug]` (Feed y lectura con filtros)
  - `/multimedia` (Hub de podcasts y videos oficiales)
  - `/liga-u-pass` (Catálogo comercial con modales de canje CarnetX)
- **Backoffice CMS (`/admin`):**
  - `/admin/login` (Autenticación Supabase con redirección por rol)
  - `/admin/partidos` (Gestor de calendario y formulario contextual de resultados/MVP)
  - `/admin/equipos` (CRUD de universidades, deportes y atletas)
  - `/admin/noticias` (Editor de crónicas con carga a Cloudinary)
  - `/admin/multimedia` (Carga de episodios de podcast)
  - `/admin/comercial` *(Exclusivo Superadmin)* (Gestión de marcas, beneficios y métricas de Liga U Pass)

## 9. Fases de Ejecución del Proyecto
- **Fase 1:** Configuración de Base de Datos Supabase (DDL SQL, Enums, RLS, Vistas de Clasificación) y Semillado Inicial (8 universidades y 9 deportes).
- **Fase 2:** Inicialización de Next.js, configuración de Tailwind/Shadcn, clientes de Supabase/Cloudinary y autenticación RBAC.
- **Fase 3:** Construcción del Backoffice CMS (Carga de partidos inteligente, gestión de atletas, crónicas y hub comercial exclusivo).
- **Fase 4:** Desarrollo del Portal Público (Home, Match Center, Fichas de Atletas, Noticias, Podcasts y Liga U Pass con CarnetX).
- **Fase 5:** Optimización PWA, SEO y despliegue continuo en Vercel.
