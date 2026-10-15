-- Repeating tasks: a task can repeat daily or weekly. Ticking one off marks
-- that row done and creates the next copy with a later due date.
-- Run this once in the Supabase SQL Editor, AFTER task_notes.sql.

-- Add a due date to tasks. It is optional: tasks that already exist keep an
-- empty (null) due date, and new one-off tasks can leave it empty too.
alter table public.tasks
  add column due_date date;

-- Add how often a task repeats. Every task gets 'none' unless told otherwise,
-- including all existing tasks. Only 'none', 'daily' or 'weekly' are allowed.
alter table public.tasks
  add column repeat text not null default 'none'
  check (repeat in ('none', 'daily', 'weekly'));

-- A repeating task must have a due date, because the next copy's date is
-- worked out from it. One-off tasks may have a due date or not.
alter table public.tasks
  add constraint tasks_repeat_needs_due_date
  check (repeat = 'none' or due_date is not null);

-- complete_task: ticks off one task, and if it repeats, creates the next copy.
--   p_task_id: the task being ticked off.
--   p_today:   the person's own local date, sent by their browser. The
--              database's own "today" is in UTC, which is a different day
--              than Hawaii for 10 hours of every day, so it is never used.
-- SECURITY INVOKER means it runs as the signed-in person, so the existing
-- row level security rules still apply: nobody can tick off or copy a task
-- that isn't theirs.
create or replace function public.complete_task(p_task_id uuid, p_today date)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_task tasks%rowtype;
  v_step integer;
  v_next date;
begin
  if p_today is null then
    raise exception 'complete_task needs today''s date';
  end if;

  -- Mark the task done, but only if it is not done already. If the same task
  -- is ticked twice at once (double-click, two tabs), the database makes the
  -- second call wait for the first; by then done is true, so the second call
  -- updates nothing and stops below. That is what prevents a second copy.
  update tasks
     set done = true
   where id = p_task_id
     and done = false
  returning * into v_task;

  -- Nothing was updated (already done, not found, or not this person's task),
  -- or the task does not repeat: there is nothing more to do.
  if not found or v_task.repeat = 'none' then
    return;
  end if;

  -- Daily moves the date by 1 day, weekly by 7.
  v_step := case v_task.repeat when 'daily' then 1 else 7 end;
  v_next := v_task.due_date + v_step;

  -- If the next date is still in the past, keep adding the same step until it
  -- is today or later. Subtracting two dates gives a number of days, so this
  -- jumps there in one step instead of looping.
  if v_next < p_today then
    v_next := v_next + ((p_today - v_next + v_step - 1) / v_step) * v_step;
  end if;

  -- Create the next copy: same owner, title, skill and repeat, not done, with
  -- the new due date. Notes stay with the old row as history and are not copied.
  insert into tasks (user_id, title, skill, repeat, done, due_date)
  values (v_task.user_id, v_task.title, v_task.skill, v_task.repeat, false, v_next);
end;
$$;

-- By default anyone, including visitors who are not signed in, could call a
-- new function. Take that away, then allow only signed-in people.
revoke execute on function public.complete_task(uuid, date) from public, anon;
grant execute on function public.complete_task(uuid, date) to authenticated;
