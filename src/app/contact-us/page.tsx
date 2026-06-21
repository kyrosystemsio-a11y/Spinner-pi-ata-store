"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      const body = await res.json();

      if (!res.ok || !body.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Contact Us
      </h1>
      <p className="mt-3 text-black/70">
        Custom build questions, bulk orders, or just want to say hi —
        we&apos;d love to hear from you.
      </p>

      {submitted ? (
        <div className="mt-10 rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-[var(--color-midway)]">
            Message received!
          </p>
          <p className="mt-1 text-sm text-black/70">
            We&apos;ll get back to you within 1–2 business days.
          </p>
        </div>
      ) : (
        <form className="mt-10 flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-semibold">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-midway)]"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-midway)]"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-semibold">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-midway)]"
            />
          </div>
          {error ? (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={sending}
            className="cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-light)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
