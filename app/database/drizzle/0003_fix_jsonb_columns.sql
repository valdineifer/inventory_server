-- Custom SQL migration file, put your code below! --

-- More details:
-- https://github.com/drizzle-team/drizzle-orm/releases/tag/0.33.0

update "computer"
set "info" = ("info" #>> '{}')::jsonb;

update "laboratory"
set "settings" = ("settings" #>> '{}')::jsonb;

update "computer_log"
set "old_object" = ("old_object" #>> '{}')::jsonb;

update "settings"
set "value" = ("value" #>> '{}')::jsonb;
