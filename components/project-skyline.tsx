"use client"
import * as React from "react"
import { createRoot } from "react-dom/client"
import ContributionSkyline from "@/components/ui/contribution-skyline"
import portfolio from "./shopify-projects.json"

function ProjectSkyline() {
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
      <div className="skyline-total"><strong>{new Intl.NumberFormat(ar?"ar-QA":"en").format(portfolio.projects.length)}</strong><span>{ar?"مشروع شوبيفاي":"Shopify projects"}</span></div>
    </div>
    <ContributionSkyline projects={portfolio.projects} locale={locale}/>
  </div>
}
const mount=document.getElementById("fikra-project-skyline")
if(mount)createRoot(mount).render(<ProjectSkyline/>);
