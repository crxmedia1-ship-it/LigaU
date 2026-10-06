GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE
  public.universities,
  public.sports,
  public.teams,
  public.athletes,
  public.matches,
  public.match_events,
  public.news,
  public.podcast_episodes
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.profiles,
  public.universities,
  public.sports,
  public.teams,
  public.athletes,
  public.matches,
  public.match_events,
  public.news,
  public.podcast_episodes
TO authenticated;

GRANT USAGE ON TYPE
  public.user_role,
  public.sport_category,
  public.team_gender,
  public.match_status,
  public.pass_status,
  public.redemption_type
TO anon, authenticated;
