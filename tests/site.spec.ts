import { expect, test, type Page } from "@playwright/test";

const NAV = ["home", "about", "experience", "projects", "contact"] as const;

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

const usesMenu = (width: number, height: number) => height > width && width < 768;

/** Scrolls to a chapter through the UI: the main nav, or the menu sheet on narrow portrait screens. */
async function openChapter(page: Page, id: (typeof NAV)[number], menu: boolean) {
  if (menu) {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.locator(`dialog a[href="#${id}"]`).click();
  } else {
    await page.locator(`nav[aria-label="Main"] a[href="#${id}"]`).click();
  }
  await expect(page).toHaveURL(id === "home" ? /\/$/ : new RegExp(`#${id}$`));
  await page.waitForTimeout(1700); // scroll animation + snap
}

/**
 * How far the content on screen reaches past the bottom edge / up under the header.
 * Only leaf-ish content is measured (text, images, controls, cards), not full-height
 * containers, strips or the story line that are meant to span the screen.
 */
function measureFit(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector("[data-header]")!.getBoundingClientRect().height;
    const content = "h1,h2,h3,p,li,a,button,img,[data-card],[data-toolkit],[data-arch],[data-stamp]";
    let bottom = 0;
    let top = Infinity;
    document.querySelectorAll<HTMLElement>(`main :is(${content})`).forEach((el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (!r.width || !r.height || style.display === "none" || style.visibility === "hidden" || el.closest(".sr-only")) return;
      if (r.right <= 1 || r.left >= innerWidth - 1) return; // off screen to the side
      if (r.height >= innerHeight * 0.95) return; // full-height strips (spines, "← Home")
      if (el.closest("[aria-label^='Chapter'], [aria-label^='Previous chapter']")) return;
      bottom = Math.max(bottom, r.bottom);
      top = Math.min(top, r.top);
    });
    return { overBottom: Math.round(bottom - innerHeight), intoHeader: Math.round(header - top) };
  });
}

for (const size of SIZES) {
  test.describe(`${size.width}×${size.height}`, () => {
    test.use({ viewport: size, hasTouch: usesMenu(size.width, size.height) });

    test("every chapter renders, fits the screen and is reachable from the nav", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

      await page.goto("/");
      await page.waitForTimeout(3200); // load sequence

      for (const id of NAV) {
        if (id !== "home") await openChapter(page, id, usesMenu(size.width, size.height));
        const fit = await measureFit(page);
        expect(fit.overBottom, `${id} overflows the bottom edge`).toBeLessThanOrEqual(0);
        // Home's name line box may touch the header band by a few px; nothing may sit under it
        expect(fit.intoHeader, `${id} runs under the header`).toBeLessThanOrEqual(id === "home" ? 6 : 0);
        await page.screenshot({ path: `test-results/screens/${size.width}x${size.height}-${id}.png` });
      }

      if (!usesMenu(size.width, size.height)) {
        await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveAttribute("href", "#contact");
      }
      expect(errors).toEqual([]);
    });

    test("every stop along the About chapter fits the screen", async ({ page }) => {
      await page.goto("/#about");
      await page.waitForTimeout(3000);
      for (let stop = 0; stop < 12; stop++) {
        const fit = await measureFit(page);
        expect(fit.overBottom, `About stop ${stop} overflows the bottom edge`).toBeLessThanOrEqual(0);
        expect(fit.intoHeader, `About stop ${stop} runs under the header`).toBeLessThanOrEqual(0);
        await page.screenshot({ path: `test-results/screens/${size.width}x${size.height}-about-${stop}.png` });
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(1500);
        if (await page.evaluate(() => location.hash === "#projects")) break;
      }
    });
  });
}

test.describe("1920×1080 matches the design exports", () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test("Home key measurements", async ({ page }) => {
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

  test("About key measurements", async ({ page }) => {
    await page.goto("/#about");
    await page.waitForTimeout(3000);
    const m = await page.evaluate(() => {
      const about = document.getElementById("about")!.getBoundingClientRect();
      const at = (selector: string) => {
        const el = document.querySelector<HTMLElement>(selector)!;
        return { x: Math.round(el.offsetLeft) + 0, y: Math.round(el.offsetTop) + 0, w: Math.round(el.offsetWidth) };
      };
      const title = document.getElementById("about-title")!.getBoundingClientRect();
      return {
        aboutLeft: Math.round(about.left),
        titleSize: getComputedStyle(document.getElementById("about-title")!).fontSize,
        title: { x: Math.round(title.left - about.left), y: Math.round(title.top) },
        stamp: at("[data-stamp]"),
        firstCard: at('[data-card="0"]'),
        toolkit: at("[data-toolkit]"),
      };
    });
    expect(Math.abs(m.aboutLeft)).toBe(0);
    expect(m.titleSize).toBe("208px");
    expect(m.title).toEqual({ x: 144, y: 176 });
    expect(m.stamp).toEqual({ x: 790, y: 470, w: 394 });
    expect(m.firstCard).toMatchObject({ x: 1260, w: 360 });
    expect(m.toolkit).toEqual({ x: 3318, y: 140, w: 392 });
  });
});

test.describe("motion and interaction", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the Home role line and the About title type themselves out", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#home p [class*=typeText]")).toHaveText("Graphic Designer &Motion Graphic Designer", { timeout: 8000 });
    await page.goto("/#about");
    await expect(page.locator("#about-title [class*=typeText]")).toHaveText("Frame byframe.", { timeout: 8000 });
  });

  test("hovering a story stamp brings it forward and blurs the rest; its art stays still", async ({ page }) => {
    await page.goto("/#experience");
    await page.waitForTimeout(3000);
    await page.locator('[data-card="1"]').hover();
    await page.waitForTimeout(800);
    await expect(page.locator("#about")).toHaveAttribute("data-focusing", "true");
    await expect(page.locator('[data-card="1"]')).toHaveAttribute("data-focused", "true");
    const frost = await page.evaluate(() => getComputedStyle(document.querySelector("#about [class*=frost]")!).opacity);
    expect(Number(frost)).toBeGreaterThan(0.9);
    const moving = await page.evaluate(
      () => [...document.querySelectorAll('[data-card="1"] svg *')].filter((el) => getComputedStyle(el).animationName !== "none").length,
    );
    expect(moving).toBe(0);
  });

  test("click: the stamp sticks onto an envelope; scrolling opens it; arrows switch; Esc closes", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __sounds: string[] }).__sounds = [];
    });
    await page.goto("/#experience");
    await page.waitForTimeout(3000);
    await page.locator('[data-card="1"] button').click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toHaveAttribute("aria-label", "SC 02: Learning to make things move");
    await page.waitForTimeout(2300);

    // the stamp sits in the envelope's stamp slot
    const landed = await page.evaluate(() => {
      const flyer = document.querySelector("dialog[open] [class*=flyer]")!.getBoundingClientRect();
      const slot = document.querySelector("dialog[open] [class*=slot]")!.getBoundingClientRect();
      return Math.hypot(flyer.x + flyer.width / 2 - (slot.x + slot.width / 2), flyer.y + flyer.height / 2 - (slot.y + slot.height / 2));
    });
    expect(landed).toBeLessThan(12);

    // scrolling opens the envelope until the letter is at reading size
    await page.mouse.move(720, 450);
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(350);
    }
    await page.waitForTimeout(900);
    const letter = await page.evaluate(() => document.querySelector("dialog[open] [class*=letter]")!.getBoundingClientRect().width);
    expect(letter).toBeGreaterThan(600);
    await expect(dialog.locator("h2")).toHaveText("Learning to make things move");

    const sounds = await page.evaluate(() => (window as unknown as { __sounds: string[] }).__sounds);
    for (const sound of ["whoosh", "slide", "thunk", "tape", "turn", "crinkle"]) expect(sounds).toContain(sound);

    await page.keyboard.press("ArrowRight");
    await expect(dialog).toHaveAttribute("aria-label", "SC 03: First studio days");
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0, { timeout: 6000 });
    await expect(page.locator('[data-card="2"]')).toBeVisible();
  });

  test("the postmark never animates, and the portrait stamp opens and closes", async ({ page }) => {
    await page.goto("/#about");
    await page.waitForTimeout(3000);
    await page.locator("[data-stamp]").hover();
    await page.waitForTimeout(600);
    const animated = await page.evaluate(() => {
      const mark = document.querySelector("#about svg[class*=postmark]")!;
      return [mark, ...mark.querySelectorAll("*")].some((el) => {
        const style = getComputedStyle(el);
        return style.animationName !== "none" || (style.transform !== "none" && el !== mark);
      });
    });
    expect(animated).toBe(false);

    await page.locator("[data-stamp]").click();
    await expect(page.locator("dialog[open]")).toHaveAttribute("aria-label", "Harnish Kapoor · since 2017");
    await page.waitForTimeout(1200);
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0, { timeout: 4000 });
  });

  test("the sound toggle mutes and is remembered", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /^Sound (on|off)$/ });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await page.reload();
    await expect(page.getByRole("button", { name: "Sound off" })).toHaveAttribute("aria-pressed", "false");
  });

  test("the badge turns only while hovered, and the ring stays still while the star orbits", async ({ page }) => {
    const badgeAngle = () =>
      page.evaluate(() => {
        const m = new DOMMatrix(getComputedStyle(document.querySelector("[data-badge-disc]")!).transform);
        return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
      });
    const starCentre = () =>
      page.evaluate(() => {
        const r = document.querySelector("[data-orbit-star]")!.getBoundingClientRect();
        return Math.round(r.x + r.width / 2);
      });

    await page.goto("/");
    await page.waitForTimeout(3000);
    expect(await badgeAngle()).toBe(-14);
    const starBefore = await starCentre();
    await page.waitForTimeout(1500);
    expect(await badgeAngle()).toBe(-14);
    expect(await starCentre()).not.toBe(starBefore);
    expect(await page.locator("[data-orbit]").getAttribute("transform")).toBeNull();

    await page.hover("[data-badge]");
    await page.waitForTimeout(800);
    expect(await badgeAngle()).not.toBe(-14);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(1600);
    expect(await badgeAngle()).toBe(-14);
  });

  test("arrow keys and deep links move between chapters", async ({ page }) => {
    await page.goto("/#contact");
    await page.waitForTimeout(1500);
    await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveAttribute("href", "#contact");

    await page.goto("/");
    await page.waitForTimeout(2500);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1600);
    await expect(page).toHaveURL(/#about$/);
  });

  test("reduced motion shows everything at once and opens the letter directly", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#home p [class*=typeText]")).toHaveText("Graphic Designer &Motion Graphic Designer");
    await expect(page.locator("#about-title [class*=typeText]")).toHaveText("Frame byframe.");
    await expect(page.locator("[data-letter]").first()).toBeVisible();
    await page.goto("/#experience");
    await page.waitForTimeout(1500);
    await page.locator('[data-card="0"] button').click();
    await page.waitForTimeout(600);
    const letter = await page.evaluate(() => document.querySelector("dialog[open] [class*=letter]")!.getBoundingClientRect().width);
    expect(letter).toBeGreaterThan(600);
    await page.close();
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("first tap focuses a story stamp, the second opens its envelope", async ({ page }) => {
    await page.goto("/#experience");
    await page.waitForTimeout(3500);
    const card = page.locator('[data-card="0"] button');
    await card.tap();
    await expect(page.locator('[data-card="0"]')).toHaveAttribute("data-focused", "true");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await card.tap();
    await expect(page.locator("dialog[open]")).toHaveAttribute("aria-label", "SC 01: Where it started");
  });
});
