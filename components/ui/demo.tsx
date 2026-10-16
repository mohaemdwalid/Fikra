"use client"
import ContributionSkyline from "@/components/ui/contribution-skyline"
import portfolio from "../shopify-projects.json"
export default function Demo() {
  return <div className="w-full px-4 py-10 sm:px-8"><div className="mx-auto w-full max-w-[980px]"><ContributionSkyline projects={portfolio.projects}/></div></div>
}
