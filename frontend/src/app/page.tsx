import Link from "next/link";

const countries = [
  { id: "BR", name: "Bresil" },
  { id: "EC", name: "Equateur" },
  { id: "CO", name: "Colombie" },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="hero rounded-box bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold">FutureKawa - Dashboard Siege</h1>
            <p className="py-4">Suivi unifie des stocks, mesures et alertes par pays.</p>
          </div>
        </div>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {countries.map((country) => (
          <div key={country.id} className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">{country.name}</h2>
              <p>Acceder aux lots et alertes.</p>
              <div className="card-actions justify-end">
                <Link className="btn btn-primary btn-sm" href={`/country/${country.id}`}>
                  Ouvrir
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
      <div className="mt-8">
        <Link className="btn btn-secondary" href="/admin">
          Panel Admin
        </Link>
      </div>
    </main>
  );
}
