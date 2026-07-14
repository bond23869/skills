const { chromium } = require('playwright');
const DIR = "/private/tmp/claude-501/-Users-JanKotnik-Herd-personal-advisor/760a525a-bc79-40d0-ae82-54f022c0445f/scratchpad/chrome-debug";
(async () => {
  const ctx = await chromium.launchPersistentContext(DIR, { channel: 'chrome', headless: false, viewport: {width:1440,height:900} });
  const pg = ctx.pages[0] || await ctx.newPage();
  await pg.goto("https://github.com/", { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(2500);
  const gh = await pg.evaluate(() => { const m=document.querySelector('meta[name=user-login]'); return m?m.content:'NO'; });
  await pg.goto("https://myaccount.google.com/", { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(2500);
  const gLogged = !/signin|ServiceLogin/i.test(pg.url());
  console.log("RESULT GITHUB=" + gh + " GOOGLE_LOGGED=" + gLogged + " GURL=" + pg.url().slice(0,45));
  await ctx.close();
})().catch(e => { console.log("ERR " + e.message); process.exit(1); });
