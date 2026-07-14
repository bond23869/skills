import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("demo-test", { viewport: { width: 1920, height: 1080 } });

// Start from dashboard with correct workspace
await page.goto("http://localhost:8003/w/123/dashboard");
await waitForPageLoad(page);
await page.waitForTimeout(2000);
console.log("1. On dashboard:", page.url());
await page.screenshot({ path: "tmp/dash-01.png" });

// Click Start Tour
const startBtn = await page.locator('button:has-text("Start Tour")');
await startBtn.waitFor({ state: 'visible', timeout: 5000 });
await startBtn.click();
console.log("2. Clicked Start Tour from dashboard");

await page.waitForTimeout(2000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);

const url = page.url();
console.log("3. After start - URL:", url);
console.log("   Has demo=1:", url.includes("demo=1"));
console.log("   On inbox:", url.includes("inbox"));

await page.screenshot({ path: "tmp/dash-02-after-start.png" });

await client.disconnect();
