"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { isConfigured, loadSession } from "../../supabase-auth";
import { getTask, type Task } from "../../supabase-tasks";
import { MAX_NOTE_LENGTH, addNote, listNotes, type Note } from "../../supabase-notes";

// Task ids are UUIDs. Anything else in the address can't be a real task, so
// it is treated as "not found" without asking the database.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Status = "loading" | "signed-out" | "not-found" | "error" | "ready";

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function TaskDetail({ id }: { id: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [task, setTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isConfigured()) {
        setError("Tasks are not set up on this site yet.");
        setStatus("error");
        return;
      }
      if (!(await loadSession())) {
        setStatus("signed-out");
        return;
      }
      if (!UUID_PATTERN.test(id)) {
        setStatus("not-found");
        return;
      }
      try {
        const found = await getTask(id);
        if (!found) {
          setStatus("not-found");
          return;
        }
        setTask(found);
        setNotes(await listNotes(id));
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load this task.");
        setStatus("error");
      }
    }
    load();
  }, [id]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Type a note first.");
      return;
    }
    if (trimmed.length > MAX_NOTE_LENGTH) {
      setError(`Notes can be at most ${MAX_NOTE_LENGTH} characters.`);
      return;
    }

    setError("");
    setBusy(true);
    try {
      const note = await addNote(id, trimmed);
      setNotes((current) => [...current, note]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the note.");
    } finally {
      setBusy(false);
    }
  }

  const backLink = (
    <p className="back-link">
      <Link href="/">← Back to your tasks</Link>
    </p>
  );

  if (status === "loading") {
    return (
      <>
        {backLink}
        <p className="auth-muted">Loading task…</p>
      </>
    );
  }

  if (status === "signed-out") {
    return (
      <>
        {backLink}
        <p>Log in to see this task.</p>
      </>
    );
  }

  if (status === "not-found" || !task) {
    return (
      <>
        {backLink}
        {status === "error" ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : (
          <h1>Task not found</h1>
        )}
      </>
    );
  }

  return (
    <>
      {backLink}
      <header className="task-header">
        <h1>{task.title}</h1>
        <span className="task-skill">{task.skill}</span>
        {task.done && <span className="task-status">Done</span>}
      </header>

      <section className="notes">
        <h2>Notes</h2>

        {notes.length === 0 ? (
          <p className="auth-muted">No notes yet.</p>
        ) : (
          <ol className="note-items">
            {notes.map((note) => (
              <li key={note.id} className="note">
                <time className="note-date" dateTime={note.created_at}>
                  {formatDate(note.created_at)}
                </time>
                <p className="note-body">{note.body}</p>
              </li>
            ))}
          </ol>
        )}

        <form onSubmit={handleAdd} className="note-form">
          <label>
            New note
            <textarea
              rows={4}
              maxLength={MAX_NOTE_LENGTH}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add note"}
          </button>
        </form>
      </section>
    </>
  );
}
