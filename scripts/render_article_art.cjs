// Rasterise the original SVG diagrams in an isolated browser, then encode WebP.
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.ART_PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const destination=path.join(root,'assets/article-images');fs.mkdirSync(destination,{recursive:true});
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'fikra-article-art-'));
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1200,height:675},deviceScaleFactor:1});
  const names=fs.readdirSync(path.join(root,'content/article-art')).filter(n=>n.endsWith('.svg')).sort();
  for(const name of names){
   const svg=fs.readFileSync(path.join(root,'content/article-art',name),'utf8');
   await page.setContent('<style>html,body{margin:0;width:1200px;height:675px;overflow:hidden}svg{display:block}</style>'+svg);
   const image=path.join(temporary,name.replace('.svg','.png'));
   await page.screenshot({path:image});
   execFileSync('python3',['-c','from PIL import Image; import sys; Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2], "WEBP", quality=88, method=6)',image,path.join(destination,name.replace('.svg','.webp'))]);
  }
  console.log('Rendered '+names.length+' article WebP images');
 } finally {await browser.close();fs.rmSync(temporary,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
