"use client"
import * as React from "react"
import { createRoot } from "react-dom/client"
import ContributionSkyline from "@/components/ui/contribution-skyline"
import portfolio from "./shopify-projects.json"

function ProjectSkyline() {
  const totalRef=React.useRef<HTMLDivElement>(null)
  const [count,setCount]=React.useState(100)
  React.useEffect(()=>{
    const el=totalRef.current
    if(!el)return
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame=0
    const finish=()=>{
      cancelAnimationFrame(frame)
      setCount(100)
    }
    const observer=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return
      observer.disconnect()
      if(motion.matches){finish();return}
      const start=performance.now()
      setCount(0)
      const tick=(now:number)=>{
        const progress=Math.min(1,(now-start)/1600)
        setCount(Math.floor(100*(1-Math.pow(1-progress,3))))
        if(progress<1)frame=requestAnimationFrame(tick)
      }
      frame=requestAnimationFrame(tick)
    },{threshold:0.5})
    const onMotionChange=()=>{if(motion.matches){observer.disconnect();finish()}}
    motion.addEventListener("change",onMotionChange)
    observer.observe(el)
    return ()=>{
      observer.disconnect()
      cancelAnimationFrame(frame)
      motion.removeEventListener("change",onMotionChange)
    }
  },[])
  const [locale,setLocale]=React.useState<"en"|"ar">(document.documentElement.lang==="ar"?"ar":"en")
  React.useEffect(()=>{
    const update=()=>setLocale(document.documentElement.lang==="ar"?"ar":"en")
    window.addEventListener("fikra:language",update)
    return ()=>window.removeEventListener("fikra:language",update)
  },[])
  const ar=locale==="ar"
  return <div className="proposal-container" dir={ar?"rtl":"ltr"}>
    <div className="skyline-intro">
      <div><p className="proposal-kicker">{ar?"مشاريع شوبيفاي من فكرة":"BUILT WITH FIKRA"}</p><h2>{ar?"أفكار تتحوّل إلى متاجر.":"Ideas turned into storefronts."}</h2><p>{ar?"كل برج يمثّل مشروعًا من مجموعة مشاريعنا على شوبيفاي.":"Every tower represents a project in our Shopify portfolio."}</p></div>
      <div ref={totalRef} className="skyline-total" role="group" aria-label={`${new Intl.NumberFormat(ar?"ar-QA":"en").format(100)}+ ${ar?"مشروع شوبيفاي":"Shopify projects"}`}><strong dir="ltr" aria-hidden="true">{new Intl.NumberFormat(ar?"ar-QA":"en").format(count)}{count===100?"+":""}</strong><span aria-hidden="true">{ar?"مشروع شوبيفاي":"Shopify projects"}</span></div>
    </div>
    <ContributionSkyline projects={portfolio.projects} locale={locale}/>
  </div>
}
const mount=document.getElementById("fikra-project-skyline")
if(mount)createRoot(mount).render(<ProjectSkyline/>);
