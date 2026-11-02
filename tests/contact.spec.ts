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

test("the form is cut from torn paper, and the tear follows a resize", async ({ page }) => {
  await page.goto("/#contact");
  await page.waitForTimeout(2000);
  const torn = page.locator("#contact form svg[data-torn]");
  await expect(torn).toHaveCount(5); // the sheet, three field strips, the Send tab
  const before = await torn.first().locator("path").first().getAttribute("d");
  expect(before!.split("L").length).toBeGreaterThan(100); // a ragged outline, not a rectangle
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(600);
  const after = await torn.first().locator("path").first().getAttribute("d");
  expect(after).not.toBe(before);
});

test("Send opens the email app with the message ready; an empty form doesn't send", async ({ page }) => {
  await page.goto("/#contact");
  await page.waitForTimeout(2000);
  // record the mailto link instead of opening a real email app
  await page.evaluate(() => {
    const original = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.href.startsWith("mailto:")) (window as unknown as { __opened: string }).__opened = this.href;
      else original.call(this);
    };
  });
  const form = page.locator("#contact form");
  const send = form.getByRole("button", { name: "Send →" });

  await send.click();
  expect(await form.getAttribute("data-mailto")).toBeNull(); // the browser asked for the missing fields

  await form.locator("input[name=name]").fill("Asha Rao");
  await form.locator("input[name=email]").fill("asha@example.com");
  await form.locator("textarea[name=message]").fill("Loved the film — can we talk about a reel? 50% & more");
  await send.click();

  const expected =
    "mailto:harnish.kapoor03@gmail.com?subject=" +
    encodeURIComponent("Hello from your portfolio — Asha Rao") +
    "&body=" +
    encodeURIComponent("Loved the film — can we talk about a reel? 50% & more\n\n— Asha Rao\nasha@example.com");
  await expect(form).toHaveAttribute("data-mailto", expected);
  expect(await page.evaluate(() => (window as unknown as { __opened: string }).__opened)).toBe(expected);
  await expect(form.getByRole("status")).toContainText("Your email app should open");
  // the form keeps what was written
  await expect(form.locator("input[name=name]")).toHaveValue("Asha Rao");
});
