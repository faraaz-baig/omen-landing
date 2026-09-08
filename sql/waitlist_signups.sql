-- Waitlist signups for the landing page CTA.
--
-- One row per person. Two things enforce that, and both are needed:
--
--   1. The server action (src/app/actions/waitlist.ts) trims and lowercases
--      before inserting, so what lands here is already normalised.
--   2. This index is trim- and case-insensitive, so the constraint still holds
--      for anything written outside the app — a script, a console, a backfill.
--
-- Relying on (1) alone means the guarantee lasts exactly until something else
-- writes to the table.
--
-- Re-signing up is `on conflict do nothing`: the person sees the same success
-- message and no duplicate row is written.

create table if not exists waitlist_signups (
  id         bigserial primary key,
  email      text not null,
  source     text not null default 'landing',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_signups_email_key
  on waitlist_signups (lower(btrim(email)));
