// Talks to Supabase's sign-in service over plain web requests, so the site
// needs no extra library. The session is kept in the browser's localStorage,
// which survives closing the tab.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const STORAGE_KEY = "air-workshop-session";

export type Session = {
  accessToken: string;
  refreshToken: string;
  // Seconds since 1970 when the access token stops working.
  expiresAt: number;
  email: string;
};

export function isConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

async function authRequest(
  path: string,
  body: object | null,
  accessToken?: string,
): Promise<Record<string, unknown>> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Sign-in is not set up on this site yet.");
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the sign-in service. Check your connection.");
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    // Empty or non-JSON reply; the status code below still tells us the result.
  }

  if (!response.ok) {
    const message =
      (data.msg as string) ||
      (data.error_description as string) ||
      (data.message as string) ||
      "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
}

function toSession(data: Record<string, unknown>): Session | null {
  const user = data.user as { email?: string } | undefined;
  if (typeof data.access_token !== "string" || !user?.email) {
    return null;
  }
  const expiresAt =
    typeof data.expires_at === "number"
      ? data.expires_at
      : Math.floor(Date.now() / 1000) + Number(data.expires_in ?? 3600);
  return {
    accessToken: data.access_token,
    refreshToken: String(data.refresh_token),
    expiresAt,
    email: user.email,
  };
}

function saveSession(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be blocked (for example in some private windows).
    // Sign-in still works for this visit; it just will not be remembered.
  }
}

export async function signUp(email: string, password: string): Promise<Session> {
  const data = await authRequest("signup", { email, password });
  const session = toSession(data);
  if (!session) {
    // Happens if email confirmation is switched on in Supabase.
    throw new Error("Account created, but it needs email confirmation before you can log in.");
  }
  saveSession(session);
  return session;
}

export async function logIn(email: string, password: string): Promise<Session> {
  const data = await authRequest("token?grant_type=password", { email, password });
  const session = toSession(data);
  if (!session) {
    throw new Error("Log in failed. Please try again.");
  }
  saveSession(session);
  return session;
}

export async function signOut(session: Session): Promise<void> {
  // Forget the session in this browser first, so the person is signed out
  // here even if the request to Supabase fails.
  saveSession(null);
  try {
    await authRequest("logout", null, session.accessToken);
  } catch {
    // Already signed out locally; nothing else to do.
  }
}

// Returns the saved session, renewing it first if it has expired or is about
// to. Returns null if there is no session or it can no longer be renewed.
export async function loadSession(): Promise<Session | null> {
  let saved: Session | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    saved = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    saved = null;
  }
  if (!saved) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (saved.expiresAt - now > 60) {
    return saved;
  }

  try {
    const data = await authRequest("token?grant_type=refresh_token", {
      refresh_token: saved.refreshToken,
    });
    const session = toSession(data);
    saveSession(session);
    return session;
  } catch {
    saveSession(null);
    return null;
  }
}
