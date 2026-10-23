ALTER TABLE public.post_targets
DROP CONSTRAINT post_targets_connection_id_fkey;

ALTER TABLE public.post_targets
ADD CONSTRAINT post_targets_connection_id_fkey
FOREIGN KEY (connection_id)
REFERENCES public.connections(id)
ON DELETE SET NULL;