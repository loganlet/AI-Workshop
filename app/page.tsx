import AuthPanel from "./auth-panel";

export default function Home() {
  return (
    <div className="container">
      <header className="hero">
        <h1>Study task list</h1>
        <p className="tagline">
          Track study tasks across six language skills.
        </p>
      </header>

      <main>
        <AuthPanel />
      </main>
    </div>
  );
}
