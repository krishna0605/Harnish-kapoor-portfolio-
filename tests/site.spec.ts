import { expect, test } from "@playwright/test";

test("landing page renders", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle(/Harnish Kapoor/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Harnish");
  await expect(page.getByRole("link", { name: "Explore my work" })).toBeVisible();
  expect(errors).toEqual([]);
});
