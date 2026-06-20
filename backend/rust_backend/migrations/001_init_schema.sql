-- 创建数据库
CREATE TABLE "public"."comments" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "conversation_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "parent_id" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "comments_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)
;

ALTER TABLE "public"."comments" 
  OWNER TO "agentshare";

CREATE INDEX "comments_conversation_id_idx" ON "public"."comments" USING btree (
  "conversation_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE INDEX "comments_parent_id_idx" ON "public"."comments" USING btree (
  "parent_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);


CREATE TABLE "public"."conversation_skills" (
  "conversation_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "skill_id" text COLLATE "pg_catalog"."default" NOT NULL,
  CONSTRAINT "conversation_skills_pkey" PRIMARY KEY ("conversation_id", "skill_id"),
  CONSTRAINT "conversation_skills_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "conversation_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)
;

ALTER TABLE "public"."conversation_skills" 
  OWNER TO "agentshare";


CREATE TABLE "public"."conversations" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "raw_content" text COLLATE "pg_catalog"."default" NOT NULL,
  "source_type" text COLLATE "pg_catalog"."default" NOT NULL,
  "is_public" bool NOT NULL DEFAULT true,
  "price" numeric NOT NULL DEFAULT 0,
  "view_count" int4 NOT NULL DEFAULT 0,
  "like_count" int4 NOT NULL DEFAULT 0,
  "dislike_count" int4 NOT NULL DEFAULT 0,
  "bookmark_count" int4 NOT NULL DEFAULT 0,
  "comment_count" int4 NOT NULL DEFAULT 0,
  "message_count" int4 NOT NULL DEFAULT 0,
  "tags" text[] COLLATE "pg_catalog"."default",
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
)
;

ALTER TABLE "public"."conversations" 
  OWNER TO "agentshare";

CREATE INDEX "conversations_is_public_created_at_idx" ON "public"."conversations" USING btree (
  "is_public" "pg_catalog"."bool_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

CREATE INDEX "conversations_is_public_like_count_idx" ON "public"."conversations" USING btree (
  "is_public" "pg_catalog"."bool_ops" ASC NULLS LAST,
  "like_count" "pg_catalog"."int4_ops" DESC NULLS FIRST
);

CREATE INDEX "conversations_is_public_view_count_idx" ON "public"."conversations" USING btree (
  "is_public" "pg_catalog"."bool_ops" ASC NULLS LAST,
  "view_count" "pg_catalog"."int4_ops" DESC NULLS FIRST
);

CREATE INDEX "conversations_user_id_idx" ON "public"."conversations" USING btree (
  "user_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);


CREATE TABLE "public"."environments" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "conversation_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "os" text COLLATE "pg_catalog"."default",
  "container_info" text COLLATE "pg_catalog"."default",
  "gpu" text COLLATE "pg_catalog"."default",
  "runtime_info" text COLLATE "pg_catalog"."default",
  "raw_info" jsonb,
  CONSTRAINT "environments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "environments_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)
;

ALTER TABLE "public"."environments" 
  OWNER TO "agentshare";

CREATE UNIQUE INDEX "environments_conversation_id_key" ON "public"."environments" USING btree (
  "conversation_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);


CREATE TABLE "public"."faucet_claims" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "wallet_address" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default",
  "amount" int4 NOT NULL,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "faucet_claims_pkey" PRIMARY KEY ("id")
)
;

ALTER TABLE "public"."faucet_claims" 
  OWNER TO "agentshare";

CREATE UNIQUE INDEX "faucet_claims_wallet_address_key" ON "public"."faucet_claims" USING btree (
  "wallet_address" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);


CREATE TABLE "public"."follows" (
  "follower_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "following_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)
;

ALTER TABLE "public"."follows" 
  OWNER TO "agentshare";

CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "public"."follows" USING btree (
  "follower_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "following_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);


CREATE TABLE "public"."interactions" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "target_type" text COLLATE "pg_catalog"."default" NOT NULL,
  "target_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "action" text COLLATE "pg_catalog"."default" NOT NULL,
  CONSTRAINT "interactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)
;

ALTER TABLE "public"."interactions" 
  OWNER TO "agentshare";

CREATE INDEX "interactions_target_type_target_id_idx" ON "public"."interactions" USING btree (
  "target_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "target_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE UNIQUE INDEX "interactions_user_id_target_type_target_id_action_key" ON "public"."interactions" USING btree (
  "user_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "target_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "target_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "action" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE TABLE "public"."messages" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "conversation_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "sequence" int4 NOT NULL,
  "role" text COLLATE "pg_catalog"."default" NOT NULL,
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "tool_calls" jsonb,
  "timestamp" timestamp(3),
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)
;

ALTER TABLE "public"."messages" 
  OWNER TO "agentshare";

CREATE INDEX "messages_conversation_id_sequence_idx" ON "public"."messages" USING btree (
  "conversation_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "sequence" "pg_catalog"."int4_ops" ASC NULLS LAST
);

CREATE UNIQUE INDEX "messages_conversation_id_sequence_key" ON "public"."messages" USING btree (
  "conversation_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "sequence" "pg_catalog"."int4_ops" ASC NULLS LAST
);

CREATE TABLE "public"."on_chain_transactions" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "signature" text COLLATE "pg_catalog"."default" NOT NULL,
  "from_address" text COLLATE "pg_catalog"."default" NOT NULL,
  "to_address" text COLLATE "pg_catalog"."default" NOT NULL,
  "mint_address" text COLLATE "pg_catalog"."default",
  "amount" int8 NOT NULL,
  "platform_fee" int8 NOT NULL,
  "type" text COLLATE "pg_catalog"."default" NOT NULL,
  "conversation_id" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'confirmed'::text,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "on_chain_transactions_pkey" PRIMARY KEY ("id")
)
;

ALTER TABLE "public"."on_chain_transactions" 
  OWNER TO "agentshare";

CREATE INDEX "on_chain_transactions_conversation_id_idx" ON "public"."on_chain_transactions" USING btree (
  "conversation_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE INDEX "on_chain_transactions_from_address_idx" ON "public"."on_chain_transactions" USING btree (
  "from_address" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE UNIQUE INDEX "on_chain_transactions_signature_key" ON "public"."on_chain_transactions" USING btree (
  "signature" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE INDEX "on_chain_transactions_to_address_idx" ON "public"."on_chain_transactions" USING btree (
  "to_address" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);


CREATE TABLE "public"."skills" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "like_count" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "skills_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
)
;

ALTER TABLE "public"."skills" 
  OWNER TO "agentshare";


CREATE TABLE "public"."unlocks" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "conversation_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "amount_spent" int4 NOT NULL,
  "payment_method" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'token'::text,
  "tx_signature" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "unlocks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "unlocks_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "unlocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)
;

ALTER TABLE "public"."unlocks" 
  OWNER TO "agentshare";

CREATE UNIQUE INDEX "unlocks_user_id_conversation_id_key" ON "public"."unlocks" USING btree (
  "user_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "conversation_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE TABLE "public"."users" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "password_hash" text COLLATE "pg_catalog"."default" NOT NULL,
  "api_key" text COLLATE "pg_catalog"."default" NOT NULL,
  "nickname" text COLLATE "pg_catalog"."default" NOT NULL,
  "avatar" text COLLATE "pg_catalog"."default",
  "bio" text COLLATE "pg_catalog"."default",
  "wallet_address" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
)
;

ALTER TABLE "public"."users" 
  OWNER TO "agentshare";

CREATE UNIQUE INDEX "users_api_key_key" ON "public"."users" USING btree (
  "api_key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE UNIQUE INDEX "users_email_key" ON "public"."users" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

CREATE INDEX "users_wallet_address_idx" ON "public"."users" USING btree (
  "wallet_address" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);