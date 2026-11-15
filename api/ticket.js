export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, subject, type, details } = request.body ?? {};

  if (!email || !details) {
    return response.status(400).json({ error: "Email and details are required." });
  }

  const destination = process.env.CONTACT_EMAIL || "mosqueda.christinereisa04@gmail.com";
  const title = `[Commission Ticket: ${type || "Inquiry"}] ${subject || "New Inquiry from " + (name || email)}`;
  const textContent = `
NEW COMMISSION / INQUIRY TICKET

From: ${name || "Anonymous"} (${email})
Inquiry Type: ${type || "General"}
Subject: ${subject || "(No subject)"}

Message / Specifications:
${details}

---
Sent via portfolio status ticket modal.
`;

  // 1. If Resend API Key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Portfolio Ticket <onboarding@resend.dev>",
          to: [destination],
          reply_to: email,
          subject: title,
          text: textContent,
        }),
      });

      if (res.ok) {
        return response.status(200).json({ ok: true, dispatchedDirectly: true });
      }
      console.error("Resend API failed", await res.text());
    } catch (err) {
      console.error("Direct email dispatch failed", err);
    }
  }

  // 2. If Webhook URL is available (e.g. Discord, Slack, Zapier, Formspree)
  if (process.env.TICKET_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.TICKET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📬 **New Commission Ticket** from **${name || "Client"}** (${email})\n**Type**: ${type}\n**Subject**: ${subject}\n\`\`\`\n${details}\n\`\`\``,
        }),
      });
      if (res.ok) {
        return response.status(200).json({ ok: true, dispatchedDirectly: true });
      }
    } catch (err) {
      console.error("Webhook dispatch failed", err);
    }
  }

  // 3. Fallback: tell client that direct SMTP/API is not yet configured, so client-side mailto fallback should be activated
  return response.status(200).json({
    ok: true,
    dispatchedDirectly: false,
    message: "No server-side SMTP/Resend key configured. Launching mailto fallback.",
  });
}
