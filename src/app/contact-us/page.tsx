"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
        <form
          className="mt-10 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
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
          <button
            type="submit"
            className="cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-light)]"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
