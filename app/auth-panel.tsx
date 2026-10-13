"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  isConfigured,
  loadSession,
  logIn,
  signOut,
  signUp,
  type Session,
} from "./supabase-auth";
import TaskList from "./task-list";

const MIN_PASSWORD_LENGTH = 8;

type Mode = "login" | "signup";

export default function AuthPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadSession().then((saved) => {
      setSession(saved);
      setChecking(false);
    });
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setBusy(true);
    try {
      const next =
        mode === "signup"
          ? await signUp(email.trim(), password)
          : await logIn(email.trim(), password);
      setSession(next);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (!session) return;
    setBusy(true);
    await signOut(session);
    setSession(null);
    setEmail("");
    setPassword("");
    setMode("login");
    setBusy(false);
  }

  if (!isConfigured()) {
    return (
      <p className="auth-error" role="alert">
        Sign-in is not set up on this site yet.
      </p>
    );
  }

  if (checking) {
    return <p className="auth-muted">Loading…</p>;
  }

  if (session) {
    return (
      <div className="auth-box">
        <p className="auth-signed-in">
          Signed in as <strong>{session.email}</strong>
        </p>
        <button type="button" onClick={handleSignOut} disabled={busy}>
          Sign out
        </button>
        <TaskList />
      </div>
    );
  }

  const isSignup = mode === "signup";

  return (
    <div className="auth-box">
      <h2>{isSignup ? "Sign up" : "Log in"}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {isSignup && (
          <p className="auth-muted">At least {MIN_PASSWORD_LENGTH} characters.</p>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>
      </form>
      <p className="auth-switch">
        {isSignup ? "Already have an account? " : "New here? "}
        <button
          type="button"
          className="link-button"
          onClick={() => switchMode(isSignup ? "login" : "signup")}
        >
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
