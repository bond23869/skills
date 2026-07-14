import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("demo-test", { viewport: { width: 1920, height: 1080 } });

// Check current state
console.log("Current URL:", page.url());
await page.screenshot({ path: "tmp/debug-current.png" });

// Check if tooltip exists
const tooltipExists = await page.evaluate(() => {
    const tooltips = document.querySelectorAll('[class*="wizard-tooltip"]');
    const joyrideTooltips = document.querySelectorAll('[class*="react-joyride"]');
    return {
        wizardTooltips: tooltips.length,
        joyrideTooltips: joyrideTooltips.length,
        bodyText: document.body.innerText.substring(0, 200)
    };
});
console.log("Tooltip state:", tooltipExists);

await client.disconnect();
