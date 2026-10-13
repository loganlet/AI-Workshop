import AuthPanel from "../auth-panel";

export default function AccountPage() {
  return (
    <div className="container">
      <header className="hero">
        <h1>Account</h1>
      </header>

      <main>
        <AuthPanel />
      </main>
    </div>
  );
}
