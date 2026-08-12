import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "../base-page";

export class PracticePage extends BasePage {
  readonly practiceRegion: Locator;
  readonly input: Locator;
  readonly pauseButton: Locator;
  readonly guidance: Locator;

  constructor(page: Page) {
    super(page);
    this.practiceRegion = page.getByRole("region", {
      name: "Type what you see.",
    });
    this.input = page.getByLabel("Typing practice input");
    this.pauseButton = page.getByRole("button", { name: "Pause practice" });
    this.guidance = page.getByRole("complementary", {
      name: "Practice guidance",
    });
  }

  surface(language: "English" | "Spanish", text: string): Locator {
    return this.page.getByLabel(`${language} text: ${text}`);
  }

  async type(text: string): Promise<void> {
    await this.input.pressSequentially(text);
  }

  async waitForOfflineReadiness(): Promise<void> {
    await expect
      .poll(() =>
        this.page.evaluate(async () => {
          const registrations =
            await navigator.serviceWorker.getRegistrations();

          return registrations.some((registration) => registration.active);
        }),
      )
      .toBe(true);

    if (
      !(await this.page.evaluate(() =>
        Boolean(navigator.serviceWorker.controller),
      ))
    ) {
      await this.page.reload({ waitUntil: "networkidle" });
    }

    await expect
      .poll(() =>
        this.page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      )
      .toBe(true);
  }
}
