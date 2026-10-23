CREATE TABLE "public"."connections" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"            text                     NOT NULL,
  "platform"           text                     NOT NULL,
  "platform_user_id"   text,
  "platform_user_name" text,
  "avatar_url"         text,
  "access_token"       text                     NOT NULL,
  "refresh_token"      text,
  "token_expires_at"   timestamp with time zone,
  "created_at"         timestamp with time zone DEFAULT now(),
  "updated_at"         timestamp with time zone DEFAULT now(),
  CONSTRAINT "connections_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."connections"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."post_targets" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "post_id"              uuid,
  "connection_id"        uuid,
  "scheduled_at"         timestamp with time zone NOT NULL,
  "status"               text                     DEFAULT 'queued'::text,
  "platform_post_id"     text,
  "error_log"            text,
  "retry_count"          integer                  DEFAULT 0,
  "max_retries"          integer                  DEFAULT 3,
  "last_attempt_at"      timestamp with time zone,
  "likes_count"          integer                  DEFAULT 0,
  "comments_count"       integer                  DEFAULT 0,
  "shares_count"         integer                  DEFAULT 0,
  "views_count"          integer                  DEFAULT 0,
  "engagement_rate"      double precision         DEFAULT 0,
  "analytics_updated_at" timestamp with time zone,
  "created_at"           timestamp with time zone DEFAULT now(),
  "updated_at"           timestamp with time zone DEFAULT now(),
  "saved_count"          integer                  DEFAULT 0,
  CONSTRAINT "post_targets_pkey" PRIMARY KEY (id),
  CONSTRAINT "post_targets_status_check" CHECK ((status = ANY (ARRAY['queued'::text, 'publishing'::text, 'published'::text, 'failed'::text, 'failed_permanent'::text])))
);

ALTER TABLE "public"."post_targets"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."posts" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        text                     NOT NULL,
  "content"        text                     NOT NULL,
  "media_urls"     jsonb                    DEFAULT '[]'::jsonb,
  "status"         text                     DEFAULT 'draft'::text,
  "queued_at"      timestamp with time zone,
  "created_at"     timestamp with time zone DEFAULT now(),
  "updated_at"     timestamp with time zone DEFAULT now(),
  "draft_channels" jsonb                    DEFAULT '[]'::jsonb,
  CONSTRAINT "posts_pkey" PRIMARY KEY (id),
  CONSTRAINT "posts_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'queued'::text, 'completed'::text, 'failed'::text])))
);

ALTER TABLE "public"."posts"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."scheduling_slots" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "connection_id" uuid,
  "day_of_week"   integer                  NOT NULL,
  "time_slot"     time without time zone   NOT NULL,
  "timezone"      text                     DEFAULT 'Asia/Jakarta'::text,
  "is_active"     boolean                  DEFAULT true,
  "created_at"    timestamp with time zone DEFAULT now(),
  "updated_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "scheduling_slots_connection_id_day_of_week_time_slot_key" UNIQUE (connection_id, day_of_week, time_slot),
  CONSTRAINT "scheduling_slots_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6))),
  CONSTRAINT "scheduling_slots_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."scheduling_slots"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"         text                     NOT NULL,
  "email"      text                     NOT NULL,
  "full_name"  text,
  "avatar_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "role"       text                     DEFAULT 'user'::text,
  "is_banned"  boolean                  DEFAULT false,
  "banned_at"  timestamp with time zone,
  "banned_by"  text,
  "ban_reason" text,
  CONSTRAINT "users_pkey" PRIMARY KEY (id),
  CONSTRAINT "users_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post_targets"
  ADD CONSTRAINT "post_targets_connection_id_fkey" FOREIGN KEY (connection_id) REFERENCES public.connections(id) ON DELETE CASCADE;

ALTER TABLE "public"."post_targets"
  ADD CONSTRAINT "post_targets_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE "public"."scheduling_slots"
  ADD CONSTRAINT "scheduling_slots_connection_id_fkey" FOREIGN KEY (connection_id) REFERENCES public.connections(id) ON DELETE CASCADE;

CREATE INDEX idx_connections_user ON public.connections USING btree (user_id);

CREATE INDEX idx_post_targets_connection ON public.post_targets USING btree (connection_id);

CREATE INDEX idx_post_targets_post ON public.post_targets USING btree (post_id);

CREATE INDEX idx_post_targets_worker ON public.post_targets USING btree (status, scheduled_at);

CREATE INDEX idx_posts_status ON public.posts USING btree (status);

CREATE INDEX idx_posts_user ON public.posts USING btree (user_id);

CREATE INDEX idx_slots_connection ON public.scheduling_slots USING btree (connection_id);

CREATE UNIQUE INDEX uniq_platform_account ON public.connections USING btree (platform, platform_user_id);

CREATE POLICY "Users can view own post targets" ON "public"."post_targets"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.posts
  WHERE ((posts.id = post_targets.post_id) AND (posts.user_id = (auth.jwt() ->> 'sub'::text))))));

CREATE POLICY "Users can view own posts" ON "public"."posts"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = (auth.jwt() ->> 'sub'::text)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."connections" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."post_targets" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."posts" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."scheduling_slots" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated", "postgres", "service_role";

