-- Run once if sql/007_app_config.sql already created backend_base_url.
-- The app chooses its API host from EXPO_PUBLIC_API_BASE_URL or the built-in default.

alter table public.app_config
  drop constraint if exists app_config_backend_base_url_format;

alter table public.app_config
  drop column if exists backend_base_url;
