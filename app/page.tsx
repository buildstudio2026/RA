"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Regulation, CATEGORY_ORDER } from "@/lib/data";
import { Loader2, ArrowDown, ExternalLink, Calendar, Building2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 데이터 로딩 (API 연동)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/regulations", window.location.origin);
        if (searchQuery) url.searchParams.set("query", searchQuery);

        const res = await fetch(url.toString());
        const data = await res.json();
        if (Array.isArray(data)) {
          setRegulations(data);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 카테고리 변경 시 페이지 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedSubCategory]);

  // 분야 필터링 및 정렬
  const filteredRegulations = useMemo(() => {
    let list = [...regulations];
    if (selectedSubCategory !== "전체") {
      list = list.filter(reg => reg.subCategories.includes(selectedSubCategory));
    }
    return list.sort((a, b) => (CATEGORY_ORDER[a.category] || 99) - (CATEGORY_ORDER[b.category] || 99));
  }, [regulations, selectedSubCategory]);

  // 계층 구조 그룹화
  const hierarchyMap = useMemo(() => {
    const map: { [key: string]: Regulation[] } = {};
    const orderedCategories = Object.keys(CATEGORY_ORDER).sort((a, b) => CATEGORY_ORDER[a] - CATEGORY_ORDER[b]);
    orderedCategories.forEach(cat => {
      const items = filteredRegulations.filter(reg => reg.category === cat);
      if (items.length > 0) map[cat] = items;
    });
    return map;
  }, [filteredRegulations]);

  // 초기 로드 시 모든 카테고리 펼침 (데이터 로드 후)
  useEffect(() => {
    if (Object.keys(hierarchyMap).length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(Object.keys(hierarchyMap)));
    }
  }, [hierarchyMap]);

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCategories(next);
  };

  const statusDot = {
    NEW: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    UPDATED: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]",
    UNCHANGED: "bg-slate-400",
  };

  const statusLabel = {
    NEW: "text-emerald-700 bg-emerald-50 border-emerald-100",
    UPDATED: "text-orange-600 bg-orange-50 border-orange-100",
    UNCHANGED: "text-slate-700 bg-slate-100 border-slate-200",
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start">
        <Sidebar
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={setSelectedSubCategory}
        />

        <main className="flex-1 p-8 md:p-16 transition-all">
          {/* Main Header */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6 text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">
              <Layers size={16} className="text-slate-900" />
              {selectedSubCategory === "전체" ? "Regulation Library" : `Library / ${selectedSubCategory}`}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl leading-tight">
              {selectedSubCategory === "전체" ? "임상시험규정.zip" : <>{selectedSubCategory} <br />규정 체계</>}
            </h1>
            <p className="mt-6 text-base text-slate-600 font-bold max-w-2xl leading-relaxed">
              최신 제개정 정보를 실시간으로 추적하여 법적 위계 구조로 시각화합니다. <br />
              규정명을 클릭하여 상세 조문을 확인하세요.
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-slate-900" size={32} />
            </div>
          ) : Object.keys(hierarchyMap).length > 0 ? (
            <div className="space-y-24">
              {Object.entries(hierarchyMap).map(([level, items], idx, arr) => (
                <div key={level} className="flex flex-col">
                  <div
                    onClick={() => toggleCategory(level)}
                    className="flex items-center gap-6 mb-8 cursor-pointer group/header select-none"
                  >
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap pr-4 group-hover/header:text-emerald-600 transition-colors">
                      {level}
                    </h2>
                    <div className={cn(
                      "h-0.5 flex-1 transition-all duration-500",
                      expandedCategories.has(level) ? "bg-slate-900" : "bg-slate-200"
                    )}></div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-slate-900 text-xs">
                        {items.length.toString().padStart(2, '0')}
                      </span>
                      <div className={cn(
                        "transition-transform duration-300",
                        expandedCategories.has(level) ? "rotate-180" : "rotate-0"
                      )}>
                        <ArrowDown size={14} className="text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "flex flex-col gap-3 overflow-hidden transition-all duration-500 ease-in-out",
                    expandedCategories.has(level) ? "max-h-[5000px] opacity-100 mb-16" : "max-h-0 opacity-0 mb-0"
                  )}>
                    {items.map((reg) => (
                      <div key={reg.id} className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:border-slate-900 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]">

                        {/* Status Dot */}
                        <div className="flex-shrink-0 pt-1 sm:pt-0">
                          <div className={cn("h-2.5 w-2.5 rounded-full", statusDot[reg.status])}></div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                              {reg.category}
                            </span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                              reg.status === "NEW" ? "border-emerald-100 bg-emerald-50 text-emerald-600" :
                                reg.status === "UPDATED" ? "border-orange-100 bg-orange-50 text-orange-500" :
                                  "border-slate-50 bg-slate-50 text-slate-400"
                            )}>
                              {reg.status}
                            </span>
                          </div>

                          <div className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-8 justify-between">
                            <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-emerald-500 transition-colors break-words lg:max-w-2xl">
                              {reg.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 shrink-0 mt-1 xl:mt-0">
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                                <Building2 size={13} className="text-slate-900" />
                                <span>{reg.organization}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                                <Calendar size={13} className="text-slate-900" />
                                <span>{reg.lastUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section: Source & Link */}
                        <div className="flex items-center gap-6 shrink-0 pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-50 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Source</span>
                            <span className="text-[10px] font-black text-slate-900">{reg.source}</span>
                          </div>
                          <a
                            href={reg.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center border-2 border-slate-900 bg-slate-50 text-center rounded-3xl">
              <p className="text-lg font-black text-slate-900">검색 결과가 없습니다.</p>
              <button
                onClick={() => { setSelectedSubCategory("전체"); setSearchQuery("") }}
                className="mt-6 px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
