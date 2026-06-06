import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

/* ═══════════════════════════════════════════════════════════════════
   CONFLICT & MILITARY DATA
═══════════════════════════════════════════════════════════════════ */
const CONFLICTS = [
  {
    id: "ukraine-russia", name: "Russo-Ukrainian War",
    parties: ["Ukraine","Russia"], flags: ["🇺🇦","🇷🇺"],
    roles: ["Defender","Aggressor"], intensity: 5,
    started: "Feb 24, 2022", type: "International Armed Conflict",
    casualties: "~600,000", displaced: "8.3 Million",
    lat: 49.0, lon: 32.0, status: "ACTIVE", statusColor: "#cc2200",
    summary: "Russia's full-scale invasion of Ukraine — the largest conventional war in Europe since 1945. Involves massed artillery, drone swarms, naval blockades, and nuclear sabre-rattling across a 1,000 km front line.",
    windyLat: 50.45, windyLon: 30.52, windyZoom: 6
  },
  {
    id: "israel-hamas", name: "Israel–Hamas War",
    parties: ["Israel","Hamas / Gaza"], flags: ["🇮🇱","🏴"],
    roles: ["Military","Non-State Actor"], intensity: 5,
    started: "Oct 7, 2023", type: "Urban Warfare / Occupation",
    casualties: "~50,000", displaced: "1.9 Million",
    lat: 31.5, lon: 34.5, status: "ACTIVE", statusColor: "#cc2200",
    summary: "Following Hamas's massacre killing ~1,200 Israelis, Israel launched a sustained air and ground campaign. The conflict has expanded to include Hezbollah, Houthis, and direct confrontations with Iran.",
    windyLat: 31.77, windyLon: 35.22, windyZoom: 7
  },
  {
    id: "sudan", name: "Sudan Civil War",
    parties: ["Sudan Armed Forces","RSF"], flags: ["🇸🇩","⚔️"],
    roles: ["Government","Paramilitary"], intensity: 5,
    started: "Apr 15, 2023", type: "Civil War",
    casualties: "~150,000", displaced: "10+ Million",
    lat: 15.5, lon: 32.0, status: "ESCALATING", statusColor: "#e55000",
    summary: "War between the SAF and Rapid Support Forces has triggered one of the world's worst humanitarian catastrophes. Famine declared in Darfur. Mass atrocities and ethnic cleansing documented across multiple regions.",
    windyLat: 15.55, windyLon: 32.53, windyZoom: 5
  },
  {
    id: "myanmar", name: "Myanmar Civil War",
    parties: ["Junta (SAC)","Resistance (PDF/EAOs)"], flags: ["🇲🇲","✊"],
    roles: ["Military Junta","Opposition Forces"], intensity: 4,
    started: "Feb 1, 2021", type: "Civil War",
    casualties: "50,000+", displaced: "3 Million",
    lat: 19.5, lon: 96.0, status: "COLLAPSING", statusColor: "#e55000",
    summary: "Resistance forces control 70%+ of Myanmar's borders. The junta retains major cities but suffers accelerating territorial losses. State collapse considered a serious near-term risk.",
    windyLat: 16.87, windyLon: 96.19, windyZoom: 5
  },
  {
    id: "drc", name: "DRC – M23 War",
    parties: ["DR Congo","M23 / Rwanda"], flags: ["🇨🇩","🇷🇼"],
    roles: ["Government","Rebel Proxy"], intensity: 5,
    started: "Nov 2021", type: "Proxy War",
    casualties: "7,000+ (2022–25)", displaced: "7 Million",
    lat: -1.7, lon: 29.0, status: "ESCALATING", statusColor: "#e55000",
    summary: "M23 rebels backed by Rwanda captured Goma and Bukavu in early 2025. Peace talks stalled. Over 7 million displaced in eastern DRC — the largest displacement crisis in Africa.",
    windyLat: -1.68, windyLon: 29.22, windyZoom: 7
  },
  {
    id: "sahel", name: "Sahel Insurgency",
    parties: ["Alliance of Sahel States","JNIM / ISIS-GS"], flags: ["🌍","⚔️"],
    roles: ["Junta States","Jihadist Forces"], intensity: 4,
    started: "2012", type: "Insurgency",
    casualties: "40,000+", displaced: "6 Million",
    lat: 14.0, lon: -2.0, status: "ONGOING", statusColor: "#c8860a",
    summary: "Mali, Burkina Faso, Niger — all under military rule — expelled French forces and invited Russia's Africa Corps (Wagner). Jihadist groups expand continuously; civilian massacres are routine.",
    windyLat: 12.4, windyLon: -1.5, windyZoom: 5
  },
  {
    id: "somalia", name: "Somalia–Al-Shabaab",
    parties: ["Somalia + AUSSOM","Al-Shabaab"], flags: ["🇸🇴","⚔️"],
    roles: ["Government","Jihadist"], intensity: 3,
    started: "1991", type: "Insurgency",
    casualties: "500,000+ (ongoing)", displaced: "3.7 Million",
    lat: 4.5, lon: 46.0, status: "ONGOING", statusColor: "#c8860a",
    summary: "Al-Shabaab controls large swaths of southern Somalia, raises ~$100M/year in taxes, and continues major urban attacks. The AU mission AUSSOM struggles to fill gaps left by ATMIS withdrawal.",
    windyLat: 2.05, windyLon: 45.34, windyZoom: 5
  },
  {
    id: "yemen", name: "Yemen – Red Sea Crisis",
    parties: ["Houthis / Iran","US-UK / Coalition"], flags: ["⚔️","🇺🇸"],
    roles: ["Insurgents","Multi-national Force"], intensity: 4,
    started: "2014", type: "Civil War / Regional",
    casualties: "300,000+", displaced: "4.5 Million",
    lat: 15.5, lon: 47.5, status: "ACTIVE", statusColor: "#cc2200",
    summary: "Houthis have blockaded Red Sea shipping lanes, forcing global trade rerouting. US/UK conduct hundreds of airstrikes. Houthis armed by Iran with ballistic missiles, drones, and anti-ship weaponry.",
    windyLat: 15.35, windyLon: 44.21, windyZoom: 5
  },
  {
    id: "haiti", name: "Haiti Gang War",
    parties: ["Haiti Police / MSS","Viv Ansanm Gangs"], flags: ["🇭🇹","🔫"],
    roles: ["Government","Criminal Coalition"], intensity: 4,
    started: "2021", type: "Armed Insurgency",
    casualties: "8,000+ (2023–24)", displaced: "600,000",
    lat: 18.9, lon: -72.3, status: "CRITICAL", statusColor: "#e55000",
    summary: "Gang coalition Viv Ansanm controls 85%+ of Port-au-Prince. Kenya-led multinational MSS force is outmatched. No functioning government for years; economy has collapsed.",
    windyLat: 18.54, windyLon: -72.34, windyZoom: 7
  }
];

const MILITARY = {
  "Russia":    { flag:"🇷🇺", rank:2,   budget:"$86.4B",  gdp:"5.9%",  active:"900K–1.1M",   reserve:"2,000,000",    tanks:"3,300+",   aircraft:"1,100+", heli:"500+",  naval:"310",       nukes:"5,889",  notes:"Largest nuclear arsenal. War-footing production since 2022. Significant armor losses in Ukraine but still formidable." },
  "Ukraine":   { flag:"🇺🇦", rank:18,  budget:"$40B+",   gdp:"34%+",  active:"700K–900K",   reserve:"1,000,000+",   tanks:"500–900",  aircraft:"80–100", heli:"50+",   naval:"Minimal",   nukes:"0",      notes:"Surrendered nukes 1994. Highly mobilised. Mastered drone warfare. Receiving F-16s and Western heavy equipment." },
  "Israel":    { flag:"🇮🇱", rank:17,  budget:"$24.5B",  gdp:"5.3%",  active:"169,500",     reserve:"465,000",      tanks:"1,370",    aircraft:"601",    heli:"130",   naval:"65",        nukes:"~90*",   notes:"F-35 stealth jets. Iron Dome + Arrow missile defence. One of the most technologically advanced militaries globally." },
  "Sudan":     { flag:"🇸🇩", rank:83,  budget:"$0.8B",   gdp:"1.5%",  active:"100K+",       reserve:"—",            tanks:"290",      aircraft:"57",     heli:"15",    naval:"Minimal",   nukes:"0",      notes:"SAF vs RSF (~100K fighters). RSF armed with technicals and light weapons. Both sides accused of war crimes in Darfur." },
  "Myanmar":   { flag:"🇲🇲", rank:39,  budget:"$2.1B",   gdp:"4.3%",  active:"150–350K",    reserve:"—",            tanks:"390",      aircraft:"100+",   heli:"80",    naval:"100",       nukes:"0",      notes:"Tatmadaw severely degraded after 3+ years of civil war. Air power remains the junta's primary advantage over resistance forces." },
  "DRC":       { flag:"🇨🇩", rank:109, budget:"$0.6B",   gdp:"0.6%",  active:"135,000",     reserve:"—",            tanks:"75",       aircraft:"22",     heli:"—",     naval:"River",     nukes:"0",      notes:"FARDC poorly equipped. Relies on SADC forces. M23/Rwanda has consistently outmaneuvred DRC in the eastern provinces." },
  "Somalia":   { flag:"🇸🇴", rank:"—", budget:"$0.2B",   gdp:"—",     active:"30,000",      reserve:"—",            tanks:"None",     aircraft:"5–10",   heli:"—",     naval:"Coast",     nukes:"0",      notes:"Relies on African Union AUSSOM. US drone strikes provide air cover. Al-Shabaab fields 5,000–10,000 fighters." },
  "Yemen":     { flag:"⚔️",  rank:"—", budget:"~$1B",    gdp:"—",     active:"200K+ (H)",   reserve:"—",            tanks:"Captured", aircraft:"Drones", heli:"—",     naval:"Anti-ship", nukes:"0",      notes:"Houthis armed by Iran with ballistic missiles and anti-ship weapons. Effective at Red Sea interdiction." },
  "Haiti":     { flag:"🇭🇹", rank:"—", budget:"$0.09B",  gdp:"—",     active:"2,000",       reserve:"—",            tanks:"None",     aircraft:"None",   heli:"—",     naval:"Minimal",   nukes:"0",      notes:"Haitian National Police overwhelmed. Kenya-led MSS deployed. Viv Ansanm gangs have 10,000+ armed members." },
  "USA":       { flag:"🇺🇸", rank:1,   budget:"$858B",   gdp:"3.5%",  active:"1,395,000",   reserve:"845,000",      tanks:"2,500+",   aircraft:"13,300+",heli:"5,700+",naval:"485",       nukes:"5,244",  notes:"World #1 military. Conducting Red Sea operations. Major arms supplier to Israel and Ukraine." }
};

const NAME_MAP = {
  "United States of America":"USA","United States":"USA","Russian Federation":"Russia",
  "Democratic Republic of the Congo":"DRC","Dem. Rep. Congo":"DRC","Congo, Dem. Rep.":"DRC"
};

const CONFLICT_NATIONS = new Set([
  "Ukraine","Russia","Israel","Sudan","Myanmar","Dem. Rep. Congo",
  "Democratic Republic of the Congo","Mali","Burkina Faso","Niger",
  "Somalia","Yemen","Haiti"
]);

const NEWS_LINKS = [
  { name:"AL JAZEERA", url:"https://www.aljazeera.com/live" },
  { name:"BBC NEWS",    url:"https://www.bbc.co.uk/news/av/10462520/watch-bbc-world-news-live" },
  { name:"DW NEWS",     url:"https://www.dw.com/en/live-tv/s-100825" },
  { name:"FRANCE 24",   url:"https://www.france24.com/en/live" },
];

/* ─── Ordered fallback GeoJSON sources ─────────────────────────────
   1. jsdelivr CDN mirror (fastest, high availability)
   2. GitHub raw (original)
   3. PublicaMundi (independent source, same schema)
──────────────────────────────────────────────────────────────────── */
const GEO_SOURCES = [
  "https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson",
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/world.geojson",
];

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap');
  *,*::before,*::after{box-sizing:border-box;}
  html,body{margin:0;padding:0;overflow:hidden;height:100%;background:#090705;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#130e08;}::-webkit-scrollbar-thumb{background:#6a3e00;border-radius:2px;}
  @keyframes gear-cw  { to { transform:rotate(360deg); } }
  @keyframes gear-ccw { to { transform:rotate(-360deg); } }
  @keyframes title-flicker { 0%,100%{opacity:1}91%{opacity:1}92%{opacity:.75}93%{opacity:1}97%{opacity:.88}98%{opacity:1} }
  @keyframes ticker-scroll { 0%{transform:translateX(100vw)}100%{transform:translateX(-100%)} }
  @keyframes panel-right { from{transform:translateX(108%);opacity:0}to{transform:translateX(0);opacity:1} }
  @keyframes panel-up    { from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1} }
  @keyframes modal-in    { from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)} }
  @keyframes steam       { 0%{transform:translateY(0) scale(1);opacity:.45}100%{transform:translateY(-28px) scale(2);opacity:0} }
  @keyframes diag-in     { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
  @keyframes diag-scan   { 0%,100%{transform:translateX(-200%);opacity:0} 50%{transform:translateX(120%);opacity:.65} }
  @keyframes ping-flash  { 0%{opacity:1} 60%{opacity:.3} 100%{opacity:1} }
  .gear-cw  { animation:gear-cw  28s linear infinite; transform-origin:center; display:inline-block; }
  .gear-ccw { animation:gear-ccw 20s linear infinite; transform-origin:center; display:inline-block; }
  .title-fx { animation:title-flicker 12s infinite; }
  .ticker   { animation:ticker-scroll 50s linear infinite; white-space:nowrap; }
  .slide-right { animation:panel-right .45s cubic-bezier(.16,1,.3,1); }
  .slide-up    { animation:panel-up   .4s  cubic-bezier(.16,1,.3,1); }
  .modal-show  { animation:modal-in .35s ease; }
  .diag-show   { animation:diag-in .3s cubic-bezier(.16,1,.3,1); }
  .country-path { cursor:pointer; transition:fill .2s,filter .2s; }
  .country-path:hover { filter:brightness(1.7); }
  .btn-brass {
    background:linear-gradient(135deg,#7a4a00,#c8860a,#7a4a00);
    color:#ffeaa0; border:1px solid #e8c560;
    font-family:'Cinzel',serif; font-size:10px; letter-spacing:.12em;
    cursor:pointer; transition:all .2s; padding:5px 12px;
    text-decoration:none; display:inline-block;
  }
  .btn-brass:hover { background:linear-gradient(135deg,#c8860a,#e8c560,#c8860a); color:#3a1a00; }
  .btn-brass:disabled { opacity:.45; cursor:wait; }
  .steam-particle { animation:steam 1.8s ease-out infinite; }
  .scroll-y { overflow-y:auto; }
  .ping-live { animation:ping-flash .6s ease-in-out; }
`;

/* ═══════════════════════════════════════════════════════════════════
   TINY COMPONENTS
═══════════════════════════════════════════════════════════════════ */
const Gear = ({ size=48, reverse=false, opacity=0.55 }) => (
  <span className={reverse?"gear-ccw":"gear-cw"} style={{fontSize:size,lineHeight:1,color:`rgba(100,55,0,${opacity})`,userSelect:"none"}}>⚙</span>
);

const Divider = ({ label }) => (
  <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0 8px"}}>
    <div style={{flex:1,height:1,background:"linear-gradient(to right,transparent,#5a3000)"}}/>
    <span style={{fontFamily:"Cinzel",fontSize:9,letterSpacing:".18em",color:"#7a4a00",whiteSpace:"nowrap"}}>{label}</span>
    <div style={{flex:1,height:1,background:"linear-gradient(to left,transparent,#5a3000)"}}/>
  </div>
);

const IntensityMeter = ({ level }) => (
  <div style={{display:"flex",gap:3,alignItems:"center"}}>
    {[1,2,3,4,5].map(i=>(
      <div key={i} style={{width:7,height:14,background:i<=level
        ? ["","#448822","#887700","#c8860a","#e55000","#cc2200"][level]
        : "#1e1408", border:"1px solid #2e1e08",borderRadius:2}}/>
    ))}
    <span style={{fontFamily:"Cinzel",fontSize:9,color:"#7a4a00",letterSpacing:".1em",marginLeft:4}}>
      {["","LOW","MINOR","MODERATE","HIGH","EXTREME"][level]}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   PULSE MARKER
═══════════════════════════════════════════════════════════════════ */
const PulseMarker = ({ cx, cy, conflict, onHover, onClick, isSelected }) => {
  const colors = ["","#448822","#887700","#c8860a","#e55000","#cc2200"];
  const c = colors[conflict.intensity];
  const r = isSelected ? 7 : 5;
  return (
    <g style={{cursor:"pointer"}} onClick={onClick}
       onMouseEnter={e=>onHover({text:conflict.name,x:e.clientX,y:e.clientY})}
       onMouseLeave={()=>onHover(null)}>
      <circle cx={cx} cy={cy} r={r} fill={c} opacity={.85}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={1}>
        <animate attributeName="r" values={`${r};${r+18};${r}`} dur="2.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".75;0;.75" dur="2.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={.5}>
        <animate attributeName="r" values={`${r};${r+11};${r}`} dur="2.8s" begin=".9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".5;0;.5" dur="2.8s" begin=".9s" repeatCount="indefinite"/>
      </circle>
      {isSelected && <circle cx={cx} cy={cy} r={r+2} fill="none" stroke={c} strokeWidth={1.5} opacity={.6}/>}
    </g>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MILITARY COMPARISON WIDGET
═══════════════════════════════════════════════════════════════════ */
const MilRow = ({ label, left, right }) => (
  <div style={{display:"grid",gridTemplateColumns:"1fr 18px 1fr",gap:4,marginBottom:5,alignItems:"center"}}>
    <div style={{fontFamily:"Cinzel",fontSize:9,color:"#b87333",textAlign:"right",letterSpacing:".05em"}}>{left||"—"}</div>
    <div style={{fontFamily:"Cinzel",fontSize:8,color:"#5a3000",textAlign:"center",letterSpacing:".05em"}}>{label}</div>
    <div style={{fontFamily:"Cinzel",fontSize:9,color:"#b87333",textAlign:"left",letterSpacing:".05em"}}>{right||"—"}</div>
  </div>
);

const MilPanel = ({ parties }) => {
  const [l, r] = parties;
  const ml = MILITARY[l] || MILITARY[l.split("/")[0].trim()];
  const mr = MILITARY[r] || MILITARY[r.split("/")[0].trim()];
  if (!ml && !mr) return null;
  return (
    <div>
      <Divider label="MILITARY INTELLIGENCE"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        {[ml,mr].map((m,i)=>m&&(
          <div key={i} style={{background:"rgba(15,10,5,.6)",border:"1px solid #2e1e08",padding:"8px 10px",borderRadius:2}}>
            <div style={{fontFamily:"Cinzel",fontSize:11,color:"#c8860a",letterSpacing:".1em",marginBottom:2}}>
              {m.flag} {parties[i].split("/")[0].trim().toUpperCase()}
            </div>
            <div style={{fontFamily:"Cinzel",fontSize:9,color:"#5a3000",letterSpacing:".05em"}}>RANK #{m.rank}</div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(10,7,3,.5)",border:"1px solid #2a1a08",padding:"8px 10px",borderRadius:2}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:2,marginBottom:6}}>
          <div style={{fontFamily:"Cinzel",fontSize:9,color:"#6a3e00",textAlign:"right",letterSpacing:".08em"}}>LEFT</div>
          <div/>
          <div style={{fontFamily:"Cinzel",fontSize:9,color:"#6a3e00",textAlign:"left",letterSpacing:".08em"}}>RIGHT</div>
        </div>
        {[
          ["BUDGET",ml?.budget,mr?.budget],["% GDP",ml?.gdp,mr?.gdp],
          ["ACTIVE",ml?.active,mr?.active],["RESERVE",ml?.reserve,mr?.reserve],
          ["TANKS",ml?.tanks,mr?.tanks],["AIRCRAFT",ml?.aircraft,mr?.aircraft],
          ["NAVAL",ml?.naval,mr?.naval],["NUKES",ml?.nukes,mr?.nukes],
        ].map(([lbl,lv,rv])=>(
          <MilRow key={lbl} label={lbl} left={lv} right={rv}/>
        ))}
      </div>
      {[ml,mr].filter(Boolean).map((m,i)=>m.notes&&(
        <div key={i} style={{marginTop:8,padding:"6px 10px",background:"rgba(10,6,3,.4)",border:"1px solid #2a1a08",borderRadius:2}}>
          <div style={{fontFamily:"Cinzel",fontSize:8,color:"#6a3e00",letterSpacing:".1em",marginBottom:3}}>
            {m.flag} {parties[i].split("/")[0].trim().toUpperCase()} · FIELD NOTE
          </div>
          <div style={{fontFamily:"IM Fell English,serif",fontSize:11,color:"#8a6a4a",lineHeight:1.5}}>{m.notes}</div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   LIVE FEED MODAL
═══════════════════════════════════════════════════════════════════ */
const LiveFeedModal = ({ conflict, onClose }) => {
  const [tab, setTab] = useState("map");
  const windyUrl = conflict
    ? `https://embed.windy.com/embed2.html?lat=${conflict.windyLat}&lon=${conflict.windyLon}&zoom=${conflict.windyZoom}&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`
    : "";
  const webcamUrl = conflict
    ? `https://www.windy.com/webcams/map?zoom=8&lat=${conflict.windyLat}&lon=${conflict.windyLon}`
    : "";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(5,3,1,.88)",backdropFilter:"blur(5px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="modal-show" style={{width:"min(720px,96vw)",maxHeight:"92vh",background:"#0a0705",border:"2px solid #5a3000",boxShadow:"0 0 60px rgba(90,45,0,.5)",display:"flex",flexDirection:"column",borderRadius:2,overflow:"hidden"}}>
        <div style={{padding:"10px 16px",borderBottom:"1px solid #2a1808",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"Cinzel Decorative",fontSize:12,color:"#c8860a",letterSpacing:".18em"}}>LIVE INTELLIGENCE FEED</div>
            {conflict&&<div style={{fontFamily:"Cinzel",fontSize:9,color:"#5a3000",letterSpacing:".12em",marginTop:2}}>{conflict.name.toUpperCase()}</div>}
          </div>
          <button className="btn-brass" onClick={onClose} style={{padding:"4px 10px",fontSize:11}}>✕ CLOSE</button>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid #1e1208",flexShrink:0}}>
          {[["map","WEATHER MAP"],["webcam","WEBCAMS"],["news","NEWS FEEDS"]].map(([t,lbl])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:"8px 4px",border:"none",cursor:"pointer",
              background:tab===t?"rgba(90,45,0,.3)":"transparent",
              borderBottom:tab===t?"2px solid #c8860a":"2px solid transparent",
              fontFamily:"Cinzel",fontSize:9,letterSpacing:".12em",
              color:tab===t?"#c8860a":"#5a3000",transition:"all .2s"
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{flex:1,overflow:"auto",minHeight:0}}>
          {tab==="map"&&(
            <div>
              <iframe src={windyUrl} width="100%" height="420" frameBorder="0" title="Windy Map" style={{display:"block"}}/>
              <div style={{padding:"10px 16px",background:"rgba(10,7,3,.6)"}}>
                <p style={{fontFamily:"IM Fell English,serif",fontSize:11,color:"#6a4a2a",margin:0,lineHeight:1.5}}>
                  Live weather satellite overlay for <span style={{color:"#c8860a"}}>{conflict?.name}</span> region.
                  Drag to explore · Scroll to zoom · Toggle layers in Windy controls.
                </p>
              </div>
            </div>
          )}
          {tab==="webcam"&&(
            <div style={{padding:20,textAlign:"center"}}>
              <div style={{fontFamily:"IM Fell English,serif",fontSize:14,color:"#a08060",marginBottom:16,lineHeight:1.7}}>
                Open live webcams near the conflict zone in Windy's global camera network.
                Coverage varies by region — urban centres have the best availability.
              </div>
              <a href={webcamUrl} target="_blank" rel="noreferrer" className="btn-brass" style={{padding:"10px 24px",fontSize:12,letterSpacing:".15em"}}>
                ⦿ OPEN LIVE WEBCAMS ↗
              </a>
              <div style={{marginTop:20,padding:"12px 16px",background:"rgba(10,7,3,.6)",border:"1px solid #2a1808",borderRadius:2}}>
                <div style={{fontFamily:"Cinzel",fontSize:9,color:"#5a3000",letterSpacing:".12em",marginBottom:6}}>COORDINATES</div>
                <div style={{fontFamily:"Cinzel",fontSize:11,color:"#c8860a"}}>
                  {conflict?.windyLat?.toFixed(2)}°N · {conflict?.windyLon?.toFixed(2)}°E
                </div>
              </div>
            </div>
          )}
          {tab==="news"&&(
            <div style={{padding:20}}>
              <div style={{fontFamily:"IM Fell English,serif",fontSize:13,color:"#8a6a4a",marginBottom:16,lineHeight:1.6}}>
                Open live news coverage for <span style={{color:"#c8860a"}}>{conflict?.name}</span> in a new window:
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {NEWS_LINKS.map(l=>(
                  <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="btn-brass"
                    style={{padding:"10px 16px",fontSize:11,letterSpacing:".12em",textAlign:"center"}}>
                    ⦿ {l.name} — LIVE STREAM ↗
                  </a>
                ))}
              </div>
              <div style={{marginTop:16,fontFamily:"IM Fell English,serif",fontSize:10,color:"#4a3020",lineHeight:1.5,fontStyle:"italic"}}>
                External links open in a new tab. Coverage may vary by news cycle and region.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CONFLICT / COUNTRY INFO PANEL
═══════════════════════════════════════════════════════════════════ */
const InfoPanel = ({ conflict, country, isMobile, onClose, onLiveFeed }) => {
  const panelStyle = {
    position:"fixed", zIndex:500, background:"#0b0806",
    border:"1px solid #3a2010", overflowY:"auto",
    boxShadow: isMobile ? "0 -10px 40px rgba(90,45,0,.4)" : "-10px 0 40px rgba(90,45,0,.3)",
    ...(isMobile
      ? {bottom:40,left:0,right:0,height:"68vh",borderRadius:"6px 6px 0 0",padding:"16px 16px 20px"}
      : {top:60,right:0,width:370,bottom:40,padding:"16px 14px 20px"})
  };

  if (conflict) return (
    <div className={isMobile?"slide-up":"slide-right"} style={panelStyle}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Cinzel Decorative",fontSize:13,color:"#c8860a",lineHeight:1.3,letterSpacing:".05em"}}>{conflict.name.toUpperCase()}</div>
          <div style={{fontFamily:"Cinzel",fontSize:9,color:"#5a3000",letterSpacing:".15em",marginTop:3}}>{conflict.type}</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"1px solid #3a2010",color:"#6a3e00",cursor:"pointer",padding:"3px 8px",fontFamily:"Cinzel",fontSize:11,marginLeft:8,flexShrink:0}}>✕</button>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <span style={{background:conflict.statusColor,color:"#fff",fontFamily:"Cinzel",fontSize:9,padding:"3px 10px",letterSpacing:".15em",borderRadius:1}}>{conflict.status}</span>
        <IntensityMeter level={conflict.intensity}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,marginBottom:12,alignItems:"center"}}>
        {conflict.parties.map((p,i)=>(
          <div key={i} style={{background:"rgba(15,10,4,.7)",border:"1px solid #2a1808",padding:"6px 8px",textAlign:i===0?"right":"left",borderRadius:2}}>
            <div style={{fontSize:18,lineHeight:1}}>{conflict.flags[i]}</div>
            <div style={{fontFamily:"Cinzel",fontSize:9,color:"#c8860a",letterSpacing:".06em",marginTop:2}}>{p}</div>
            <div style={{fontFamily:"Cinzel",fontSize:8,color:"#4a3020",letterSpacing:".06em",marginTop:1}}>{conflict.roles[i]}</div>
          </div>
        ))}
        <div style={{textAlign:"center",fontFamily:"Cinzel",fontSize:14,color:"#5a3000"}}>⚔</div>
      </div>
      <Divider label="SITUATION REPORT"/>
      <p style={{fontFamily:"IM Fell English,serif",fontSize:12,color:"#9a7a5a",lineHeight:1.65,marginBottom:12}}>{conflict.summary}</p>
      <Divider label="CASUALTY ASSESSMENT"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[["⚰ CASUALTIES",conflict.casualties],["→ DISPLACED",conflict.displaced]].map(([lbl,val])=>(
          <div key={lbl} style={{background:"rgba(10,6,3,.6)",border:"1px solid #2a1808",padding:"8px 10px",borderRadius:2}}>
            <div style={{fontFamily:"Cinzel",fontSize:8,color:"#5a3000",letterSpacing:".1em",marginBottom:3}}>{lbl}</div>
            <div style={{fontFamily:"Cinzel",fontSize:12,color:"#cc2200",letterSpacing:".05em"}}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[["⚑ STARTED",conflict.started],["⊙ TYPE",conflict.type]].map(([lbl,val])=>(
          <div key={lbl} style={{background:"rgba(10,6,3,.6)",border:"1px solid #2a1808",padding:"8px 10px",borderRadius:2}}>
            <div style={{fontFamily:"Cinzel",fontSize:8,color:"#5a3000",letterSpacing:".1em",marginBottom:3}}>{lbl}</div>
            <div style={{fontFamily:"Cinzel",fontSize:10,color:"#b87333"}}>{val}</div>
          </div>
        ))}
      </div>
      <MilPanel parties={conflict.parties}/>
      <div style={{marginTop:14}}>
        <button className="btn-brass" onClick={onLiveFeed} style={{width:"100%",padding:"10px",fontSize:11,letterSpacing:".15em"}}>
          ⦿ LIVE INTELLIGENCE FEED
        </button>
      </div>
    </div>
  );

  if (country) {
    const m = country.military;
    return (
      <div className={isMobile?"slide-up":"slide-right"} style={panelStyle}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:28,lineHeight:1}}>{m?.flag||"🏳️"}</div>
            <div style={{fontFamily:"Cinzel Decorative",fontSize:14,color:"#c8860a",marginTop:4,letterSpacing:".05em"}}>{country.name}</div>
            {m?.rank&&<div style={{fontFamily:"Cinzel",fontSize:9,color:"#5a3000",letterSpacing:".12em",marginTop:2}}>GLOBAL MILITARY RANK #{m.rank}</div>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #3a2010",color:"#6a3e00",cursor:"pointer",padding:"3px 8px",fontFamily:"Cinzel",fontSize:11}}>✕</button>
        </div>
        {m ? (
          <>
            <Divider label="MILITARY FORCES"/>
            {[
              ["BUDGET",m.budget],["GDP %",m.gdp],["ACTIVE",m.active],
              ["RESERVE",m.reserve],["TANKS",m.tanks],["AIRCRAFT",m.aircraft],
              ["HELICOPTERS",m.heli],["NAVAL",m.naval],["NUCLEAR",m.nukes]
            ].map(([lbl,val])=>val&&val!=="—"&&(
              <div key={lbl} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #1e1208"}}>
                <span style={{fontFamily:"Cinzel",fontSize:9,color:"#5a3000",letterSpacing:".1em"}}>{lbl}</span>
                <span style={{fontFamily:"Cinzel",fontSize:10,color:"#b87333"}}>{val}</span>
              </div>
            ))}
            {m.notes&&(
              <>
                <Divider label="FIELD NOTE"/>
                <p style={{fontFamily:"IM Fell English,serif",fontSize:12,color:"#7a5a3a",lineHeight:1.6}}>{m.notes}</p>
              </>
            )}
          </>
        ) : (
          <div style={{fontFamily:"IM Fell English,serif",fontSize:13,color:"#4a3020",lineHeight:1.7,marginTop:8}}>
            No military intelligence on record for this territory.<br/>
            Click a <span style={{color:"#cc2200"}}>●</span> conflict marker to see full data.
          </div>
        )}
      </div>
    );
  }
  return null;
};

/* ═══════════════════════════════════════════════════════════════════
   TICKER
═══════════════════════════════════════════════════════════════════ */
const Ticker = () => {
  const items = CONFLICTS.map(c=>`⚡ ${c.name.toUpperCase()} — ${c.status} · ${c.casualties} · ${c.type}`).join("  ·  ");
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,height:38,background:"#0d0a06",borderTop:"1px solid #2a1808",overflow:"hidden",display:"flex",alignItems:"center",zIndex:200}}>
      <div style={{flexShrink:0,padding:"0 12px",fontFamily:"Cinzel",fontSize:9,color:"#8b5000",letterSpacing:".15em",borderRight:"1px solid #2a1808",whiteSpace:"nowrap"}}>
        BELLUM ACTIVUM
      </div>
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        <div className="ticker" style={{fontFamily:"Cinzel",fontSize:9,color:"#6a3e00",letterSpacing:".1em",padding:"0 20px"}}>{items} &nbsp;&nbsp;&nbsp; {items}</div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════════════ */
const Header = ({ activeCount, isMobile }) => (
  <div style={{position:"fixed",top:0,left:0,right:0,height:58,background:"linear-gradient(180deg,#0d0a06,#090705)",borderBottom:"1px solid #2a1808",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px",zIndex:300,boxShadow:"0 2px 20px rgba(0,0,0,.5)"}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <Gear size={isMobile?32:44} opacity={.5}/>
      {!isMobile&&<Gear size={26} reverse opacity={.35}/>}
    </div>
    <div style={{textAlign:"center",flex:1}}>
      <div className="title-fx" style={{fontFamily:"Cinzel Decorative",fontSize:isMobile?14:19,color:"#c8860a",letterSpacing:".1em",textShadow:"0 0 30px rgba(200,134,10,.4)",lineHeight:1}}>
        ATLAS OF CONFLICT
      </div>
      <div style={{fontFamily:"Cinzel",fontSize:isMobile?7:9,color:"#5a3000",letterSpacing:".18em",marginTop:3}}>
        GLOBAL SITUATION · 2025–2026
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:"Cinzel",fontSize:isMobile?9:11,color:"#cc2200",letterSpacing:".1em"}}>{activeCount} ACTIVE</div>
        <div style={{fontFamily:"Cinzel",fontSize:7,color:"#4a2800",letterSpacing:".1em"}}>CONFLICTS</div>
      </div>
      {!isMobile&&<Gear size={26} reverse opacity={.35}/>}
      <Gear size={isMobile?32:44} reverse opacity={.5}/>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   LEGEND
═══════════════════════════════════════════════════════════════════ */
const Legend = ({ isMobile }) => (
  <div style={{
    position:"fixed", bottom:48, left:isMobile?8:14, zIndex:200,
    background:"rgba(10,7,4,.85)", border:"1px solid #2a1808",
    padding:"8px 12px",
    display:"flex", flexDirection:isMobile?"row":"column", gap:isMobile?10:6, alignItems:isMobile?"center":"flex-start",
    flexWrap:"wrap",
  }}>
    {[["#cc2200","EXTREME"],["#e55000","HIGH"],["#c8860a","MODERATE"],["#448822","LOW"]].map(([c,l])=>(
      <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}`}}/>
        <span style={{fontFamily:"Cinzel",fontSize:7,color:"#5a3000",letterSpacing:".1em"}}>{l}</span>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   ZOOM CONTROLS
═══════════════════════════════════════════════════════════════════ */
const ZoomControls = ({ onZoom, panelOpen, isMobile }) => {
  const right = !isMobile && panelOpen ? 385 : 14;
  return (
    <div style={{position:"fixed",bottom:52,right:right,display:"flex",flexDirection:"column",gap:5,zIndex:200,transition:"right .45s ease"}}>
      {[["＋",1.5],["－",.67],["⌂",0]].map(([s,f])=>(
        <button key={s} className="btn-brass" onClick={()=>onZoom(f)}
          style={{width:36,height:36,fontSize:f===0?13:18,padding:0,display:"flex",alignItems:"center",justifyContent:"center",letterSpacing:0}}
          title={f===0?"Reset":f>1?"Zoom In":"Zoom Out"}>
          {s}
        </button>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SIGNAL DIAGNOSTIC — floating speed + ping test
═══════════════════════════════════════════════════════════════════ */

/* Single metric row: label + live value + animated bar */
const DiagRow = ({ label, valueStr, quality, measuring }) => {
  const barColor = quality?.color ?? "#3a2000";
  const barPct   = measuring ? 28 : (quality?.pct ?? 0);
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
        <span style={{fontFamily:"Cinzel",fontSize:8,color:"#5a3000",letterSpacing:".14em"}}>{label}</span>
        <span style={{fontFamily:"Cinzel",fontSize:9,color: measuring ? "#7a4a00" : barColor, letterSpacing:".06em",transition:"color .4s"}}>
          {measuring ? "MEASURING…" : valueStr}
        </span>
      </div>
      <div style={{height:4,background:"#15100a",border:"1px solid #1e1208",borderRadius:2,overflow:"hidden",position:"relative"}}>
        <div style={{
          height:"100%",
          width:`${barPct}%`,
          background: measuring
            ? "linear-gradient(to right,#3a200088,#7a4000)"
            : `linear-gradient(to right,${barColor}55,${barColor})`,
          borderRadius:2,
          transition: measuring ? "none" : "width .55s ease, background .4s",
        }}/>
        {measuring && (
          <div style={{
            position:"absolute",top:0,left:0,width:"40%",height:"100%",
            background:"linear-gradient(to right,transparent,rgba(200,134,10,.3),transparent)",
            animation:"diag-scan 1.1s ease-in-out infinite",
          }}/>
        )}
      </div>
      {!measuring && quality?.label && quality.label !== "–" && (
        <div style={{textAlign:"right",fontFamily:"Cinzel",fontSize:7,color:barColor,letterSpacing:".12em",marginTop:2}}>
          {quality.label}
        </div>
      )}
    </div>
  );
};

const NetDiag = ({ isMobile }) => {
  const [open,    setOpen]    = useState(false);
  const [phase,   setPhase]   = useState("idle");   // idle | running | done
  const [pingMs,  setPingMs]  = useState(null);
  const [dlMbps,  setDlMbps]  = useState(null);
  const [connStr, setConnStr] = useState(null);
  const [step,    setStep]    = useState(0);        // 0=ping  1=download  2=done

  /* Quality descriptors ─────────────────────────────────────────── */
  const pingQ = useMemo(() => {
    if (pingMs === null) return { label:"–", color:"#3a2000", pct:0 };
    if (pingMs < 50)  return { label:"EXCELLENT", color:"#44aa22", pct:94 };
    if (pingMs < 100) return { label:"GOOD",      color:"#88aa00", pct:72 };
    if (pingMs < 200) return { label:"FAIR",      color:"#c8860a", pct:46 };
    return                   { label:"POOR",      color:"#cc2200", pct:20 };
  }, [pingMs]);

  const dlQ = useMemo(() => {
    if (dlMbps === null) return { label:"–", color:"#3a2000", pct:0 };
    if (dlMbps > 25)  return { label:"FAST",    color:"#44aa22", pct:96 };
    if (dlMbps > 8)   return { label:"GOOD",    color:"#88aa00", pct:Math.round(50 + (dlMbps/25)*46) };
    if (dlMbps > 2)   return { label:"FAIR",    color:"#c8860a", pct:Math.round(20 + (dlMbps/8)*30) };
    return                   { label:"SLOW",    color:"#cc2200", pct:Math.max(6, Math.round(dlMbps * 14)) };
  }, [dlMbps]);

  /* Run diagnostic ─────────────────────────────────────────────── */
  const run = useCallback(async () => {
    if (phase === "running") return;
    setPhase("running");
    setPingMs(null);
    setDlMbps(null);
    setConnStr(null);
    setStep(0);

    /* Navigator Connection API (instant, no network needed) */
    const navC = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (navC?.effectiveType) setConnStr(navC.effectiveType.toUpperCase());

    /* ── PING: 5 HEAD samples to jsdelivr CDN ───────────────────── */
    const samples = [];
    const BASE = "https://cdn.jsdelivr.net/npm/lodash@4.17.21/package.json";
    for (let i = 0; i < 5; i++) {
      try {
        const t0 = performance.now();
        await fetch(`${BASE}?_=${Date.now()}_${i}`, { method:"HEAD", cache:"no-store" });
        samples.push(Math.round(performance.now() - t0));
        /* update live as each sample arrives */
        const sorted = [...samples].sort((a,b)=>a-b);
        const trimmed = sorted.slice(0, Math.max(1, sorted.length - 1)); // drop highest
        setPingMs(Math.round(trimmed.reduce((a,b)=>a+b,0) / trimmed.length));
      } catch { /* network error — skip sample */ }
      await new Promise(r => setTimeout(r, 80));
    }

    /* ── DOWNLOAD SPEED: fetch ~200KB atlas file ────────────────── */
    setStep(1);
    try {
      const t0  = performance.now();
      const res = await fetch(
        `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json?_=${Date.now()}`,
        { cache:"no-store" }
      );
      const buf  = await res.arrayBuffer();
      const secs = (performance.now() - t0) / 1000;
      const mbps = (buf.byteLength * 8) / (secs * 1e6);
      setDlMbps(parseFloat(mbps.toFixed(1)));
    } catch {
      /* fall back to Navigator API downlink if available */
      if (navC?.downlink) setDlMbps(parseFloat(navC.downlink.toFixed(1)));
    }

    setStep(2);
    setPhase("done");
  }, [phase]);

  /* Layout positions ───────────────────────────────────────────── */
  const btnStyle = isMobile
    ? { bottom:92, right:14, left:"auto" }
    : { bottom:162, left:14, right:"auto" };
  const panelStyle = isMobile
    ? { bottom:136, right:14, left:"auto", width:214 }
    : { bottom:208, left:14, right:"auto", width:224 };

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        className="btn-brass"
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", zIndex:260,
          ...btnStyle,
          display:"flex", alignItems:"center", gap:5,
          padding:"5px 11px", fontSize:9, letterSpacing:".14em",
          boxShadow: open ? "0 0 18px rgba(200,134,10,.45)" : "none",
        }}
      >
        ⚡ SIGNAL {open ? "▲" : "▼"}
      </button>

      {/* ── Diagnostic panel ── */}
      {open && (
        <div
          className="diag-show"
          style={{
            position:"fixed", zIndex:261,
            ...panelStyle,
            background:"rgba(8,6,3,.97)",
            border:"1px solid #5a3000",
            boxShadow:"0 0 36px rgba(90,45,0,.5), inset 0 0 50px rgba(0,0,0,.4)",
            padding:"12px 14px 10px",
          }}
        >
          {/* Header row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <Gear size={13} opacity={.9}/>
              <span style={{fontFamily:"Cinzel Decorative",fontSize:9,color:"#c8860a",letterSpacing:".12em"}}>SIGNAL DIAG</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{background:"none",border:"none",color:"#4a2800",cursor:"pointer",fontFamily:"Cinzel",fontSize:12,lineHeight:1,padding:"0 2px"}}
            >✕</button>
          </div>

          <div style={{height:1,background:"linear-gradient(to right,transparent,#7a4000,transparent)",marginBottom:10}}/>

          {/* LATENCY row */}
          <DiagRow
            label="LATENCY"
            valueStr={pingMs !== null ? `${pingMs} ms` : "–"}
            quality={pingQ}
            measuring={phase === "running" && step === 0 && pingMs === null}
          />

          {/* DOWNLOAD row */}
          <DiagRow
            label="DOWNLOAD"
            valueStr={dlMbps !== null ? `${dlMbps} Mbps` : "–"}
            quality={dlQ}
            measuring={phase === "running" && step === 1}
          />

          {/* NETWORK TYPE row */}
          {connStr && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontFamily:"Cinzel",fontSize:8,color:"#5a3000",letterSpacing:".14em"}}>NETWORK</span>
              <span style={{fontFamily:"Cinzel",fontSize:9,color:"#b87333",letterSpacing:".06em"}}>{connStr}</span>
            </div>
          )}

          <div style={{height:1,background:"linear-gradient(to right,transparent,#7a4000,transparent)",marginBottom:10}}/>

          {/* Run button */}
          <button
            className="btn-brass"
            onClick={run}
            disabled={phase === "running"}
            style={{
              width:"100%", padding:"7px", fontSize:9, letterSpacing:".16em",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            }}
          >
            {phase === "running"
              ? <><Gear size={11} opacity={1}/> {step === 0 ? "PINGING…" : "MEASURING…"}</>
              : "▶ RUN DIAGNOSTIC"
            }
          </button>

          {phase !== "idle" && (
            <div style={{marginTop:7,fontFamily:"IM Fell English,serif",fontSize:9,color:"#2a1800",textAlign:"center",fontStyle:"italic"}}>
              via cdn.jsdelivr.net · approximate
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [worldGeo,         setWorldGeo]         = useState(null);
  const [loading,          setLoading]           = useState(true);
  const [error,            setError]             = useState(false);
  const [loadMsg,          setLoadMsg]           = useState("LOADING ATLAS…");
  const [selectedConflict, setSelectedConflict]  = useState(null);
  const [selectedCountry,  setSelectedCountry]   = useState(null);
  const [showModal,        setShowModal]         = useState(false);
  const [tooltip,          setTooltip]           = useState(null);
  const [isMobile,         setIsMobile]          = useState(window.innerWidth < 768);

  const svgRef  = useRef(null);
  const mapGRef = useRef(null);
  const zoomRef = useRef(null);

  const W = window.innerWidth;
  const H = window.innerHeight;

  const projection = useMemo(() => {
    const scale = isMobile ? W / 3.5 : W / 6.2;
    return d3.geoNaturalEarth1().scale(scale).translate([W/2, H/2]);
  }, [W, H, isMobile]);

  const pathGen = useMemo(() => d3.geoPath().projection(projection), [projection]);

  /* ── Map loading with multi-source fallback + timeout ─────────── */
  const loadMap = useCallback(async () => {
    setWorldGeo(null);
    setLoading(true);
    setError(false);

    for (let i = 0; i < GEO_SOURCES.length; i++) {
      setLoadMsg(i === 0
        ? "LOADING ATLAS…"
        : `RETRYING… SOURCE ${i + 1} OF ${GEO_SOURCES.length}`
      );
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 12000);
        const r    = await fetch(GEO_SOURCES[i], { signal: ctrl.signal });
        clearTimeout(tid);
        if (!r.ok) continue;
        const data = await r.json();
        if (data?.features?.length > 0) {
          setWorldGeo(data);
          setLoading(false);
          return;
        }
      } catch { /* try next source */ }
    }

    setError(true);
    setLoading(false);
  }, []);

  useEffect(() => { loadMap(); }, []); // eslint-disable-line

  /* ── D3 Zoom ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || !worldGeo) return;
    const zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", ({transform}) => {
      if (mapGRef.current) d3.select(mapGRef.current).attr("transform", transform);
    });
    zoomRef.current = zoom;
    d3.select(svgRef.current).call(zoom);
    return () => { if (svgRef.current) d3.select(svgRef.current).on(".zoom", null); };
  }, [worldGeo]);

  /* ── Resize ───────────────────────────────────────────────────── */
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const handleZoom = useCallback((factor) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    if (factor === 0) {
      svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
    } else {
      svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
    }
  }, []);

  const getCountryFill = useCallback((name) => {
    const norm = NAME_MAP[name] || name;
    if (CONFLICT_NATIONS.has(name) || CONFLICT_NATIONS.has(norm)) return "#221810";
    return "#18140d";
  }, []);

  const handleCountryClick = useCallback((name) => {
    const norm = NAME_MAP[name] || name;
    const mil = MILITARY[norm];
    if (mil) {
      setSelectedCountry({ name: norm, military: mil });
      setSelectedConflict(null);
    }
  }, []);

  const panelOpen  = !!(selectedConflict || selectedCountry);
  const activeCount = CONFLICTS.filter(c => c.status === "ACTIVE").length;
  const graticule   = useMemo(() => d3.geoGraticule()(), []);

  return (
    <>
      <style>{CSS}</style>
      <div style={{position:"fixed",inset:0,background:"#090705",fontFamily:"IM Fell English, serif",overflow:"hidden"}}>

        <Header activeCount={activeCount} isMobile={isMobile}/>

        {/* ── MAP CANVAS ── */}
        <div style={{position:"absolute",top:58,bottom:38,left:0,right:0}}>

          {loading && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
              <Gear size={56}/>
              <div style={{fontFamily:"Cinzel",fontSize:11,color:"#5a3000",letterSpacing:".2em"}}>{loadMsg}</div>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                {GEO_SOURCES.map((_,i)=>(
                  <div key={i} style={{
                    width:6,height:6,borderRadius:"50%",
                    background: loadMsg.includes(`${i+1}`) || (i===0 && loadMsg==="LOADING ATLAS…")
                      ? "#c8860a" : "#2a1808",
                    boxShadow: loadMsg.includes(`${i+1}`) ? "0 0 8px #c8860a" : "none",
                    transition:"all .3s",
                  }}/>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
              <div style={{fontFamily:"Cinzel",fontSize:14,color:"#cc2200",letterSpacing:".12em"}}>⚠ ATLAS UNAVAILABLE</div>
              <div style={{fontFamily:"IM Fell English,serif",fontSize:13,color:"#6a4a2a",textAlign:"center",maxWidth:300,lineHeight:1.5}}>
                All cartographic sources failed.<br/>Check your connection and retry.
              </div>
              <button className="btn-brass" onClick={loadMap} style={{marginTop:6,padding:"7px 22px",fontSize:10,letterSpacing:".18em"}}>↻ RETRY</button>
            </div>
          )}

          <svg ref={svgRef} width="100%" height="100%" style={{cursor:"grab",display:"block"}}>
            <rect width="100%" height="100%" fill="#090705"/>
            <g ref={mapGRef}>
              {worldGeo && (
                <>
                  <path d={pathGen(graticule)} fill="none" stroke="#151008" strokeWidth={.35}/>
                  {worldGeo.features.map(f => (
                    <path
                      key={f.properties.name}
                      className="country-path"
                      d={pathGen(f) || ""}
                      fill={getCountryFill(f.properties.name)}
                      stroke="#2e2012"
                      strokeWidth={.4}
                      onClick={() => handleCountryClick(f.properties.name)}
                    />
                  ))}
                  {CONFLICTS.map(c => {
                    const pos = projection([c.lon, c.lat]);
                    if (!pos) return null;
                    const [cx, cy] = pos;
                    return (
                      <PulseMarker
                        key={c.id} cx={cx} cy={cy} conflict={c}
                        onHover={setTooltip}
                        isSelected={selectedConflict?.id === c.id}
                        onClick={() => { setSelectedConflict(c); setSelectedCountry(null); }}
                      />
                    );
                  })}
                </>
              )}
            </g>
          </svg>
        </div>

        {/* ── TOOLTIP ── */}
        {tooltip && (
          <div style={{
            position:"fixed", left:tooltip.x+14, top:tooltip.y-28,
            background:"rgba(9,7,4,.94)", border:"1px solid #5a3000",
            color:"#d4b896", padding:"5px 12px",
            fontFamily:"Cinzel", fontSize:10, letterSpacing:".1em",
            pointerEvents:"none", zIndex:400, whiteSpace:"nowrap",
            boxShadow:"0 0 12px rgba(90,45,0,.4)"
          }}>
            {tooltip.text}
          </div>
        )}

        {/* ── HINT ── */}
        {!panelOpen && !loading && !error && (
          <div style={{
            position:"fixed", top:70, left:"50%", transform:"translateX(-50%)",
            fontFamily:"Cinzel", fontSize:isMobile?8:9, color:"#3a2808",
            letterSpacing:".15em", pointerEvents:"none", zIndex:50
          }}>
            CLICK A PULSE MARKER TO INSPECT · DRAG TO PAN · SCROLL TO ZOOM
          </div>
        )}

        <Legend isMobile={isMobile}/>
        <ZoomControls onZoom={handleZoom} panelOpen={panelOpen} isMobile={isMobile}/>

        {/* ── SIGNAL DIAGNOSTIC (speed test) ── */}
        <NetDiag isMobile={isMobile}/>

        {/* ── INFO PANEL ── */}
        {panelOpen && (
          <InfoPanel
            conflict={selectedConflict}
            country={selectedCountry}
            isMobile={isMobile}
            onClose={() => { setSelectedConflict(null); setSelectedCountry(null); }}
            onLiveFeed={() => setShowModal(true)}
          />
        )}

        {/* ── LIVE FEED MODAL ── */}
        {showModal && (
          <LiveFeedModal conflict={selectedConflict} onClose={() => setShowModal(false)}/>
        )}

        <Ticker/>

        {/* Corner decals */}
        <div style={{position:"fixed",top:62,left:8,zIndex:50,opacity:.18,pointerEvents:"none"}}>
          <Gear size={70} opacity={1}/>
        </div>
        <div style={{position:"fixed",top:62,right:8,zIndex:50,opacity:.18,pointerEvents:"none"}}>
          <Gear size={50} reverse opacity={1}/>
        </div>

      </div>
    </>
  );
}
