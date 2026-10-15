-- Task notes: short comments a person adds to one of their own tasks over time.
-- Run this once in the Supabase SQL Editor. It does not change the tasks table.

-- Create the table that holds notes. Each note belongs to exactly one task.
-- If a task is ever deleted, its notes are deleted with it ("on delete cascade").
-- A note must have between 1 and 2000 characters once spaces at the start and
-- end are ignored, so blank notes can never be saved.
-- There is no user_id column on purpose: a note's owner is the owner of its task.
create table public.task_notes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Add an index on task_id so looking up "all notes for this task" stays fast
-- as the number of notes grows.
create index task_notes_task_id_idx on public.task_notes (task_id);

-- Turn on row level security. From now on, nobody using the site can read or
-- add notes unless one of the policies below allows it.
alter table public.task_notes enable row level security;

-- Let a signed-in person read a note only if the task it belongs to is theirs.
create policy "Read notes on own tasks"
  on public.task_notes
  for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = task_notes.task_id
        and tasks.user_id = (select auth.uid())
    )
  );

-- Let a signed-in person add a note only to a task that is theirs.
create policy "Add notes to own tasks"
  on public.task_notes
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.tasks
      where tasks.id = task_notes.task_id
        and tasks.user_id = (select auth.uid())
    )
  );

-- There are no update or delete policies, so notes cannot be edited or removed
-- from the site. Notes are add-only for now.
