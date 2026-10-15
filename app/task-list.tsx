"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  SKILLS,
  addTask,
  completeTask,
  listTasks,
  localToday,
  type ListedTask,
  type Repeat,
  type Skill,
} from "./supabase-tasks";
import { MAX_NOTE_LENGTH, addNote } from "./supabase-notes";

const REPEAT_CHOICES: { value: Repeat; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

// "2026-10-19" -> "Mon Oct 19". The date is built from its parts so it stays
// on the same calendar day; new Date("2026-10-19") would read it as UTC
// midnight, which is the evening before in Hawaii.
function formatDue(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day)
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .replace(",", "");
}

// Not-done tasks first, soonest due date first, tasks without a date last;
// then done tasks. Ties keep the order the tasks were created in.
function sortTasks(tasks: ListedTask[]): ListedTask[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done) return 0;
    if (a.due_date === b.due_date) return 0;
    if (a.due_date === null) return 1;
    if (b.due_date === null) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  });
}

export default function TaskList() {
  const [tasks, setTasks] = useState<ListedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [skill, setSkill] = useState<Skill>(SKILLS[0]);
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listTasks()
      .then(setTasks)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load tasks."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Type a task title first.");
      return;
    }

    const trimmedNote = note.trim();
    if (trimmedNote.length > MAX_NOTE_LENGTH) {
      setError(`Notes can be at most ${MAX_NOTE_LENGTH} characters.`);
      return;
    }

    setError("");
    setBusy(true);
    try {
      // Two separate saves: the note needs the new task's id, which only
      // exists once the task is saved.
      // A repeating task needs a due date to count from; use today if blank.
      const dueDate = due || (repeat === "none" ? null : localToday());
      const task = await addTask(trimmed, skill, repeat, dueDate);
      setTitle("");
      setRepeat("none");
      setDue("");
      if (!trimmedNote) {
        setNote("");
        setTasks((current) => [...current, { ...task, noteCount: 0 }]);
        return;
      }
      try {
        await addNote(task.id, trimmedNote);
        setTasks((current) => [...current, { ...task, noteCount: 1 }]);
        setNote("");
      } catch {
        // Keep the note text in the box so it isn't lost.
        setTasks((current) => [...current, { ...task, noteCount: 0 }]);
        setError(
          "The task was added, but the note wasn't saved. Open the task to add it.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the task.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkDone(id: string) {
    setError("");
    setBusy(true);
    try {
      await completeTask(id);
      // Reload the whole list so a repeating task's new copy shows up.
      setTasks(await listTasks());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tasks">
      <h2>Your tasks</h2>

      <form onSubmit={handleAdd} className="task-form">
        <label>
          Task
          <input
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="task-form-notes">
          Notes
          <textarea
            rows={2}
            maxLength={MAX_NOTE_LENGTH}
            placeholder="Optional"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <label>
          Skill
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value as Skill)}
          >
            {SKILLS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Repeat
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as Repeat)}
          >
            {REPEAT_CHOICES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Due
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </label>
        <button type="submit" disabled={busy}>
          Add
        </button>
      </form>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="auth-muted">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="auth-muted">No tasks yet.</p>
      ) : (
        <ul className="task-items">
          {sortTasks(tasks).map((task) => (
            <li key={task.id} className={task.done ? "task done" : "task"}>
              <Link href={`/tasks/${task.id}`} className="task-title">
                {task.title}
              </Link>
              <span className="task-skill">{task.skill}</span>
              {task.due_date && (
                <span className="task-due">Due {formatDue(task.due_date)}</span>
              )}
              {task.repeat !== "none" && (
                <span className="task-repeat">Repeats {task.repeat}</span>
              )}
              <Link href={`/tasks/${task.id}`} className="task-notes-link">
                {task.noteCount > 0 ? `Notes (${task.noteCount})` : "Notes"}
              </Link>
              {task.done ? (
                <span className="task-status">Done</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMarkDone(task.id)}
                  disabled={busy}
                >
                  Mark done
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
