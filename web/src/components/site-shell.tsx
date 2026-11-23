"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { translations, type Locale } from "@/lib/i18n";
export function SiteShell({ children }: { children: React.ReactNode }) {
 const pathname = usePathname(); const [locale,setLocale] = useState<Locale>("en"); const t=translations[locale];
 const links=[["/","TUKI",t.home],["/studio","02",t.studio],["/technology","03",t.technology]];
 return <><header className="topbar"><Link className="wordmark" href="/">TUKI<span>®</span></Link><nav aria-label="Main navigation">{links.map(([href,num,label])=><Link key={href} className={pathname===href?"nav-link active":"nav-link"} href={href}><small>{num}</small>{label}</Link>)}</nav><div className="nav-right"><button className="language" onClick={()=>setLocale(locale==="en"?"es":"en")} aria-label="Change language">{locale.toUpperCase()} ↗</button><Link className="nav-cta" href="/studio">{t.launch}<span>↗</span></Link></div></header><main>{children}</main><footer className="footer"><Link className="wordmark" href="/">TUKI<span>®</span></Link><p>{t.footer} · Simulation only</p><Link href="/technology">Project architecture ↗</Link><small>© 2026 TUKI Project</small></footer></>;
}
