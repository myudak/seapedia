import { AppShell } from "@/components/app-shell";
import { AuthPanel } from "@/components/auth-panel";

export const metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AppShell>
      <main className="px-4 py-12 sm:px-6 lg:py-16">
        <AuthPanel mode="login" />
      </main>
    </AppShell>
  );
}
