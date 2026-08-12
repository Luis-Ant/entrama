import { expect, test } from "@playwright/test";

import { PracticePage } from "./practice-page";

test.describe("Practice", () => {
  test(
    "provides an accessible practice shell with usable initial focus",
    { tag: ["@critical", "@e2e", "@practice", "@PRACTICE-E2E-001"] },
    async ({ page }) => {
      const practice = new PracticePage(page);

      await practice.goto();

      await expect(
        page.getByRole("heading", { name: "Type what you see." }),
      ).toBeVisible();
      await expect(practice.practiceRegion).toBeVisible();
      await expect(practice.guidance).toBeVisible();
      await expect(practice.input).toBeFocused();
      await expect(practice.pauseButton).toBeEnabled();
    },
  );

  test(
    "blocks an incorrect character and recovers on the expected character",
    { tag: ["@high", "@e2e", "@practice", "@PRACTICE-E2E-002"] },
    async ({ page }) => {
      const practice = new PracticePage(page);

      await practice.goto();
      await practice.type("x");

      await expect(
        page.getByText("Incorrect. The expected character is h."),
      ).toBeAttached();
      await expect(
        practice.surface("English", "hello").locator("[aria-current=true]"),
      ).toHaveText("h");
      await expect(practice.guidance.getByRole("definition").nth(1)).toHaveText(
        "1",
      );

      await practice.type("h");

      await expect(
        practice.surface("English", "hello").locator("[aria-current=true]"),
      ).toHaveText("e");
      await expect(page.getByText("Correct. Continue typing.")).toBeAttached();
    },
  );

  test(
    "completes English and Spanish before advancing to the next unit",
    { tag: ["@critical", "@e2e", "@practice", "@PRACTICE-E2E-003"] },
    async ({ page }) => {
      const practice = new PracticePage(page);

      await practice.goto();
      await practice.type("hello");

      await expect(practice.surface("Spanish", "hola")).toBeVisible();
      await expect(page.getByText("Spanish", { exact: true })).toBeVisible();

      await practice.type("hola");

      await expect(practice.surface("English", "home")).toBeVisible();
      await expect(page.getByText("English", { exact: true })).toBeVisible();
      await expect(page.getByText("2 / 2")).toBeVisible();
    },
  );

  test(
    "keeps production practice available after an offline reload",
    { tag: ["@critical", "@e2e", "@offline", "@PRACTICE-E2E-004"] },
    async ({ context, page }) => {
      const practice = new PracticePage(page);

      await practice.goto();
      await practice.waitForOfflineReadiness();
      await context.setOffline(true);
      await page.reload({ waitUntil: "domcontentloaded" });

      await expect(practice.practiceRegion).toBeVisible();
      await expect(practice.surface("English", "hello")).toBeVisible();
      await expect(practice.input).toBeFocused();
    },
  );
});
