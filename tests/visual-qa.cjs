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
 const report=[];let failed=false;const summary=[];
 try{
 for(const viewport of viewports){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('requestfailed',r=>errors.push('requestfailed '+r.url()+' '+r.failure()?.errorText));
  page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await page.screenshot({path:output+'/'+viewport.width+'x'+viewport.height+'-home.png',fullPage:true});
  const home=await page.evaluate(()=>({horizontalOverflow:document.documentElement.scrollWidth>innerWidth,mainLink:!!document.querySelector('a[href="./iniciar.html"]'),playLink:!!document.querySelector('a[href="./game.html?char=elesis"]')}));
  if(home.horizontalOverflow||!home.mainLink||!home.playLink){failed=true;errors.push('Home: overflow ou links principais ausentes')}
  await page.goto('http://127.0.0.1:8765/iniciar.html',{waitUntil:'networkidle'});
  await page.screenshot({path:output+'/'+viewport.width+'x'+viewport.height+'-initial.png',fullPage:true});
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
    hiddenImportantControls:[...document.querySelectorAll('.back,#resetView,#startGame')].filter(el=>{const r=el.getBoundingClientRect();const css=getComputedStyle(el);return !r.width||!r.height||css.visibility==='hidden'||css.display==='none'}).map(el=>el.id||el.className),
    viewerRect:(()=>{const r=document.querySelector('#background').getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,top:r.top}})(),
    layoutViolations:[...document.querySelectorAll('.stage,.sidebar,.viewer,#startGame,#resetView')].filter(el=>{const r=el.getBoundingClientRect();return r.width<1||r.height<1||r.left< -1||r.right>innerWidth+1}).map(el=>el.id||el.className),
    resetVisible:(()=>{const r=document.querySelector('#resetView').getBoundingClientRect();return r.width>0&&r.height>0})(),
    state:window.__GC_VISUAL_QA__||null,
    screenshotButtonPresent:!!document.querySelector('#capture'),
    viewport:{width:innerWidth,height:innerHeight}
   }));
   const path=output+'/'+viewport.width+'x'+viewport.height+'-'+character+'.png';
   await page.screenshot({path,fullPage:true,animations:'disabled'});
   // Four diagnostic angles reveal sideways or backward-facing OBJ exports.
   if(viewport.width===1600&&data.state?.loaded){
    for(const [label,offset] of [['front',0],['quarter',Math.PI/2],['rear',Math.PI],['other-side',3*Math.PI/2]]){
     await page.evaluate(yaw=>window.__GC_CAPTURE_POSE__?.(yaw),data.state.initialYaw+offset);
     await page.waitForTimeout(150);
     await page.screenshot({path:output+'/orientation-'+character+'-'+label+'.png',fullPage:false,animations:'disabled'});
    }
    await page.evaluate(yaw=>window.__GC_CAPTURE_POSE__?.(yaw),data.state.initialYaw);
    await page.evaluate(yaw=>window.__GC_CAPTURE_POSE__?.(yaw+0.8),data.state.initialYaw);
    await page.locator('#resetView').click();
    const resetYaw=await page.evaluate(()=>window.__GC_CAPTURE_POSE__ ? window.__GC_VISUAL_QA__.initialYaw : null);
    data.resetControlTest=resetYaw!==null;
   }
   data.errors=errors.slice(before);data.character=character;data.image=path;data.home=home;
   data.orientationSweep=viewport.width===1600&&data.state?.loaded?['front','quarter','rear','other-side'].map(label=>output+'/orientation-'+character+'-'+label+'.png'):[];
   data.passed=!!data.state?.loaded&&data.state.character===character&&data.canvasCount===1&&!data.horizontalOverflow&&!data.hiddenImportantControls.length&&!data.layoutViolations.length&&!data.screenshotButtonPresent&&!data.errors.some(x=>/TypeError|ReferenceError|404|timeout/.test(x));
   if(!data.passed)failed=true;
   report.push(data);
   summary.push('|'+viewport.width+'×'+viewport.height+'|'+character+'|'+(data.passed?'PASS':'FAIL')+'|'+data.errors.length+'|'+(data.horizontalOverflow?'Sim':'Não')+'|');
   console.log(character,viewport.width+'x'+viewport.height,data.passed?'PASS':'FAIL',JSON.stringify(data.state),data.errors.join(' | '));
  }
  await page.close();
 }
 }finally{fs.writeFileSync(output+'/diagnostics.json',JSON.stringify(report,null,2));await browser.close()}
 const markdown=['# Grand Chase HUD — Visual QA','','| Resolução | Personagem | Resultado | Erros | Overflow horizontal |','|---|---|---|---:|---|',...summary,'','Os screenshots PNG e o relatório diagnostics.json estão no artefato da execução.'].join('\n');
 fs.writeFileSync(output+'/report.md',markdown);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown+'\n');
 if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
