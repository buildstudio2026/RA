"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RegulationCard from "@/components/RegulationCard";
import { Regulation, regulations as staticRegulations } from "@/lib/data";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function UpdatesPage() {
    const [regulations, setRegulations] = useState<Regulation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let list = [...staticRegulations];
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase().replace(/\s/g, '');
            list = list.filter(r => 
                r.title.toLowerCase().replace(/\s/g, '').includes(q) ||
                r.organization.toLowerCase().replace(/\s/g, '').includes(q)
            );
        }
        
        const updates = list.filter(r => r.status === "NEW" || r.status === "UPDATED");
        setRegulations(updates);
        setLoading(false);
    }, [searchQuery]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar searchQuery={searchQuery} onSearch={setSearchQuery} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6 md:p-8">
                <div className="mb-8 items-center gap-2">
                    <Link href="/" className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary">
                        <ChevronLeft size={16} />
                        규정 목록으로 돌아가기
                    </Link>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">최근 변경 규정</h1>
                    <p className="mt-2 text-slate-500">
                        임상시험 실무자가 반드시 확인해야 할 최신 개정 및 제정 사항입니다.
                    </p>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            신규 및 업데이트 리스트
                        </h2>

                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : regulations.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {regulations.map((reg) => (
                                    <RegulationCard key={reg.id} regulation={reg} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
                                <p className="text-slate-400">최근 변경 사항이 없습니다.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
