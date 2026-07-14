import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("demo-test", { viewport: { width: 1920, height: 1080 } });

async function clickButton(text: string, timeout = 10000) {
    const btn = page.locator(`button:has-text("${text}")`);
    await btn.waitFor({ state: 'visible', timeout });
    await btn.click();
}

// Start fresh
await page.goto("http://localhost:8003/w/marqetir/inbox/comments");
await waitForPageLoad(page);
await page.waitForTimeout(2000);
console.log("1. Welcome modal loaded");

// Click Start Tour
await clickButton("Start Tour");
await page.waitForTimeout(1000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);
console.log("2. Tour started, URL:", page.url());
await page.screenshot({ path: "tmp/full-01.png" });

// Step 1→2 (same page)
await clickButton("Next");
await page.waitForTimeout(1000);
console.log("3. Step 2");
await page.screenshot({ path: "tmp/full-02.png" });

// Step 2→3 (same page)
await clickButton("Next");
await page.waitForTimeout(1000);
console.log("4. Step 3");

// Step 3→4 (same page)
await clickButton("Next");
await page.waitForTimeout(1000);
console.log("5. Step 4");

// Step 4→5 (cross-page: inbox→channels)
await clickButton("Next");
await page.waitForTimeout(2000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);
console.log("6. Step 5 - URL:", page.url());
await page.screenshot({ path: "tmp/full-05.png" });

// Step 5→6 (same page)
await clickButton("Next");
await page.waitForTimeout(1000);
console.log("7. Step 6");

// Step 6→7 (cross-page: channels→knowledge)
await clickButton("Next");
await page.waitForTimeout(2000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);
console.log("8. Step 7 - URL:", page.url());
await page.screenshot({ path: "tmp/full-07.png" });

// Step 7→8 (same page)
await clickButton("Next");
await page.waitForTimeout(2000);
console.log("9. Step 8");
await page.screenshot({ path: "tmp/full-08.png" });

// Step 8→9 (cross-page: knowledge→addons)
await clickButton("Next");
await page.waitForTimeout(2000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);
console.log("10. Step 9 - URL:", page.url());
await page.screenshot({ path: "tmp/full-09.png" });

// Click Finish
await clickButton("Finish");
await page.waitForTimeout(2000);
console.log("11. Tour complete!");
await page.screenshot({ path: "tmp/full-complete.png" });

// Click Let's Go
await clickButton("Let's Go");
await page.waitForTimeout(2000);
console.log("12. Wizard done! URL:", page.url());
await page.screenshot({ path: "tmp/full-done.png" });

console.log("\n=== ALL 9 STEPS PASSED ===");

await client.disconnect();
