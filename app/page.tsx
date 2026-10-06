export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="container">
      <header className="hero">
        <h1>Logan LeTourneau</h1>
        <p className="tagline">a senior at UH Manoa studying entrepreneurship</p>
      </header>

      <main>
        <section>
          <h2>About</h2>
          <p>
            I&apos;m a senior at the University of Hawaiʻi at Mānoa, where I
            study entrepreneurship. I&apos;m interested in how ideas turn into
            real businesses, and I spend my time learning to test, build and
            refine them.
          </p>
        </section>

        <section>
          <h2>This semester</h2>
          <ul>
            <li>
              Writing a full business plan and investor pitch for my
              entrepreneurship capstone course.
            </li>
            <li>
              Interviewing local small-business owners to test demand for a
              simple online booking tool.
            </li>
            <li>
              Competing with a student team in a campus business plan
              competition.
            </li>
          </ul>
        </section>
      </main>

      <footer>
        <p>© {year} Logan LeTourneau</p>
      </footer>
    </div>
  );
}
