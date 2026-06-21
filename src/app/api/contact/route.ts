import { Resend } from "resend";

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return Response.json(
      { ok: false, error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Spinner Piñata <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error(
      "Contact form submission received but RESEND_API_KEY/CONTACT_TO_EMAIL are not configured:",
      { name, email, message }
    );
    return Response.json(
      { ok: false, error: "Contact form isn't configured yet. Please email us directly." },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    console.error("Failed to send contact form email:", error);
    return Response.json(
      { ok: false, error: "Something went wrong sending your message. Please try again." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
