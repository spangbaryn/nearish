alter table "public"."profiles" 
  add column "onboarded" boolean default false not null;

-- Update existing profiles to be marked as onboarded
update "public"."profiles" 
  set "onboarded" = true 
  where "created_at" < now();

-- Add a comment to the column
comment on column "public"."profiles"."onboarded" is 'Indicates whether the user has completed the onboarding process'; 