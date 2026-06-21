/**
 * Add real handles here to make the footer social icons live.
 * Links with an empty href are hidden automatically.
 */
export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M14.5 3h2.2c.2 1.4 1 2.6 2.2 3.4 1 .6 2.1 1 3.1 1v2.4c-1.5 0-3-.4-4.3-1.2v6.1c0 3.1-2.5 5.6-5.6 5.6S6.5 18.8 6.5 15.7c0-2.9 2.2-5.3 5-5.6v2.4c-1.4.3-2.5 1.6-2.5 3.2 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2V3z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.3-1.4 1.5-1.4h1.4V5.5c-.3 0-1.2-.1-2.2-.1-2.3 0-3.8 1.4-3.8 3.9v2h-2.4V14h2.4v7h3.1z" />
      </svg>
    ),
  },
] satisfies { label: string; href: string; icon: React.ReactNode }[];
