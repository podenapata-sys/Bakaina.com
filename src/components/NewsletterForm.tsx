"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <>
      {subscribed ? (
        <p role="status" className="rounded-control bg-on-primary/10 px-4 py-3 text-sm">
          Thanks for subscribing!
        </p>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubscribed(true);
          }}
        >
          <label htmlFor="newsletter" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter"
            type="email"
            required
            placeholder="Your email"
            className="h-11 min-w-0 flex-1 rounded-control border border-on-primary/25 bg-on-primary/10 px-4 text-sm text-on-primary outline-none placeholder:text-on-primary/70 focus:border-accent"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-control bg-accent px-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Subscribe
          </button>
        </form>
      )}
    </>
  );
}
