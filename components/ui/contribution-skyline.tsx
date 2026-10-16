"use client"

import * as React from "react"

// Adapted from Contribution Skyline by Kedhareswer Naidu (MIT), supplied in the brief.
// Portfolio mode uses verified project names, rather than a generated activity year.
export type SkylineProject = { name: string }
export interface ContributionSkylineProps {
  projects: SkylineProject[]
  title?: React.ReactNode
  defaultView?: "2d" | "3d"
  palette?: [string, string, string, string]
  duration?: number
  locale?: "en" | "ar"
  className?: string
}
type Point = [number, number]
type Face = { points: Point[]; color: string; index: number; top: boolean }
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n))
const ease = (t: number) => t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2
const rgb = (hex: string, shade = 1) => {
  const n = parseInt(hex.slice(1),16)
  return `rgb(${Math.round((n>>16)*shade)},${Math.round((n>>8&255)*shade)},${Math.round((n&255)*shade)})`
}
const inside = (p: Point[], x: number, y: number) => {
  let sign = 0
  for (let k=0;k<4;k++) {
    const a=p[k], b=p[(k+1)%4], cross=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0])
    if (Math.abs(cross)<1e-8) continue
    const s=Math.sign(cross)
    if (sign && sign!==s) return false
    sign=s
  }
  return sign!==0
}
const BLUE: [string,string,string,string] = ["#b8d5ff", "#79b2ff", "#3786f5", "#005bea"]

export default function ContributionSkyline({ projects, title, defaultView="3d", palette=BLUE, duration=1300, locale="en", className="" }: ContributionSkylineProps) {
  const ar=locale==="ar"
  const [view,setView]=React.useState(defaultView)
  const [active,setActive]=React.useState(-1)
  const [filter,setFilter]=React.useState(-1)
  const [tip,setTip]=React.useState<Point>([0,0])
  const stage=React.useRef<HTMLDivElement>(null)
  const canvas=React.useRef<HTMLCanvasElement>(null)
  const engine=React.useRef<{kick:()=>void;reset:()=>void}|null>(null)
  const cfg=React.useRef({projects,palette,duration,view,filter,active})
  cfg.current={projects,palette,duration,view,filter,active}
  React.useEffect(()=>{
    const el=canvas.current, container=stage.current
    const ctx=el?.getContext("2d")
    if (!el || !container || !ctx) return
    const reduced=matchMedia("(prefers-reduced-motion: reduce)")
    let W=0,H=0,dpr=1,t=0,entered=false,raf=0,last=0,yaw=0,elev=0,yawGoal=0,elevGoal=0
    let faces:Face[]=[], hovered=-1,pinned=-1
    let drag:{id:number;x:number;y:number;yaw:number;elev:number;moved:boolean;mouse:boolean}|null=null
    const setActiveCell=(i:number)=>{
      hovered=i;setActive(i);kick()
    }
    const draw=()=>{
      if (!W) return
      const {projects,palette,filter,active}=cfg.current
      const count=projects.length, cols=Math.max(1,Math.ceil(count/3)), e=ease(t)
      const angle=(Math.PI/4+yaw)*e
      const elevation=Math.PI/2+(Math.PI/5+elev-Math.PI/2)*e
      const cs=Math.cos(angle),sn=Math.sin(angle),se=Math.sin(elevation),ce=Math.cos(elevation)
      const project=(x:number,y:number,z:number):Point=>[x*cs-y*sn,(x*sn+y*cs)*se-z*ce]
      // Heights and colours are compositional, not invented performance metrics.
      const cells=Array.from({length:count},(_,i)=>{
        const x=i%cols,y=Math.floor(i/cols), delay=(x/Math.max(1,cols-1))*.36+y*.03
        const rise=1-Math.pow(1-clamp((t-delay)/.58,0,1),3)
        return {i,x,y,z:(1.5+((i*7)%5)*.55)*rise+(active===i?.15*e:0),level:i%4}
      })
      const points=cells.flatMap(c=>[project(c.x,c.y,0),project(c.x+.8,c.y+.8,c.z),project(c.x+.8,c.y,0),project(c.x,c.y+.8,c.z)])
      const xs=points.map(p=>p[0]),ys=points.map(p=>p[1])
      const minX=Math.min(0,...xs),maxX=Math.max(1,...xs),minY=Math.min(0,...ys),maxY=Math.max(1,...ys)
      const scale=Math.min((W-48)/(maxX-minX),(H-56)/(maxY-minY))
      const ox=(W-(maxX-minX)*scale)/2-minX*scale,oy=(H-(maxY-minY)*scale)/2-minY*scale
      const p=(x:number,y:number,z:number):Point=>{const q=project(x,y,z);return [ox+q[0]*scale,oy+q[1]*scale]}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);faces=[]
      const paint=(points:Point[],color:string,index:number,top=false)=>{
        ctx.beginPath();points.forEach((q,k)=>k?ctx.lineTo(...q):ctx.moveTo(...q));ctx.closePath()
        ctx.fillStyle=color;ctx.fill();ctx.strokeStyle="rgba(255,255,255,.45)";ctx.lineWidth=.65;ctx.stroke()
        if (top && index===active) {ctx.strokeStyle="#003b99";ctx.lineWidth=2;ctx.stroke()}
        faces.push({points,color,index,top})
      }
      cells.sort((a,b)=>(a.x*sn+a.y*cs)-(b.x*sn+b.y*cs))
      for(const c of cells){
        const {x,y,z,i}=c, x1=x+.8,y1=y+.8
        const color=filter>=0&&filter!==c.level?"#dfeaff":palette[c.level]
        if(e>.001){
          paint([p(x,y1,0),p(x1,y1,0),p(x1,y1,z),p(x,y1,z)],rgb(color,.84),i)
          paint([p(x1,y,0),p(x1,y1,0),p(x1,y1,z),p(x1,y,z)],rgb(color,.68),i)
        }
        paint([p(x,y,z),p(x1,y,z),p(x1,y1,z),p(x,y1,z)],color,i,true)
        if(i===active){const q=p(x+.4,y+.4,z);setTip([clamp(q[0],Math.min(110,W/2),Math.max(W-110,W/2)),Math.max(44,q[1]-12)])}
      }
    }
    const tick=(now:number)=>{
      raf=0
      const dt=Math.min(50,Math.max(0,now-last));last=now
      const goal=entered&&cfg.current.view==="3d"?1:0
      if(t!==goal)t=reduced.matches?goal:goal>t?Math.min(goal,t+dt/Math.max(1,cfg.current.duration)):Math.max(goal,t-dt/Math.max(1,cfg.current.duration))
      const k=reduced.matches?1:1-Math.exp(-dt*.012)
      yaw+=(yawGoal-yaw)*k;elev+=(elevGoal-elev)*k
      draw()
      if(Math.abs(t-goal)>.001||Math.abs(yaw-yawGoal)>.001||Math.abs(elev-elevGoal)>.001) raf=requestAnimationFrame(tick)
    }
    function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}}
    const resize=()=>{
      W=container.clientWidth;H=W<560?310:440;dpr=Math.min(2,devicePixelRatio||1)
      container.style.height=H+"px";el.width=Math.round(W*dpr);el.height=Math.round(H*dpr);el.style.width=W+"px";el.style.height=H+"px";kick()
    }
    const hit=(ev:PointerEvent)=>{
      const rect=el.getBoundingClientRect(),x=ev.clientX-rect.left,y=ev.clientY-rect.top
      for(let i=faces.length-1;i>=0;i--) if(inside(faces[i].points,x,y)) return faces[i].index
      return -1
    }
    const down=(ev:PointerEvent)=>{
      if(ev.button!==0)return
      drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,yaw:yawGoal,elev:elevGoal,moved:false,mouse:ev.pointerType==="mouse"}
      if(cfg.current.view==="3d")el.setPointerCapture(ev.pointerId)
    }
    const move=(ev:PointerEvent)=>{
      if(drag&&cfg.current.view==="3d"){
        const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y
        if(drag.moved||Math.hypot(dx,dy)>4){
          drag.moved=true;yawGoal=clamp(drag.yaw+dx*.006,-.5,.5)
          if(drag.mouse)elevGoal=clamp(drag.elev+dy*.004,-.25,.4)
          setActiveCell(-1);kick();return
        }
      }
      if(ev.pointerType==="mouse")setActiveCell(hit(ev))
    }
    const up=(ev:PointerEvent)=>{
      if(!drag||drag.id!==ev.pointerId)return
      const moved=drag.moved;drag=null
      if(el.hasPointerCapture(ev.pointerId))el.releasePointerCapture(ev.pointerId)
      if(!moved){const i=hit(ev);pinned=i===pinned?-1:i;setActiveCell(pinned)}
    }
    const leave=()=>{if(!drag)setActiveCell(pinned)}
    const cancel=()=>{drag=null}
    const reset=()=>{yawGoal=0;elevGoal=0;kick()}
    const key=(ev:KeyboardEvent)=>{
      const cols=Math.max(1,Math.ceil(cfg.current.projects.length/3))
      const deltas:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}
      if(!(ev.key in deltas)&&!["Home","End","Escape"].includes(ev.key))return
      ev.preventDefault()
      let i=pinned>=0?pinned:hovered>=0?hovered:0
      i=ev.key==="Escape"?-1:ev.key==="Home"?0:ev.key==="End"?cfg.current.projects.length-1:clamp(i+(deltas[ev.key]??0),0,cfg.current.projects.length-1)
      pinned=i;setActiveCell(i)
    }
    const blur=()=>{pinned=-1;setActiveCell(-1)}
    const ro=new ResizeObserver(resize);ro.observe(container);resize()
    const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){entered=true;kick();io.disconnect()}},{threshold:.25});io.observe(container)
    el.addEventListener("pointerdown",down);el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);el.addEventListener("pointerleave",leave);el.addEventListener("pointercancel",cancel);el.addEventListener("dblclick",reset);el.addEventListener("keydown",key);el.addEventListener("blur",blur)
    reduced.addEventListener("change",kick);engine.current={kick,reset}
    return ()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();reduced.removeEventListener("change",kick);el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("pointerleave",leave);el.removeEventListener("pointercancel",cancel);el.removeEventListener("dblclick",reset);el.removeEventListener("keydown",key);el.removeEventListener("blur",blur);engine.current=null}
  },[projects])
  React.useEffect(()=>{engine.current?.kick()},[view,filter,active,palette])
  return <section className={"contribution-skyline "+className} dir={ar?"rtl":"ltr"}>
    <header className="flex flex-wrap items-center justify-between gap-4">
      <h3>{title??(ar?"مشاريع فكرة على شوبيفاي":"FIKRA’s Shopify project skyline")}</h3>
      <div className="skyline-toggle" role="group" aria-label={ar?"طريقة العرض":"Chart view"} dir="ltr">
        {(["2d","3d"] as const).map(v=><button key={v} type="button" aria-pressed={view===v} onClick={()=>setView(v)}>{v==="2d"?"2D":"3D"}</button>)}
      </div>
    </header>
    <div ref={stage} className="skyline-stage" dir="ltr">
      <canvas ref={canvas} tabIndex={0} role="img" aria-label={ar?`${projects.length} مشروع شوبيفاي. استخدم الأسهم لاستكشاف المشاريع.`:`${projects.length} Shopify projects. Use arrow keys to explore projects.`} style={{touchAction:"pan-y",cursor:view==="3d"?"grab":"pointer"}} />
      <div className="skyline-tooltip" role="tooltip" aria-hidden={active<0} style={{opacity:active>=0?1:0,left:tip[0],top:tip[1]}}>{projects[active]?.name??" "}</div>
    </div>
    <div className="skyline-caption flex flex-wrap items-center justify-between gap-4">
      <p>{ar?(view==="3d"?"اسحب لتدوير العرض · انقر مرتين لإعادة الضبط":"مرّر على المشروع أو استخدم الأسهم لاستكشافه"):(view==="3d"?"Drag to orbit · double-click to reset":"Hover a project or use arrow keys to explore")}</p>
      <div className="flex items-center gap-2" role="group" aria-label={ar?"ألوان المشاريع":"Project colors"} onMouseLeave={()=>setFilter(-1)}>
        {palette.map((color,i)=><button key={color} type="button" className="skyline-swatch" style={{background:color}} aria-label={ar?`إبراز مجموعة المشاريع ${i+1}`:`Highlight project group ${i+1}`} aria-pressed={filter===i} onMouseEnter={()=>setFilter(i)} onFocus={()=>setFilter(i)} onBlur={()=>setFilter(-1)} onClick={()=>setFilter(filter===i?-1:i)}/>)}
      </div>
    </div>
    <p aria-live="polite" className="sr-only">{projects[active]?.name}</p>
  </section>
}
