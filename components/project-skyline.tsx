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
    <ContributionSkyline projects={portfolio.projects} locale={locale}/>
  </div>
}
const mount=document.getElementById("fikra-project-skyline")
if(mount)createRoot(mount).render(<ProjectSkyline/>);
