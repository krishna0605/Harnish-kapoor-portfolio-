"use client";

import { useSyncExternalStore } from "react";
import { CONTACT } from "@/content/site";

export type ContactDetails = { email: string; phone: string; phoneHref: string };

const join = (): ContactDetails => {
  const [user, domain, tld] = CONTACT.emailParts;
  const phone = CONTACT.phoneParts.join(" ");
  return { email: `${user}@${domain}.${tld}`, phone, phoneHref: `tel:${CONTACT.phoneParts.join("")}` };
};

const details = typeof window === "undefined" ? null : join();
const noop = () => () => {};

/**
 * The email and phone, joined only in the browser: the server-rendered HTML has none
 * (returns null there), so scrapers reading the HTML find nothing to harvest.
 */
export function useContactDetails(): ContactDetails | null {
  return useSyncExternalStore(
    noop,
    () => details,
    () => null,
  );
}
