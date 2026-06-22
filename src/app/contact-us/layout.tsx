import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Spinner Piñata",
  description: "Get in touch with the Spinner Piñata team about orders, custom builds, or anything else.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
