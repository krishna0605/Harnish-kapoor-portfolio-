import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

const SOCIALS = {
  Behance: "https://www.behance.net/Harnish_Kapoor",
  Instagram: "https://www.instagram.com/_harnish.kapoor_/",
  LinkedIn: "https://www.linkedin.com/in/harnish-kapoor-animator/",
};

test("real email, phone and social links", async ({ page }) => {
  await page.goto("/#contact");
  await page.waitForTimeout(2000);
  const contact = page.locator("#contact");
  await expect(contact.locator('[data-contact="email"]')).toHaveAttribute("href", "mailto:harnish.kapoor03@gmail.com");
  await expect(contact.locator('[data-contact="email"]')).toHaveText("harnish.kapoor03@gmail.com");
  await expect(contact.locator('[data-contact="phone"]')).toHaveAttribute("href", "tel:+918160504042");
  await expect(contact.locator('[data-contact="phone"]')).toHaveText("+91 81605 04042");
  for (const [name, href] of Object.entries(SOCIALS)) {
    const link = contact.getByRole("link", { name: `Harnish on ${name} (opens in a new tab)` });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

test("the page HTML never contains the whole email or phone number", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toContain("harnish.kapoor03@gmail.com");
  expect(html).not.toContain("8160504042");
});

test("copy puts the email on the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#contact");
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Copy email address" }).click();
  await expect(page.getByRole("button", { name: "Copy email address" })).toHaveText("Copied ✓");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("harnish.kapoor03@gmail.com");
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the menu sheet lists the social links", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Menu" }).click();
    for (const [name, href] of Object.entries(SOCIALS)) {
      await expect(page.locator("dialog").getByRole("link", { name: `Harnish on ${name} (opens in a new tab)` })).toHaveAttribute("href", href);
    }
  });
});
