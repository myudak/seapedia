import { AppShell } from "@/components/app-shell";
import { AuthPanel } from "@/components/auth-panel";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AppShell>
      <main className="px-4 py-12">
        <AuthPanel mode="login" />
      </main>
    </AppShell>
  );
}
