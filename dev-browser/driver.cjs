const { chromium } = require('playwright');
const fs = require('fs');
const DIR = "/private/tmp/claude-501/-Users-JanKotnik-Herd-personal-advisor/760a525a-bc79-40d0-ae82-54f022c0445f/scratchpad/chrome-debug";
const CMD = "/tmp/drv_cmd.json";
const RES = "/tmp/drv_res.json";
const LOG = "/tmp/drv.log";
const log = m => fs.appendFileSync(LOG, `[${new Date().toISOString().slice(11,19)}] ${m}\n`);

(async () => {
  const ctx = await chromium.launchPersistentContext(DIR, {
    channel:'chrome', headless:false, viewport:{width:1440,height:900},
    ignoreDefaultArgs:['--enable-automation'],
    args:['--disable-blink-features=AutomationControlled']
  });
  let pg = ctx.pages[0] || await ctx.newPage();
  log("driver ready");
  fs.writeFileSync(RES, JSON.stringify({ok:true, ready:true}));
  let lastId = null;
  while (true) {
    try {
      if (fs.existsSync(CMD)) {
        const cmd = JSON.parse(fs.readFileSync(CMD,'utf8'));
        if (cmd.id !== lastId) {
          lastId = cmd.id;
          let out = {id:cmd.id, ok:true};
          try {
            // always operate on the frontmost/last page
            const pages = ctx.pages(); pg = pages[pages.length-1];
            if (cmd.action==='goto'){ await pg.goto(cmd.url,{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(cmd.wait||2500); }
            else if (cmd.action==='url'){ }
            else if (cmd.action==='clickText'){ await pg.getByText(cmd.text,{exact:!!cmd.exact}).first().click({timeout:cmd.timeout||8000}); await pg.waitForTimeout(cmd.wait||2000); }
            else if (cmd.action==='clickSel'){ await pg.click(cmd.sel,{timeout:cmd.timeout||8000}); await pg.waitForTimeout(cmd.wait||2000); }
            else if (cmd.action==='fill'){ await pg.fill(cmd.sel, cmd.val); }
            else if (cmd.action==='type'){ await pg.locator(cmd.sel).first().fill(cmd.val); }
            else if (cmd.action==='eval'){ out.result = await pg.evaluate(cmd.js); }
            else if (cmd.action==='screenshot'){ await pg.screenshot({path:cmd.path||'/tmp/drv_shot.png', fullPage:!!cmd.full}); out.path=cmd.path||'/tmp/drv_shot.png'; }
            else if (cmd.action==='fields'){ out.result = await pg.evaluate(()=>[...document.querySelectorAll('input,textarea,select,button')].map(e=>({tag:e.tagName,name:e.name||'',id:e.id||'',type:e.type||'',ph:e.placeholder||'',txt:(e.innerText||'').trim().slice(0,25),aria:e.getAttribute('aria-label')||''}))); }
            else if (cmd.action==='quit'){ fs.writeFileSync(RES, JSON.stringify(out)); await ctx.close(); process.exit(0); }
            out.url = pg.url();
          } catch(e){ out.ok=false; out.err=e.message; try{out.url=pg.url();}catch{} }
          fs.writeFileSync(RES, JSON.stringify(out));
          log(cmd.action+" -> "+(out.ok?'ok':'ERR '+out.err));
        }
      }
    } catch(e){ log("loop err "+e.message); }
    await new Promise(r=>setTimeout(r,700));
  }
})().catch(e=>{ log("FATAL "+e.message); process.exit(1); });
