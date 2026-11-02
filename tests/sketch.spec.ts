import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

/** Draws a short zig-zag with the mouse starting at (x, y). */
async function scribble(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + i * 18, y + (i % 2 ? 22 : -22), { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(150);
}

/** Turns sketch mode on with the pencil button. */
async function sketchMode(page: Page) {
  await page.getByRole("button", { name: "Sketch on the page" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-sketch-mode", "");
}

/** Highest alpha on the sketch canvas around a screen point. */
function inkAt(page: Page, x: number, y: number) {
  return page.evaluate(
    ([x, y]) => {
      const canvas = document.querySelector<HTMLCanvasElement>("[data-sketch-layer]")!;
      const dpr = canvas.width / innerWidth;
      const data = canvas.getContext("2d")!.getImageData((x - 30) * dpr, (y - 30) * dpr, 60 * dpr, 60 * dpr).data;
      let max = 0;
      for (let i = 3; i < data.length; i += 4) max = Math.max(max, data[i]);
      return max;
    },
    [x, y],
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3200);
});

test("the background is collage paper, not dots", async ({ page }) => {
  const backgrounds = await page.evaluate(() =>
    ["[data-track]", "#about"].map((selector) => getComputedStyle(document.querySelector(selector)!).backgroundImage),
  );
  for (const image of backgrounds) {
    expect(image).toContain("paper-grain.png");
    expect(image).not.toContain("radial-gradient");
  }
});

test("the cursor is a pencil, and a text cursor in fields", async ({ page }) => {
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).cursor)).toContain("pencil.svg");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("nav a")!).cursor)).toContain("pencil-link.svg");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("#contact input")!).cursor)).toBe("text");
});

test("outside sketch mode a drag scrolls and nothing is drawn", async ({ page }) => {
  await scribble(page, 230, 780);
  expect(await inkAt(page, 300, 780)).toBe(0);
  await page.mouse.move(800, 450);
  await page.mouse.down();
  await page.mouse.move(400, 450, { steps: 10 });
  await page.mouse.up();
  await expect(page).toHaveURL(/#about$/, { timeout: 4000 });
});

test("sketch mode: the pencil lights up, dragging draws and the page is locked", async ({ page }) => {
  await sketchMode(page);
  const pencil = page.getByRole("button", { name: "Stop sketching" });
  await expect(pencil).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(400); // colour transition
  expect(await pencil.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(42, 39, 51)");

  await scribble(page, 230, 780);
  expect(await inkAt(page, 300, 780)).toBeGreaterThan(60);

  // nothing can move or change the page
  await page.mouse.wheel(0, 900);
  await page.keyboard.press("ArrowRight");
  await page.locator('nav[aria-label="Main"] a[href="#about"]').click();
  await page.locator("a[href='#projects'][class*=cta]").click();
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(page).not.toHaveURL(/#(about|projects)$/);

  // hover effects still play
  await page.locator("a[href='#projects'][class*=cta]").hover();
  await page.waitForTimeout(300);
  expect(await page.locator("a[href='#projects'][class*=cta]").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(220, 211, 242)");

  // Esc leaves sketch mode and the site works again
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveAttribute("data-sketch-mode", "");
  await page.locator('nav[aria-label="Main"] a[href="#about"]').click();
  await expect(page).toHaveURL(/#about$/);
});

test("marks stay on the page they were drawn on", async ({ page }) => {
  await sketchMode(page);
  await scribble(page, 230, 780);
  await page.keyboard.press("Escape");
  await page.locator('nav[aria-label="Main"] a[href="#about"]').click();
  await page.waitForTimeout(1800);
  expect(await inkAt(page, 300, 780)).toBe(0); // Home slid away, and its marks with it
  await page.locator('nav[aria-label="Main"] a[href="#home"]').click();
  await page.waitForTimeout(1800);
  expect(await inkAt(page, 300, 780)).toBeGreaterThan(60);
});

test("undo, clear (with confirm) and a refresh remove marks", async ({ page }) => {
  await sketchMode(page);
  await scribble(page, 230, 780);
  await page.keyboard.press("Control+z");
  await page.waitForTimeout(200);
  expect(await inkAt(page, 300, 780)).toBe(0);

  await scribble(page, 230, 780);
  await page.getByRole("button", { name: "Clear all drawings" }).click();
  await page.getByRole("button", { name: "Keep" }).click();
  expect(await inkAt(page, 300, 780)).toBeGreaterThan(60);
  await page.getByRole("button", { name: "Clear all drawings" }).click();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.waitForTimeout(200);
  expect(await inkAt(page, 300, 780)).toBe(0);

  await scribble(page, 230, 780);
  await page.reload();
  // marks and sketch mode both end with the page view
  await page.waitForTimeout(2500);
  expect(await inkAt(page, 300, 780)).toBe(0);
});

test("save notes and save view download PNGs", async ({ page }) => {
  await sketchMode(page);
  await scribble(page, 230, 780);
  for (const name of ["Save notes as PNG", "Save view as PNG"]) {
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name }).click();
    const file = await (await download).path();
    const bytes = fs.readFileSync(file);
    expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(bytes.length).toBeGreaterThan(10_000);
  }
});

test("downloads hold only the pencil marks and the logo, never the page", async ({ page }) => {
  await sketchMode(page);
  await scribble(page, 230, 780);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save view as PNG" }).click();
  const file = await (await download).path();
  const base64 = fs.readFileSync(file).toString("base64");
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = "data:image/png;base64," + base64;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    const k = image.width / innerWidth;
    // darkest pixel in a box (screen coordinates)
    const darkest = (x: number, y: number, w: number, h: number) => {
      const d = ctx.getImageData(x * k, y * k, w * k, h * k).data;
      let min = 255;
      for (let i = 0; i < d.length; i += 4) min = Math.min(min, (d[i] + d[i + 1] + d[i + 2]) / 3);
      return Math.round(min);
    };
    const name = document.querySelector("[data-name]")!.getBoundingClientRect();
    const logo = document.querySelector("[data-header] a[aria-label^='Harnish Kapoor'] span")!.getBoundingClientRect();
    return {
      headline: darkest(name.left, name.top, name.width, name.height * 0.4), // the big ink name on the page
      marks: darkest(230, 750, 160, 60),
      logo: darkest(logo.left, logo.top, logo.width, logo.height),
    };
  }, base64);
  expect(pixels.headline).toBeGreaterThan(200); // only paper where the name is
  expect(pixels.marks).toBeLessThan(150); // the charcoal is there
  expect(pixels.logo).toBeLessThan(120); // the logo's ink outline is there
});

test("no drawing while a story envelope is open", async ({ page }) => {
  await page.goto("/#experience");
  await page.waitForTimeout(2500);
  await page.locator('[data-card="0"] button').click();
  await page.waitForTimeout(2300);
  await scribble(page, 150, 450);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2500);
  expect(await inkAt(page, 220, 450)).toBe(0);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the pencil button switches sketch mode on and off", async ({ page }) => {
    await page.getByRole("button", { name: "Sketch on the page" }).tap();
    await expect(page.locator("html")).toHaveAttribute("data-sketch-mode", "");
    await expect(page.getByRole("button", { name: "Stop sketching" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Stop sketching" }).tap();
    await expect(page.locator("html")).not.toHaveAttribute("data-sketch-mode", "");
  });
});
