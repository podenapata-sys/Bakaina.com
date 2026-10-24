"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

/**
 * Footer brand link. One click goes home; three quick clicks open the admin login.
 * A convenience shortcut only — /admin is protected by Firebase Auth, not by this.
 */
export default function FooterLogo() {
  const router = useRouter();
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <Link
      href="/"
      className="flex w-fit items-center gap-2"
      onClick={(e) => {
        e.preventDefault();
        clicks.current += 1;
        if (timer.current) clearTimeout(timer.current);
        if (clicks.current >= 3) {
          clicks.current = 0;
          router.push("/admin");
          return;
        }
        // Wait briefly to see whether more clicks follow before treating it as a normal click.
        timer.current = setTimeout(() => {
          clicks.current = 0;
          router.push("/");
        }, 400);
      }}
    >
      <span className="rounded-control bg-bg p-1">
        <Image src="/logo.jpg" alt="" width={36} height={36} className="size-9 object-contain" />
      </span>
      <span className="text-xl font-bold tracking-wide">BAKAINA</span>
    </Link>
  );
}
