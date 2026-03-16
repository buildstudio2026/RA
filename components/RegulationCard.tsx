import { Regulation } from "@/lib/data";
import { ExternalLink, Calendar, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegulationCard({ regulation }: { regulation: Regulation }) {
    const statusStyles = {
        NEW: "bg-emerald-100 text-emerald-700 border-emerald-200",
        UPDATED: "bg-amber-100 text-amber-700 border-amber-200",
        UNCHANGED: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <div className="group relative flex items-center gap-6 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:border-slate-900 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] w-full">

            {/* Status Dot */}
            <div className="flex-shrink-0">
                <div className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    regulation.status === "NEW" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                        regulation.status === "UPDATED" ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]" :
                            "bg-slate-400"
                )}></div>
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            {regulation.category}
                        </span>
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                            regulation.status === "NEW" ? "border-emerald-100 bg-emerald-50 text-emerald-600" :
                                regulation.status === "UPDATED" ? "border-orange-100 bg-orange-50 text-orange-500" :
                                    "border-slate-50 bg-slate-50 text-slate-400"
                        )}>
                            {regulation.status}
                        </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-emerald-500 transition-colors truncate">
                        {regulation.title}
                    </h3>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-900" />
                        <span>{regulation.organization}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-900" />
                        <span>{regulation.lastUpdated}</span>
                    </div>
                </div>
            </div>

            {/* Right Section: Source & Link */}
            <div className="flex items-center gap-6 shrink-0 pl-6 border-l border-slate-50">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Source</span>
                    <span className="text-[10px] font-black text-slate-900">{regulation.source}</span>
                </div>
                <a
                    href={regulation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
                >
                    <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
}
