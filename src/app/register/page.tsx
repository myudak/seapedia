import { AppShell } from "@/components/app-shell";
import { AuthPanel } from "@/components/auth-panel";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <AppShell>
      <main className="px-4 py-12">
        <AuthPanel mode="register" />
      </main>
    </AppShell>
  );
}
