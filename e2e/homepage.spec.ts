import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the comparison form", async ({ page }) => {
    await page.goto("/");

    // Check if the page title is correct
    await expect(page).toHaveTitle(/AI Model Comparison/);

    // Check if the form is loaded
    const form = page.getByTestId("comparison-form");
    await expect(form).toBeVisible();

    // Check if textarea and submit button are present
    const textarea = page.locator("textarea");
    const submitButton = page.getByRole("button", { name: /Compare Models/i });

    await expect(textarea).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled(); // Should be disabled when textarea is empty
  });
});
