ALTER TABLE public.connections
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.connections
ALTER COLUMN access_token DROP NOT NULL;

CREATE INDEX idx_connections_user_active
ON public.connections (user_id, is_active);