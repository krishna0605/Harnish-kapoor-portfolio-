import { expect, test, type Page } from "@playwright/test";
import { ARCHIVE } from "../src/content/site";

const open = (page: Page) => page.locator("[data-open-folder]");
const drawer = (page: Page) => page.locator("[data-folder]");

async function openProjects(page: Page) {
  await page.goto("/#projects");
  await page.waitForTimeout(3500); // entrance: folders file in, the open one lands
}

/** Console errors and uncaught exceptions, CSP violations included. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  return errors;
}

test.describe("desk 1920×1080", () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test("matches the design export, without the stamp", async ({ page }) => {
    await openProjects(page);
    const m = await page.evaluate(() => {
      const box = (el: Element | null) => {
        const r = el!.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      const folders = [...document.querySelectorAll("[data-folder]")];
      return {
        title: getComputedStyle(document.getElementById("projects-title")!).fontSize,
        chip: box(document.querySelector("#projects [class*=chip]")),
        open: box(document.querySelector("[data-open-folder]")),
        cover: box(document.querySelector("[data-open-folder] [data-cover]")),
        first: box(folders[0]),
        tallest: box(folders[3]),
        last: box(folders[6]),
        base: box(document.querySelector("[data-drawer-base]")),
      };
    });
    expect(m.title).toBe("96px"); // three lines: "A little / bit of / everything."
    expect(m.chip).toEqual({ x: 144, y: 196, w: 221, h: 44 });
    expect(m.open).toEqual({ x: 630, y: 207, w: 439, h: 759 }); // 420 × 748, turned −1.5°
    expect(m.cover).toEqual({ x: 656, y: 232, w: 374, h: 262 });
    expect(m.first).toEqual({ x: 1100, y: 236, w: 124, h: 724 });
    expect(m.tallest).toEqual({ x: 1388, y: 150, w: 124, h: 810 });
    expect(m.last).toMatchObject({ x: 1676, y: 222, w: 124 });
    expect(m.base).toEqual({ x: 1080, y: 948, w: 742, h: 40 });
    await expect(page.locator("#projects")).not.toContainText(/festival selection/i);
  });

  test("eight files: one open, seven in the drawer, counted from the content", async ({ page }) => {
    await openProjects(page);
    await expect(open(page)).toHaveAttribute("data-open-folder", ARCHIVE.projects[0].id);
    await expect(drawer(page)).toHaveCount(7);
    await expect(page.locator("#projects [class*=chip]")).toHaveText("08 files · 2021 → now");
    await expect(page.locator('[data-filter="all"]')).toHaveText("All · 08");
    await expect(page.locator("#projects [class*=drawerLabel]")).toHaveText("The archive · 02 — 08");
  });

  test("pulling a tab swaps the open file; the old one goes back in order; the URL stays /", async ({ page }) => {
    const errors = watchErrors(page);
    await openProjects(page);
    await page.locator('[data-folder="fold-labs"]').click();
    await page.waitForTimeout(1500);
    await expect(open(page)).toHaveAttribute("data-open-folder", "fold-labs");
    expect(await drawer(page).evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.folder))).toEqual([
      "insect",
      "aham-brahmasmi",
      "era-and-canvas",
      "mvac-handbook",
      "safety-troop-books",
      "pathquest-motion",
      "feature-storyboards",
    ]);
    await expect(page.locator("#projects [class*=drawerLabel]")).toHaveText("The archive · 01, 02, 04 — 08");
    await expect(page.locator("#projects [aria-live]")).toHaveText("Showing 03: Fold Labs");
    expect(new URL(page.url()).hash).toBe("");
    expect(errors).toEqual([]);
  });

  test("hovering a folder lifts it; nothing follows the pointer or stays behind after a scroll", async ({ page }) => {
    await openProjects(page);
    const folder = page.locator('[data-folder="mvac-handbook"]');
    const before = (await folder.boundingBox())!;
    await folder.hover();
    await page.waitForTimeout(700);
    await expect(folder).toHaveAttribute("data-lifted", "");
    expect((await folder.boundingBox())!.y).toBeLessThan(before.y - 15);
    await expect(page.locator("body > [aria-hidden]:has-text('Open')")).toHaveCount(0);
    // scroll on to Contact without moving the pointer: the lift must not stay behind
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(1500);
    await expect(folder).not.toHaveAttribute("data-lifted", "");
  });

  test("filters sink the files that don't match and swap the open one if needed", async ({ page }) => {
    await openProjects(page);
    await page.locator('[data-filter="branding"]').click();
    await page.waitForTimeout(1600);
    await expect(page.locator('[data-filter="branding"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-filter="all"]')).toHaveAttribute("aria-pressed", "false");
    await expect(open(page)).toHaveAttribute("data-open-folder", "fold-labs"); // 01 isn't branding
    expect(await page.locator("[data-folder]:not([disabled])").evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.folder))).toEqual(["era-and-canvas", "pathquest-motion"]);
    await page.locator('[data-filter="all"]').click();
    await page.waitForTimeout(800);
    await expect(page.locator("[data-folder][disabled]")).toHaveCount(0);
  });

  test("the case file opens sideways, steps through its sheets and closes back to the folder", async ({ page }) => {
    const errors = watchErrors(page);
    await openProjects(page);
    await page.locator("[data-open-case]").click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toHaveAttribute("data-case-file", "insect");
    await page.waitForTimeout(2200);
    await expect(dialog.locator("[class*=counter]")).toContainText("01");
    await expect(page.locator("dialog[open] h2")).toHaveText(ARCHIVE.projects[0].title);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    await expect(dialog.locator("[class*=counter]")).toContainText("03");
    await expect(dialog.locator('[data-sheet="2"]')).toHaveAttribute("aria-current", "step");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1600);
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-open-case"))).toBe(true);
    expect(new URL(page.url()).hash).toBe("");
    expect(await page.locator('a[href^="#"]').count()).toBe(0);
    expect(errors).toEqual([]);
  });

  test("Next file closes this case file and opens the next project's", async ({ page }) => {
    await openProjects(page);
    await page.locator("[data-open-case]").click();
    await page.waitForTimeout(2200);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(800);
    }
    await page.locator("[data-next-file]").click();
    await expect(page.locator("dialog[open]")).toHaveAttribute("data-case-file", "aham-brahmasmi", { timeout: 6000 });
    await expect(open(page)).toHaveAttribute("data-open-folder", "aham-brahmasmi");
  });

  test("in sketch mode a folder still lifts on hover but can't be pulled out", async ({ page }) => {
    await openProjects(page);
    await page.getByRole("button", { name: "Sketch on the page" }).click();
    const folder = page.locator('[data-folder="fold-labs"]');
    await folder.hover();
    await page.waitForTimeout(500);
    await expect(folder).toHaveAttribute("data-lifted", "");
    await folder.click();
    await page.waitForTimeout(1200);
    await expect(open(page)).toHaveAttribute("data-open-folder", "insect");
    await page.keyboard.press("Escape");
  });
});

test.describe("wide, short desk 2000×800", () => {
  test.use({ viewport: { width: 2000, height: 800 } });

  test("the drawer widens to fill the screen and the open file sits between it and the intro", async ({ page }) => {
    const errors = watchErrors(page);
    await openProjects(page);
    const m = await page.evaluate(() => {
      // the next chapter's spine on the right edge
      const spine = Math.min(
        innerWidth,
        ...[...document.querySelectorAll('[aria-label^="Chapter"]')].map((s) => s.getBoundingClientRect().left).filter((x) => x > innerWidth / 2),
      );
      const folders = [...document.querySelectorAll("[data-folder]")].map((f) => f.getBoundingClientRect());
      const file = document.querySelector("[data-open-folder]")!.getBoundingClientRect();
      const intro = document.querySelector("#projects-title, #projects h2")!.getBoundingClientRect();
      return {
        gapRight: spine - Math.max(...folders.map((b) => b.right)),
        folderWidth: folders[0].width,
        fileLeft: file.left,
        fileRight: file.right,
        introRight: intro.right,
        drawerLeft: Math.min(...folders.map((b) => b.left)),
        bottom: Math.max(...folders.map((b) => b.bottom)),
      };
    });
    expect(m.gapRight).toBeLessThan(120); // was ~600 empty px before the drawer spread out
    expect(m.folderWidth).toBeGreaterThan(124 * (800 / 1080) * 1.3); // wider than the design's folders
    expect(m.fileLeft).toBeGreaterThan(m.introRight);
    expect(m.fileRight).toBeLessThan(m.drawerLeft);
    expect(m.bottom).toBeLessThanOrEqual(800);

    // a pulled tab still swaps the files
    await drawer(page).nth(1).click();
    await page.waitForTimeout(2200);
    await expect(open(page)).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the first tap lifts a file, the second pulls it out and shows it", async ({ page }) => {
    await openProjects(page);
    const folder = page.locator('[data-folder="fold-labs"]');
    await folder.tap();
    await expect(folder).toHaveAttribute("data-armed", "true");
    await expect(open(page)).toHaveAttribute("data-open-folder", "insect");
    await folder.tap();
    await expect(open(page)).toHaveAttribute("data-open-folder", "fold-labs");
    await page.waitForTimeout(1800);
    // the open file is the next stop: it slides into view
    const box = (await open(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  });
});

test("reduced motion: files swap and the case file opens and closes without animation", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto("/#projects");
  await page.waitForTimeout(1500);
  await page.locator('[data-folder="era-and-canvas"]').click();
  await expect(open(page)).toHaveAttribute("data-open-folder", "era-and-canvas");
  await page.locator("[data-open-case]").click();
  await expect(page.locator("dialog[open]")).toHaveAttribute("data-case-file", "era-and-canvas");
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.close();
});
