"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";

type AuthPanelProps = {
  mode: "login" | "register";
};

export function AuthPanel({ mode }: AuthPanelProps) {
  const [username, setUsername] = useState(mode === "login" ? "maya" : "");
  const [password, setPassword] = useState("seapedia123");
  const [displayName, setDisplayName] = useState("New Seapedia User");
  const [email, setEmail] = useState("new@seapedia.test");
  const [message, setMessage] = useState("Choose a demo account or register.");

  const isLogin = mode === "login";

  return (
    <Card className="mx-auto grid max-w-xl gap-4 p-6">
      <h1 className="text-3xl font-black">
        {isLogin ? "Login" : "Register"} / {isLogin ? "Masuk" : "Daftar"}
      </h1>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              isLogin
                ? { username, password }
                : {
                    username,
                    password,
                    displayName,
                    email,
                    roles: ["Buyer"],
                  },
            ),
          })
            .then((response) => response.json())
            .then((payload) => {
              if (payload.ok) {
                setMessage(
                  isLogin
                    ? payload.data.needsRoleSelection
                      ? "Login successful. Choose an active role through the API."
                      : `Active role: ${payload.data.activeRole}`
                    : "Registration successful. Login with the new account.",
                );
              } else {
                setMessage(payload.error);
              }
            })
            .catch(() => setMessage("Auth request failed."));
        }}
      >
        {!isLogin ? (
          <>
            <Field label="Display name">
              <TextInput
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </Field>
            <Field label="Email">
              <TextInput value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
          </>
        ) : null}
        <Field label="Username">
          <TextInput
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Button icon={isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}>
          {isLogin ? "Login" : "Register"}
        </Button>
      </form>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </Card>
  );
}
