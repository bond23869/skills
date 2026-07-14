import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("demo-test", { viewport: { width: 1920, height: 1080 } });

// We're on step 4, click Next to go to step 5 (channels page)
console.log("Current URL before step 5:", page.url());
const nextBtn = await page.locator('button:has-text("Next")');
await nextBtn.click();
console.log("Clicked Next for step 5 (channels)");

// Wait for cross-page navigation
await page.waitForTimeout(2000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);

console.log("Step 5 URL:", page.url());
await page.screenshot({ path: "tmp/06-step5-channels.png" });

// Click Next for step 6
const nextBtn2 = await page.locator('button:has-text("Next")');
await nextBtn2.click();
console.log("Clicked Next for step 6");
await page.waitForTimeout(1500);
await page.screenshot({ path: "tmp/07-step6.png" });

// Click Next for step 7 (knowledge page)
const nextBtn3 = await page.locator('button:has-text("Next")');
await nextBtn3.click();
console.log("Clicked Next for step 7 (knowledge)");
await page.waitForTimeout(2000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);

console.log("Step 7 URL:", page.url());
await page.screenshot({ path: "tmp/08-step7-knowledge.png" });

// Click Next for step 8
const nextBtn4 = await page.locator('button:has-text("Next")');
await nextBtn4.click();
console.log("Clicked Next for step 8");
await page.waitForTimeout(1500);
await page.screenshot({ path: "tmp/09-step8.png" });

// Click Next for step 9 (addons page)
const nextBtn5 = await page.locator('button:has-text("Next")');
await nextBtn5.click();
console.log("Clicked Next for step 9 (addons)");
await page.waitForTimeout(2000);
await waitForPageLoad(page);
await page.waitForTimeout(3000);

console.log("Step 9 URL:", page.url());
await page.screenshot({ path: "tmp/10-step9-addons.png" });

// Click Finish
const finishBtn = await page.locator('button:has-text("Finish")');
await finishBtn.click();
console.log("Clicked Finish");
await page.waitForTimeout(2000);
await page.screenshot({ path: "tmp/11-complete.png" });

await client.disconnect();
