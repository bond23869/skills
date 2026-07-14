import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("demo-test", { viewport: { width: 1920, height: 1080 } });

// Check if the spotlight element exists
const spotlightInfo = await page.evaluate(() => {
    // Look for our custom spotlight div with z-index 9998
    const allDivs = document.querySelectorAll('div[style*="z-index"]');
    const results: string[] = [];
    allDivs.forEach(d => {
        const style = (d as HTMLElement).style;
        if (style.zIndex === '9998' || style.zIndex === '10001') {
            results.push(`z=${style.zIndex} shadow=${style.boxShadow?.substring(0, 80)} pos=${style.position} top=${style.top} left=${style.left} w=${style.width} h=${style.height}`);
        }
    });
    return results;
});
console.log("Spotlight elements:", spotlightInfo);

// Check if [data-tour="inbox-header"] exists
const targetExists = await page.evaluate(() => {
    const el = document.querySelector('[data-tour="inbox-header"]');
    if (!el) return 'NOT FOUND';
    const rect = el.getBoundingClientRect();
    return `Found: ${rect.top},${rect.left} ${rect.width}x${rect.height}`;
});
console.log("Target element:", targetExists);

// Now click Next to go to step 2
const nextBtn = await page.locator('button:has-text("Next")');
await nextBtn.click();
console.log("Clicked Next");
await page.waitForTimeout(1500);

await page.screenshot({ path: "tmp/03-step2.png" });
console.log("Step 2 URL:", page.url());

// Click Next for step 3
const nextBtn2 = await page.locator('button:has-text("Next")');
await nextBtn2.click();
console.log("Clicked Next for step 3");
await page.waitForTimeout(1500);

await page.screenshot({ path: "tmp/04-step3.png" });

// Click Next for step 4
const nextBtn3 = await page.locator('button:has-text("Next")');
await nextBtn3.click();
console.log("Clicked Next for step 4");
await page.waitForTimeout(1500);

await page.screenshot({ path: "tmp/05-step4.png" });

await client.disconnect();
