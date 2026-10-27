'use strict';
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const output='visual-qa';fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const viewports=[{width:1600,height:900},{width:1366,height:768},{width:390,height:844}];
const characters=['elesis','lire','arme','lass'];
(async()=>{
 await sleep(1400);
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const report=[];let failed=false;
 try{
 for(const viewport of viewports){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('requestfailed',r=>errors.push('requestfailed '+r.url()+' '+r.failure()?.errorText));
  await page.goto('http://127.0.0.1:8765/iniciar.html',{waitUntil:'domcontentloaded'});
  for(const character of characters){
   const before=errors.length;
   await page.locator('[data-char="'+character+'"]').click();
   try{await page.waitForFunction(name=>window.__GC_VISUAL_QA__?.character===name&&window.__GC_VISUAL_QA__?.loaded===true,character,{timeout:20000})}
   catch(e){errors.push('3D loading timeout: '+character)}
   await page.waitForTimeout(400);
   const data=await page.evaluate(()=>({
    title:document.title,
    selected:document.querySelector('.char-card.selected')?.dataset.char,
    viewerStatus:document.querySelector('#viewerStatus')?.textContent,
    statusHidden:document.querySelector('#viewerStatus')?.hidden,
    canvasCount:document.querySelectorAll('.viewer canvas').length,
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
    verticalOverflow:document.documentElement.scrollHeight>innerHeight,
    viewerRect:(()=>{const r=document.querySelector('#background').getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,top:r.top}})(),
    state:window.__GC_VISUAL_QA__||null,
    screenshotButtonPresent:!!document.querySelector('#capture'),
    viewport:{width:innerWidth,height:innerHeight}
   }));
   const path=output+'/'+viewport.width+'x'+viewport.height+'-'+character+'.png';
   await page.screenshot({path,fullPage:true,animations:'disabled'});
   data.errors=errors.slice(before);data.character=character;data.image=path;
   data.passed=!!data.state?.loaded&&data.state.character===character&&data.canvasCount===1&&!data.horizontalOverflow&&!data.screenshotButtonPresent&&!data.errors.some(x=>/TypeError|ReferenceError|404|timeout/.test(x));
   if(!data.passed)failed=true;
   report.push(data);
   console.log(character,viewport.width+'x'+viewport.height,data.passed?'PASS':'FAIL',JSON.stringify(data.state),data.errors.join(' | '));
  }
  await page.close();
 }
 }finally{fs.writeFileSync(output+'/diagnostics.json',JSON.stringify(report,null,2));await browser.close()}
 if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
