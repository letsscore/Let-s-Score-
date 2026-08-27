-- LET'S SCORE • Revisionary Test Portal
-- Run this ONCE in Supabase SQL Editor.
-- This schema supports teacher-controlled tests for Classes VI-XII.

create extension if not exists pgcrypto;

create table if not exists public.revision_tests (
  id uuid primary key default gen_random_uuid(),
  class text not null unique check (class in ('VI','VII','VIII','IX','X','XI','XII')),
  title text not null default 'Revisionary Test',
  duration_minutes integer not null default 30 check (duration_minutes between 1 and 180),
  questions jsonb not null default '[]'::jsonb,
  is_live boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.test_submissions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.revision_tests(id) on delete cascade,
  class text not null,
  student_name text not null,
  answers jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  total integer not null default 0,
  submitted_at timestamptz not null default now()
);

-- Teacher accounts use Supabase Authentication.
-- Add your teacher email in Supabase Authentication > Users.
-- Then replace the placeholder UUID below with that user's Auth UID.

create table if not exists public.teacher_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text default 'Teacher',
  created_at timestamptz not null default now()
);

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teacher_profiles
    where user_id = auth.uid()
  );
$$;

alter table public.revision_tests enable row level security;
alter table public.test_submissions enable row level security;
alter table public.teacher_profiles enable row level security;

drop policy if exists "Public can read test status" on public.revision_tests;
create policy "Public can read test status"
on public.revision_tests for select
to anon, authenticated
using (true);

drop policy if exists "Teachers can insert tests" on public.revision_tests;
create policy "Teachers can insert tests"
on public.revision_tests for insert
to authenticated
with check (public.is_teacher());

drop policy if exists "Teachers can update tests" on public.revision_tests;
create policy "Teachers can update tests"
on public.revision_tests for update
to authenticated
using (public.is_teacher())
with check (public.is_teacher());

drop policy if exists "Students can submit tests" on public.test_submissions;
create policy "Students can submit tests"
on public.test_submissions for insert
to anon, authenticated
with check (
  char_length(student_name) between 2 and 80
  and score >= 0
  and total >= 0
);

drop policy if exists "Teachers can read submissions" on public.test_submissions;
create policy "Teachers can read submissions"
on public.test_submissions for select
to authenticated
using (public.is_teacher());

drop policy if exists "Teachers can read own profile" on public.teacher_profiles;
create policy "Teachers can read own profile"
on public.teacher_profiles for select
to authenticated
using (user_id = auth.uid());

insert into public.revision_tests (class)
values ('VI'),('VII'),('VIII'),('IX'),('X'),('XI'),('XII')
on conflict (class) do nothing;

-- IMPORTANT:
-- After creating your teacher user in Authentication > Users,
-- run this with that user's UUID:
-- insert into public.teacher_profiles(user_id) values ('YOUR-AUTH-USER-UUID');
