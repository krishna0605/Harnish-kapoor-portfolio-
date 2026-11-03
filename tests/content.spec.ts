import path from "node:path";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { ABOUT, ARCHIVE, CONTACT, HOME } from "../src/content/site";

test.use({ viewport: { width: 1920, height: 1080 } });

test("eight story stamps, one per chapter of the story, headed as in the notes", async ({ page }) => {
  await page.goto("/#experience");
  await page.waitForTimeout(3000);
  expect(ABOUT.scenes).toHaveLength(8);
  for (const [i, scene] of ABOUT.scenes.entries()) {
    await expect(page.locator(`[data-card="${i}"] button`)).toHaveAttribute("aria-label", `Open ${scene.number}: ${scene.title}`);
  }
});

test("the last letter: Accenture, counted / 08, with its grouped highlights rendered", async ({ page }) => {
  await page.goto("/#experience");
  await page.waitForTimeout(3000);
  await page.keyboard.press("ArrowRight"); // the stop with SC 05 – SC 08
  await page.waitForTimeout(1600);
  await page.locator('[data-card="7"] button').click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveAttribute("aria-label", "SC 08: Designing visuals that make ideas click.");
  await page.waitForTimeout(2300);
  await page.mouse.move(960, 540);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(900);
  await expect(dialog).toContainText("SC 08 / 08");
  await expect(dialog).toContainText("Accenture · March 2025 – present");
  // SC 04 has two projects as highlight groups
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(1500); // each envelope slides away before the next comes in
  }
  await expect(dialog).toHaveAttribute("aria-label", "SC 04: Research, imagination and a little storytelling magic.", { timeout: 8000 });
  await expect(dialog.locator("[class*=groupTitle]")).toHaveText([
    "There Is an Insect Inside of Me · Collaborative 2D Visual Film",
    "Aham Brahmasmi · Independent Research-led Mood Film",
  ]);
});

test("the new texts are on the page, and none of the old ones are", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  const text = await page.evaluate(() => document.body.innerText + " " + document.body.textContent);
  for (const expected of [HOME.experience, HOME.tagline, ABOUT.bio, ARCHIVE.intro.text, CONTACT.subtitle]) expect(text).toContain(expected);
  await expect(page.locator("[data-badge] textPath")).toHaveText(HOME.badge);
  for (const stale of ["Frame by", "Selected work", "Open a folder", "Let’s make", "Stories drawn by hand", "7 official", "festival-selected", "Dag Compeau"]) {
    expect(text, stale).not.toContain(stale);
  }
});

test("the portrait images carry no camera or location metadata", async () => {
  for (const file of ["portrait-collage.png", "portrait-stamp.png"]) {
    const meta = await sharp(path.join(process.cwd(), "public", "images", file)).metadata();
    expect(meta.exif, file).toBeUndefined();
    expect(meta.xmp, file).toBeUndefined();
  }
});
