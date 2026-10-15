// Reads and saves notes in Supabase's "task_notes" table. Like tasks, the
// database only shows a person the notes on their own tasks and only lets them
// add notes to their own tasks, so the site never filters by person here.

import { dataRequest } from "./supabase-tasks";

export const MAX_NOTE_LENGTH = 2000;

export type Note = {
  id: string;
  body: string;
  created_at: string;
};

const NOTE_COLUMNS = "id,body,created_at";

// Oldest first, like a comment thread.
export async function listNotes(taskId: string): Promise<Note[]> {
  return dataRequest<Note>(
    `task_notes?task_id=eq.${encodeURIComponent(taskId)}&select=${NOTE_COLUMNS}&order=created_at.asc`,
    "GET",
  );
}

export async function addNote(taskId: string, body: string): Promise<Note> {
  const [note] = await dataRequest<Note>(
    `task_notes?select=${NOTE_COLUMNS}`,
    "POST",
    { task_id: taskId, body },
  );
  if (!note) {
    throw new Error("The note was not saved. Please try again.");
  }
  return note;
}
