"use client";

import { Search, Bell, Info, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Navbar({
    searchQuery,
    onSearch
}: {
    searchQuery?: string;
    onSearch: (query: string) => void
}) {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900">
                            임상시험규정.zip
                        </span>
                    </Link>
                </div>

                <div className="relative flex flex-1 max-w-xl items-center group">
                    <div className="absolute left-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="규정 검색 (예: 약사법, 가이드라인...)"
                        value={searchQuery || ""}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/updates"
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
                    >
                        <Bell size={16} />
                        <span className="hidden sm:inline">최근 개정</span>
                    </Link>
                    <Link
                        href="/about"
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
                    >
                        <Info size={16} />
                        <span className="hidden sm:inline">About</span>
                    </Link>
                    <button className="flex items-center gap-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:hidden transition-all">
                        <Menu size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
