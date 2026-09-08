import { PublicNavbar } from "@/components/aci/PublicNavbar";
import { isAuthenticated } from "@/lib/auth/session";

export default async function Page() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar isAuthenticated={await isAuthenticated()} />
      <main className="mx-auto max-w-[1240px] px-3 py-24 sm:px-5 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-primary mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Destinations Coming Soon
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          Explore curated travel packages and destination guides. We're launching this feature soon!
        </p>
      </main>
    </div>
  );
}
