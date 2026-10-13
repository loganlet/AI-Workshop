// Reads and saves study tasks in Supabase's "tasks" table over plain web
// requests, like supabase-auth.ts. The database itself only lets each person
// see and change their own rows, so the site never filters by person here.

import { loadSession } from "./supabase-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const SKILLS = [
  "Listening",
  "Speaking",
  "Reading",
  "Writing",
  "Vocabulary",
  "Grammar",
] as const;

export type Skill = (typeof SKILLS)[number];

export type Task = {
  id: string;
  title: string;
  skill: Skill;
  done: boolean;
};

const TASK_COLUMNS = "id,title,skill,done";

async function dataRequest(
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: object,
): Promise<Task[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Tasks are not set up on this site yet.");
  }

  // Renews the sign-in first if it has expired while the page was open.
  const session = await loadSession();
  if (!session) {
    throw new Error("Your sign-in has expired. Sign out and log in again.");
  }

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the task service. Check your connection.");
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Empty or non-JSON reply; the status code below still tells us the result.
  }

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ||
      "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return Array.isArray(data) ? (data as Task[]) : [];
}

export async function listTasks(): Promise<Task[]> {
  return dataRequest(`tasks?select=${TASK_COLUMNS}&order=created_at.asc`, "GET");
}

export async function addTask(title: string, skill: Skill): Promise<Task> {
  const [task] = await dataRequest(`tasks?select=${TASK_COLUMNS}`, "POST", {
    title,
    skill,
  });
  if (!task) {
    throw new Error("The task was not saved. Please try again.");
  }
  return task;
}

export async function markTaskDone(id: string): Promise<Task> {
  const [task] = await dataRequest(
    `tasks?id=eq.${encodeURIComponent(id)}&select=${TASK_COLUMNS}`,
    "PATCH",
    { done: true },
  );
  if (!task) {
    throw new Error("That task could not be updated. Please reload the page.");
  }
  return task;
}
