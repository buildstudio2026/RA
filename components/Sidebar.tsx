"use client";

import { SUB_CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ChevronRight, Layout, Info, HelpCircle } from "lucide-react";

export default function Sidebar({
    selectedSubCategory,
    onSelectSubCategory,
}: {
    selectedSubCategory: string;
    onSelectSubCategory: (sub: string) => void;
}) {
    return (
        <aside className="hidden h-[calc(100vh-64px)] w-60 flex-col border-r bg-slate-50/40 p-4 md:flex sticky top-16 overflow-y-auto">
            <div className="mb-8">
                <h2 className="px-3 mb-4 flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                    <Layout size={12} className="text-slate-900" />
                    분야 선택
                </h2>
                <nav className="flex flex-col gap-1">
                    {SUB_CATEGORIES.map((sub) => (
                        <button
                            key={sub}
                            onClick={() => onSelectSubCategory(sub)}
                            className={cn(
                                "group flex items-center justify-between rounded-md px-3 py-2 text-xs font-bold transition-all",
                                selectedSubCategory === sub
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                            )}
                        >
                            <span className="truncate">{sub === "전체" ? "전체 규정" : sub}</span>
                            {selectedSubCategory === sub && <ChevronRight size={12} className="text-white" />}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto space-y-8 pb-4">
                <div className="px-3">
                    <h2 className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">
                        <Info size={12} className="text-slate-900" />
                        상태 가이드
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></div>
                            <span className="text-[10px] font-bold text-slate-700">신규 제정</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-orange-500 ring-4 ring-orange-500/10"></div>
                            <span className="text-[10px] font-bold text-slate-700">최근 개정</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-slate-400 ring-4 ring-slate-400/10"></div>
                            <span className="text-[10px] font-bold text-slate-700">현행 유지</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-slate-900 p-5 shadow-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <HelpCircle size={15} className="text-emerald-400" />
                        <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Notice</h3>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-300 font-bold">
                        공공 API를 통해 실시간 개정 정보를 <br />
                        감지하여 반영합니다.
                    </p>
                </div>
            </div>
        </aside>
    );
}
