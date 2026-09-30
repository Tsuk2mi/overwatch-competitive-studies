import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4321';
fs.mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}), args: ['--no-sandbox'] });
const routes = ['/', '/lessons/', '/about/', ...fs.readdirSync('content/lessons').filter(f => f.endsWith('.md')).map(f => `/lessons/${f.replace('.md', '')}/`)];
const widths = [{name:'desktop-1440p',width:2560,height:1440},{name:'desktop-large',width:1920,height:1080},{name:'desktop',width:1440,height:900},{name:'ipad',width:820,height:1180},{name:'ipad-landscape',width:1180,height:820},{name:'iphone',width:390,height:844},{name:'small-phone',width:320,height:700}];
const results = { routes: [], viewports: [], interactions: [], accessibility: [], errors: [] };
const context = await browser.newContext();
const page = await context.newPage();
page.on('pageerror', error => results.errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') results.errors.push(message.text()); });
for (const route of routes) {
  await page.setViewportSize({width:1440,height:900});
  const response = await page.goto(base + route);
  assert.equal(response.status(),200,route);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(),1,route+' h1');
  assert.equal(await page.locator('link[rel="canonical"]').count(),1,route+' canonical');
  assert.equal(await page.locator('meta[name="description"]').count(),1,route+' description');
  const text = await page.locator('body').innerText();
  assert(!/南京大学|NANJING|NJU|未经许可|内部赛训资料|【PDF 第|Lorem ipsum/i.test(text),route+' branding');
  assert(!text.includes('**'),route+' unrendered Markdown emphasis');
  if (route.includes('/05-')) { assert.equal(await page.locator('.lesson-body').count(),0); assert(text.includes('待发布')); }
  const anchors = await page.locator('a[href]').evaluateAll(links => links.map(a => a.getAttribute('href')));
  for (const href of anchors) {
    const url = new URL(href,base+route);
    if (url.origin !== new URL(base).origin) continue;
    if (url.hash && url.pathname === new URL(base+route).pathname) {
      assert(await page.evaluate(id=>Boolean(document.getElementById(id)),decodeURIComponent(url.hash.slice(1))),route+' missing anchor '+href);
    } else {
      assert.equal((await context.request.get(url.href.split('#')[0])).status(),200,route+' broken link '+href);
    }
  }
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  assert.equal((await context.request.get(new URL(base).origin + new URL(image).pathname)).status(),200,route+' OG image');
  const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.accessibility.push({route,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,details:v.nodes.map(n=>n.failureSummary)}))});
  results.routes.push({route,status:response.status()});
}
for(const viewport of widths){
  await page.setViewportSize(viewport);
  for(const route of routes){
    await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert(!overflow,`${viewport.name}: horizontal overflow at ${route}`);
  }
  results.viewports.push(viewport);
}
await page.setViewportSize({width:390,height:844});
await page.goto(base+'/lessons/06-positioning-space/');
await page.locator('.toc-mobile summary').click();
assert(await page.locator('.toc-mobile').getAttribute('open')!==null);
await page.locator('.toc-mobile a').filter({hasText:'三、图权'}).first().click();
await page.waitForTimeout(700);
assert((await page.locator('.toc-mobile').getAttribute('open'))===null,'mobile toc closes');
assert(await page.locator('.toc-link.active').count()>0,'active toc');
assert(decodeURIComponent(new URL(page.url()).hash)==='#三图权','TOC targets requested chapter');
assert(await page.locator('[id="三图权"]').evaluate(e=>e.getBoundingClientRect().top<175),'TOC scrolls to requested chapter');
assert((await page.locator('#reading-progress').getAttribute('style')).includes('scaleX('),'progress');
results.interactions.push('Mobile TOC: expand, jump, close; active section; reading progress');
await page.setViewportSize({width:1440,height:900});
await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
await page.goto(base+'/lessons/06-positioning-space/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'test-results/lesson-desktop.png',fullPage:false});
await page.setViewportSize({width:390,height:844});
await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
await page.goto(base+'/lessons/04-teamfight/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'test-results/lesson-mobile.png',fullPage:false});
await page.locator('.table-scroll').scrollIntoViewIfNeeded();
assert(await page.locator('.table-scroll').evaluate(e=>e.scrollWidth>e.clientWidth),'mobile table scroll');
results.interactions.push('Responsive table scroll');
const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
const plain=await noJS.newPage();await plain.goto(base+'/lessons/04-teamfight/');
assert(await plain.locator('.lesson-body').innerText(),'body works without JavaScript');
assert(!(await plain.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'no-JS overflow');
results.interactions.push('No-JavaScript reading and table fallback');
await page.goto(base+'/404.html');
assert((await page.locator('h1').innerText()).includes('尚未找到'),'custom 404 page');
assert.equal(await page.locator('meta[name="robots"][content="noindex"]').count(),1,'404 excluded from index');
results.interactions.push('404 page and noindex');
fs.writeFileSync('test-results/verification.json',JSON.stringify(results,null,2));
await browser.close();
assert.equal(results.errors.length,0,'console/page errors');
assert.equal(results.accessibility.flatMap(r=>r.violations).length,0,'axe violations; see test-results/verification.json');
console.log(JSON.stringify({pages:results.routes.length,viewportSizes:widths.length,axeViolations:0,consoleErrors:0,interactions:results.interactions},null,2));
