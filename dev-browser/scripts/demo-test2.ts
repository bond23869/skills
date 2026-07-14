import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("demo-test", { viewport: { width: 1920, height: 1080 } });

// Click "Start Tour" button
const startBtn = await page.locator('button:has-text("Start Tour")');
await startBtn.click();
console.log("Clicked Start Tour");

// Wait for navigation to ?demo=1
await page.waitForTimeout(3000);
await waitForPageLoad(page);
await page.waitForTimeout(2000);

const url = page.url();
console.log("After start - URL:", url);
console.log("Has demo param:", url.includes("demo=1"));

await page.screenshot({ path: "tmp/02-after-start.png" });

await client.disconnect();
