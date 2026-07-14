import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("demo-test", { viewport: { width: 1920, height: 1080 } });

// Navigate to inbox
await page.goto("http://localhost:8003/w/marqetir/inbox/comments");
await waitForPageLoad(page);
await page.waitForTimeout(3000);

await page.screenshot({ path: "tmp/01-welcome.png" });
console.log("Step 1: URL =", page.url());

// Check if welcome modal is visible
const welcomeText = await page.evaluate(() => {
    const el = document.querySelector('.fixed');
    return el?.textContent?.substring(0, 200) || 'no fixed element';
});
console.log("Welcome modal text:", welcomeText.substring(0, 100));

await client.disconnect();
