"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { type User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { DatabaseBackup, ExternalLink, LayoutDashboard, LogOut, Package, ShoppingBag, Tags } from "lucide-react";
import { isAdmin } from "@/lib/db";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { btnPrimary, card, input, label } from "./ui";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/backup", label: "Backup", icon: DatabaseBackup },
];

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-surface p-4">{children}</div>;
}

function Brand() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.jpg" alt="" width={36} height={36} className="size-9 object-contain" />
      <span className="text-lg font-bold tracking-wide text-primary">BAKAINA Admin</span>
    </span>
  );
}

function SetupNotice() {
  return (
    <Centered>
      <div className={`${card} max-w-lg`}>
        <Brand />
        <h1 className="mt-4 text-xl font-bold text-text">Firebase is not connected yet</h1>
        <p className="mt-2 text-sm text-muted">
          The dashboard needs a Firebase project. Add the <code>NEXT_PUBLIC_FIREBASE_*</code> values from{" "}
          <code>.env.example</code> to Vercel (Settings → Environment Variables) and redeploy. Until then the shop runs on
          sample products. Step-by-step setup is in <code>docs/FIREBASE_SETUP.md</code>.
        </p>
      </div>
    </Centered>
  );
}

function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Centered>
      <form
        className={`${card} flex w-full max-w-sm flex-col gap-4`}
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          try {
            await signInWithEmailAndPassword(auth(), String(form.get("email")), String(form.get("password")));
          } catch {
            setError("Wrong email or password.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Brand />
        <h1 className="text-xl font-bold text-text">Sign in</h1>
        <label className={label}>
          Email
          <input name="email" type="email" required autoComplete="username" className={input} />
        </label>
        <label className={label}>
          Password
          <input name="password" type="password" required autoComplete="current-password" className={input} />
        </label>
        {error && <p role="alert" className="text-sm text-sale">{error}</p>}
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </Centered>
  );
}

type Gate = { state: "loading" } | { state: "signed-out" } | { state: "denied"; user: User } | { state: "admin"; user: User };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [gate, setGate] = useState<Gate>({ state: "loading" });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(auth(), async (user) => {
      if (!user) return setGate({ state: "signed-out" });
      setGate({ state: "loading" });
      const ok = await isAdmin(user.uid).catch(() => false);
      setGate(ok ? { state: "admin", user } : { state: "denied", user });
    });
  }, []);

  if (!isFirebaseConfigured) return <SetupNotice />;
  if (gate.state === "loading") return <Centered><p className="text-muted">Loading…</p></Centered>;
  if (gate.state === "signed-out") return <LoginForm />;
  if (gate.state === "denied") {
    return (
      <Centered>
        <div className={`${card} max-w-sm text-center`}>
          <h1 className="text-lg font-bold text-text">No admin access</h1>
          <p className="mt-2 text-sm text-muted">{gate.user.email} is not an admin of this store.</p>
          <button type="button" onClick={() => signOut(auth())} className={`${btnPrimary} mt-4`}>
            Sign out
          </button>
        </div>
      </Centered>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <aside className="flex flex-col gap-4 border-b border-line bg-bg p-4 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <Brand />
        <nav aria-label="Admin" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {nav.map(({ href, label: text, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-3 rounded-control px-3 text-sm font-semibold transition ${
                  active ? "bg-primary text-on-primary" : "text-text hover:bg-surface hover:text-primary"
                }`}
              >
                <Icon className="size-5" aria-hidden />
                {text}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-wrap items-center gap-1 border-t border-line pt-3 text-sm lg:mt-auto lg:flex-col lg:items-stretch lg:pt-4">
          <Link href="/" target="_blank" className="flex min-h-10 items-center gap-2 rounded-control px-3 text-muted hover:text-primary">
            <ExternalLink className="size-4" aria-hidden /> View store
          </Link>
          <p className="truncate px-3 text-xs text-muted">{gate.user.email}</p>
          <button type="button" onClick={() => signOut(auth())} className="flex min-h-10 items-center gap-2 rounded-control px-3 text-left text-muted hover:text-sale">
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
