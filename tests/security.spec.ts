import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

const HEADERS: Record<string, string | RegExp> = {
  "content-security-policy": /default-src 'self'.*object-src 'none'.*frame-ancestors 'none'/,
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": /camera=\(\), microphone=\(\), geolocation=\(\)/,
  "cross-origin-opener-policy": "same-origin",
};

for (const path of ["/", "/icon.svg", "/sounds/paper-quick.mp3", "/does-not-exist"]) {
  test(`${path} carries the security headers and no X-Powered-By`, async ({ request }) => {
    const headers = (await request.get(path)).headers();
    for (const [name, value] of Object.entries(HEADERS)) {
      if (typeof value === "string") expect(headers[name], name).toBe(value);
      else expect(headers[name], name).toMatch(value);
    }
    expect(headers["x-powered-by"]).toBeUndefined();
  });
}

/** Collects every Content-Security-Policy violation the page reports. */
async function watchViolations(page: Page) {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy/i.test(message.text())) violations.push(message.text());
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(`Content Security Policy: ${event.violatedDirective} blocked ${event.blockedURI}`);
    });
  });
  return violations;
}

test("nothing the site does is blocked by its own policy", async ({ page }) => {
  const violations = await watchViolations(page);
  await page.goto("/");
  await page.waitForTimeout(3200);

  // every chapter
  for (const id of ["about", "experience", "projects", "contact", "home"]) {
    await page.locator(`nav[aria-label="Main"] [data-go="${id}"]`).click();
    await page.waitForTimeout(1400);
  }

  // sketch mode: draw, then leave
  await page.getByRole("button", { name: "Sketch on the page" }).click();
  await page.mouse.move(300, 700);
  await page.mouse.down();
  await page.mouse.move(420, 760, { steps: 8 });
  await page.mouse.up();
  await page.keyboard.press("Escape");

  // a story envelope, with its sounds and art
  await page.locator(`nav[aria-label="Main"] [data-go="experience"]`).click();
  await page.waitForTimeout(1600);
  await page.locator('[data-card="0"] button').click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.waitForTimeout(2400);
  await page.keyboard.press("Escape");

  expect(violations).toEqual([]);
});

test("the site refuses to be framed by another page", async ({ page, baseURL }) => {
  await page.setContent(`<iframe src="${baseURL}/" width="800" height="600"></iframe>`);
  await page.waitForTimeout(1500);
  const frame = page.frames().find((f) => f !== page.mainFrame());
  // a blocked frame never gets the site's content
  expect(await frame?.locator("[data-track]").count().catch(() => 0)).toBeFalsy();
});
