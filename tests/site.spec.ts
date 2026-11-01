import { expect, test, type Page } from "@playwright/test";

const CHAPTERS = ["home", "about", "projects", "contact"] as const;

const SIZES = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
  { width: 844, height: 390 },
];

const isPhone = (width: number, height: number) => height > width && width < 600;

/** Scrolls to a chapter through the UI: the main nav, or the menu sheet on phones. */
async function openChapter(page: Page, id: (typeof CHAPTERS)[number], phone: boolean) {
  if (phone) {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.locator(`dialog a[href="#${id}"]`).click();
  } else {
    await page.locator(`nav[aria-label="Main"] a[href="#${id}"]`).click();
  }
  await expect(page).toHaveURL(id === "home" ? /\/$/ : new RegExp(`#${id}$`));
  await page.waitForTimeout(1600); // scroll animation + snap
}

/** How far a chapter's visible content reaches past the bottom edge / up into the header. */
function measureFit(page: Page, id: string) {
  return page.evaluate((id) => {
    const header = document.querySelector("[data-header]")!.getBoundingClientRect().height;
    let bottom = 0;
    let top = Infinity;
    document.getElementById(id)!.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (!r.width || style.display === "none" || style.visibility === "hidden" || el.closest(".sr-only")) return;
      if (r.right <= 0 || r.left >= innerWidth) return;
      bottom = Math.max(bottom, r.bottom);
      top = Math.min(top, r.top);
    });
    return { overBottom: Math.round(bottom - innerHeight), intoHeader: Math.round(header - top) };
  }, id);
}

for (const size of SIZES) {
  test.describe(`${size.width}×${size.height}`, () => {
    test.use({ viewport: size, hasTouch: isPhone(size.width, size.height) });

    test("every chapter renders, fits the screen and is reachable from the nav", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

      await page.goto("/");
      await page.waitForTimeout(3200); // load sequence

      for (const id of CHAPTERS) {
        if (id !== "home") await openChapter(page, id, isPhone(size.width, size.height));
        await expect(page.locator(`#${id}`)).toBeVisible();
        const fit = await measureFit(page, id);
        expect(fit.overBottom, `${id} overflows the bottom edge`).toBeLessThanOrEqual(0);
        // Home's name line box may touch the header band by a few px; nothing may sit under it
        expect(fit.intoHeader, `${id} runs under the header`).toBeLessThanOrEqual(id === "home" ? 6 : 0);
        await page.screenshot({ path: `test-results/screens/${size.width}x${size.height}-${id}.png` });
      }

      if (!isPhone(size.width, size.height)) {
        await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText("04 Contact");
      }
      expect(errors).toEqual([]);
    });
  });
}

test.describe("1920×1080 matches the design export", () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test("key measurements", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3200);
    const m = await page.evaluate(() => {
      const box = (selector: string) => {
        const r = document.querySelector(selector)!.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      return {
        nameSize: getComputedStyle(document.querySelector("[data-name]")!).fontSize,
        header: box("[data-header]"),
        arch: box("[data-arch]"),
        cta: box('a[href="#projects"][class*=cta]'),
        spine: box('a[href="#about"][aria-label^="Chapter"]'),
      };
    });
    expect(m.nameSize).toBe("232px");
    expect(m.header.h).toBe(120);
    expect(m.arch).toEqual({ x: 1120, y: 154, w: 640, h: 780 });
    expect(m.cta.h).toBe(76);
    expect(m.spine).toMatchObject({ x: 1832, w: 88 });
  });
});

test.describe("motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the role line types itself out", async ({ page }) => {
    await page.goto("/");
    const typed = page.locator("#home p [class*=typeText]");
    await expect(typed).toHaveText("Graphic Designer &Motion Graphic Designer", { timeout: 8000 });
  });

  test("reduced motion shows everything at once, without loops", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#home p [class*=typeText]")).toHaveText("Graphic Designer &Motion Graphic Designer");
    await expect(page.locator("[data-letter]").first()).toBeVisible();
    const badgeAnimation = await page.evaluate(() => getComputedStyle(document.querySelector("[class*=badgeDisc]")!).animationName);
    expect(badgeAnimation).toBe("none");
    await page.close();
  });

  test("arrow keys and deep links move between chapters", async ({ page }) => {
    await page.goto("/#contact");
    await page.waitForTimeout(1500);
    await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText("04 Contact");

    await page.goto("/");
    await page.waitForTimeout(2500);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1600);
    await expect(page).toHaveURL(/#about$/);
  });
});
