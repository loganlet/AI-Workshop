-- Test for complete_task. Run it in the Supabase SQL Editor AFTER
-- task_repeat.sql. It needs at least one task to already exist, so it can
-- borrow that task's owner.
-- Everything runs inside one transaction that ends in ROLLBACK, so nothing
-- is saved and the database is left exactly as it was.
--
-- EXPECTED RESULT: exactly two rows.
--   1. the original task: done = true,  due_date 2026-10-12
--   2. one new copy:      done = false, due_date 2026-10-19
-- complete_task is called twice on purpose. Only one copy proves that ticking
-- the same task twice does not create a second copy.
-- The check near the end stops with a red "TEST FAILED" error if the rows are
-- anything else.

begin;

-- As the editor's default role, add a weekly test task for an existing user
-- (borrowed from any existing task) and remember its id and owner for the
-- rest of this transaction.
select set_config('test.user_id', (select user_id::text from public.tasks limit 1), true);

with new_task as (
  insert into public.tasks (user_id, title, skill, repeat, due_date)
  values (
    current_setting('test.user_id')::uuid,
    'Repeat test task (rolled back)',
    'Reading',
    'weekly',
    '2026-10-12'
  )
  returning id
)
select set_config('test.task_id', id::text, true) from new_task;

-- Pretend to be that user signed in on the site.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.user_id'), 'role', 'authenticated')::text,
  true
);

-- Tick the task off twice in a row, with "today" being its due date.
select public.complete_task(current_setting('test.task_id')::uuid, '2026-10-12');
select public.complete_task(current_setting('test.task_id')::uuid, '2026-10-12');

-- Show that user's tasks with the test title.
select id, title, repeat, done, due_date
  from public.tasks
 where user_id = current_setting('test.user_id')::uuid
   and title = 'Repeat test task (rolled back)'
 order by due_date;

-- Stop with an error if the rows above are not exactly the two expected ones.
do $$
begin
  if (select count(*) from public.tasks
       where user_id = current_setting('test.user_id')::uuid
         and title = 'Repeat test task (rolled back)') <> 2
     or not exists (select 1 from public.tasks
       where id = current_setting('test.task_id')::uuid
         and done = true and due_date = '2026-10-12')
     or not exists (select 1 from public.tasks
       where user_id = current_setting('test.user_id')::uuid
         and title = 'Repeat test task (rolled back)'
         and done = false and due_date = '2026-10-19')
  then
    raise exception 'TEST FAILED: expected exactly 2 rows (original done on 2026-10-12, one copy not done on 2026-10-19)';
  end if;
end;
$$;

-- Undo everything, whatever happened above.
rollback;
