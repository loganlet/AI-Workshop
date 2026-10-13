"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  SKILLS,
  addTask,
  listTasks,
  markTaskDone,
  type Skill,
  type Task,
} from "./supabase-tasks";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
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

    setError("");
    setBusy(true);
    try {
      const task = await addTask(trimmed, skill);
      setTasks((current) => [...current, task]);
      setTitle("");
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
        current.map((task) => (task.id === updated.id ? updated : task)),
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
              <span className="task-title">{task.title}</span>
              <span className="task-skill">{task.skill}</span>
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
