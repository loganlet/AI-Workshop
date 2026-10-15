"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  SKILLS,
  addTask,
  listTasks,
  markTaskDone,
  type ListedTask,
  type Skill,
} from "./supabase-tasks";
import { MAX_NOTE_LENGTH, addNote } from "./supabase-notes";

export default function TaskList() {
  const [tasks, setTasks] = useState<ListedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [skill, setSkill] = useState<Skill>(SKILLS[0]);
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
      const task = await addTask(trimmed, skill);
      setTitle("");
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
      const updated = await markTaskDone(id);
      setTasks((current) =>
        current.map((task) =>
          task.id === updated.id ? { ...updated, noteCount: task.noteCount } : task,
        ),
      );
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
          {tasks.map((task) => (
            <li key={task.id} className={task.done ? "task done" : "task"}>
              <Link href={`/tasks/${task.id}`} className="task-title">
                {task.title}
              </Link>
              <span className="task-skill">{task.skill}</span>
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
