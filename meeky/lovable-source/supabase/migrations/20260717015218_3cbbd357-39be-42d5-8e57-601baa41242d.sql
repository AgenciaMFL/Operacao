-- ============ rate_limits table ============
CREATE TABLE public.rate_limits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX rate_limits_key_uniq ON public.rate_limits(key);
CREATE INDEX rate_limits_window_start_idx ON public.rate_limits(window_start);

GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on rate_limits"
  ON public.rate_limits
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============ atomic check + increment ============
-- Returns true if the request is allowed (within limit), false if blocked.
-- Uses UPSERT to atomically create the row or reset when window expired,
-- then increment the counter.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _key            TEXT,
  _max_requests   INTEGER,
  _window_seconds INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.rate_limits AS r (key, window_start, count)
  VALUES (_key, now(), 1)
  ON CONFLICT (key) DO UPDATE
    SET
      -- If the previous window has expired, reset window_start and count.
      window_start = CASE
        WHEN r.window_start < now() - make_interval(secs => _window_seconds)
          THEN now()
        ELSE r.window_start
      END,
      count = CASE
        WHEN r.window_start < now() - make_interval(secs => _window_seconds)
          THEN 1
        ELSE r.count + 1
      END
  RETURNING count INTO v_count;

  RETURN v_count <= _max_requests;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- ============ daily cleanup via pg_cron ============
-- Removes rate_limits rows older than 24h so the table doesn't grow forever.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Unschedule any prior version of the job (safe if missing).
    BEGIN
      PERFORM cron.unschedule('rate-limits-cleanup');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    PERFORM cron.schedule(
      'rate-limits-cleanup',
      '17 3 * * *',
      $cron$ DELETE FROM public.rate_limits WHERE window_start < now() - interval '24 hours'; $cron$
    );
  END IF;
END $$;