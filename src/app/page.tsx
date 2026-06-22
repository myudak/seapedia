export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Software Engineering Academy
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none text-[var(--ink)] md:text-7xl">
          SEAPEDIA
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Marketplace foundation for public browsing, role-aware accounts,
          seller operations, buyer checkout, driver delivery, and admin
          monitoring.
        </p>
      </section>
    </main>
  );
}
