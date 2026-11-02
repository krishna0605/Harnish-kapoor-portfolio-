/** Longest message body put into the link; longer ones are cut, so the link stays safe to open. */
const MAX_BODY = 1800;

type Message = { to: string; subject: string; name: string; email: string; message: string };

/**
 * A mailto: link that opens the visitor's own email app with the message ready to send:
 * addressed to Harnish, subject with their name, body = their message signed with their
 * name and email. Every part is URL-encoded.
 */
export function buildMailto({ to, subject, name, email, message }: Message) {
  const cleanName = name.trim();
  const body = `${message.trim().slice(0, MAX_BODY)}\n\n— ${cleanName}\n${email.trim()}`;
  const fullSubject = cleanName ? `${subject} — ${cleanName}` : subject;
  return `mailto:${to}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`;
}

/** Opens a mailto: link (marked so sketch mode never blocks it). */
export function openMailto(href: string) {
  const link = document.createElement("a");
  link.href = href;
  link.dataset.sketchAllow = "";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
