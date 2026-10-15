-- Security test for task_notes. Run it in the Supabase SQL Editor AFTER
-- task_notes.sql. It needs at least one task to already exist.
-- Everything runs inside one transaction that ends in ROLLBACK, so nothing
-- is saved and the database is left exactly as it was.
--
-- EXPECTED RESULT: an error that says
--   new row violates row-level security policy for table "task_notes"
-- That error proves a person cannot add a note to a task that isn't theirs.
-- (If the insert succeeds instead, the policy is not working.)

begin;

-- As the editor's default role, pick any existing task and remember its id
-- for the rest of this transaction.
select set_config('test.task_id', (select id::text from public.tasks limit 1), true);

-- Pretend to be a signed-in site visitor with a made-up user id that owns
-- no tasks.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "00000000-0000-0000-0000-000000000000", "role": "authenticated"}',
  true
);

-- Try to add a note to the saved task, which belongs to someone else.
-- This line should fail with the row-level security error above.
insert into public.task_notes (task_id, body)
values (current_setting('test.task_id')::uuid, 'This note should be blocked.');

-- Undo everything, whatever happened above.
rollback;
