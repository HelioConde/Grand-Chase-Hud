const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const output = 'visual-qa';
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
  await sleep(1500);
  const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const report=[];
  for(const viewport of [{width:1600,height:900},{width:1366,height:768},{width:390,height:844}]){
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
    await page.goto('http://127.0.0.1:8765/iniciar.html',{waitUntil:'networkidle'});
    for(const char of ['elesis','lire','arme','lass']){
      await page.locator('[data-char="'+char+'"]').click();
      await page.waitForTimeout(1200);
      const data=await page.evaluate(()=>({
        title:document.title,
        selected:document.querySelector('.char-card.selected')?.dataset.char,
        viewerStatus:document.querySelector('#viewerStatus')?.textContent,
        loadingHidden:document.querySelector('#viewerStatus')?.hidden,
        canvasCount:document.querySelectorAll('.viewer canvas').length,
        scrollX:document.documentElement.scrollWidth>innerWidth,
        viewport:{width:innerWidth,height:innerHeight}
      }));
      await page.screenshot({path:output+'/'+viewport.width+'x'+viewport.height+'-'+char+'.png',fullPage:true});
      report.push({...data,character:char,errors:[...errors]});
    }
    await page.close();
  }
  fs.writeFileSync(output+'/diagnostics.json',JSON.stringify(report,null,2));
  await browser.close();
  if(report.some(x=>x.errors.some(e=>e.includes('TypeError')||e.includes('ReferenceError'))))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
