import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

const LAW_API_BASE = 'http://www.law.go.kr/DRF/lawSearch.do'
const MFDS_LIST_URL = 'https://www.mfds.go.kr/brd/m_1060/list.do'
const OC_ID = 'RA' // 사용자 요청에 따른 OC ID 세팅

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const categoryQuery = searchParams.get('category')
    const query = searchParams.get('query')

    const { regulations } = await import('@/lib/data')
    let localFiltered = [...regulations]

    // 1. 로컬 데이터 필터링
    if (categoryQuery && categoryQuery !== '전체') {
        localFiltered = localFiltered.filter(r => r.category === categoryQuery)
    }

    if (query) {
        const q = query.toLowerCase().replace(/\s/g, '')
        localFiltered = localFiltered.filter(r =>
            r.title.toLowerCase().replace(/\s/g, '').includes(q) ||
            r.organization.toLowerCase().replace(/\s/g, '').includes(q)
        )
    }

    // 2. 실시간 데이터 통합 함수 (Public Stable Link 생성)
    const generateLawUrl = (id: string, target: string) => {
        if (target === 'law') {
            return `https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=${id}&efYnChk=1`;
        }
        if (target === 'byl') {
            const [lsiSeq, bylNo] = id.split(':');
            return `https://www.law.go.kr/LSW/lsBylInfoPLinkR.do?lsiSeq=${lsiSeq}&bylNo=${bylNo}&bylBrNo=00&bylCls=BE&bylEfYdYn=Y`;
        }
        if (id.length <= 6) {
            return `https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulLsId=${id}`;
        }
        return `https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=${id}&efYnChk=1`;
    };

    const fetchLawData = async (q: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        try {
            const [lawResp, admResp] = await Promise.all([
                fetch(`${LAW_API_BASE}?OC=${OC_ID}&target=law&type=JSON&query=${encodeURIComponent(q)}`, { signal: controller.signal }),
                fetch(`${LAW_API_BASE}?OC=${OC_ID}&target=admrul&type=JSON&query=${encodeURIComponent(q)}`, { signal: controller.signal })
            ]);

            const [lawData, admData] = await Promise.all([
                lawResp.ok ? lawResp.json().catch(() => ({})) : {},
                admResp.ok ? admResp.json().catch(() => ({})) : {}
            ]);

            const results: any[] = [];
            const processItems = (raw: any, target: string) => {
                if (!raw) return;
                const items = Array.isArray(raw) ? raw : [raw];
                items.forEach((item: any) => {
                    const id = target === 'law' ? (item.법령일련번호 || item.법령ID) : (item.고시일련번호 || item.고시ID);
                    results.push({
                        title: item.법령명한글 || item.현행고시명,
                        id: id,
                        target: target,
                        url: generateLawUrl(id, target),
                        lastUpdated: (item.공포일자 || item.발령일자) ? `${(item.공포일자 || item.발령일자).slice(0, 4)}.${(item.공포일자 || item.발령일자).slice(4, 6)}.${(item.공포일자 || item.발령일자).slice(6, 8)}` : '2024.01.01'
                    });
                });
            };

            processItems((lawData as any)?.LawSearch?.law, 'law');
            processItems((admData as any)?.AdmRulSearch?.admrul, 'admrul');
            return results;
        } catch (e) {
            return [];
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const fetchMfdsData = async (q: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // MFDS is slightly slower
        try {
            // board_id=data0011 및 data_stts_gubun=C9999 파라미터가 있어야 정확한 '민원인안내서' 166건이 조회됨
            const fetchUrl = `${MFDS_LIST_URL}?board_id=data0011&data_stts_gubun=C9999&srchTp=0&srchWord=${encodeURIComponent(q || "임상시험")}`;
            const res = await fetch(fetchUrl, { signal: controller.signal });
            if (!res.ok) return [];
            const html = await res.text();
            const $ = cheerio.load(html);
            const results: any[] = [];

            $('.bbs_list01 > ul > li').each((i, el) => {
                const titleLink = $(el).find('a.title');
                const title = titleLink.text().trim();
                const href = titleLink.attr('href') || '';
                const date = $(el).find('.right_column').text().trim();
                const seqMatch = href.match(/seq=(\d+)/);
                const seq = seqMatch ? seqMatch[1] : '';

                // 제목에 '임상시험'이 명시적으로 포함된 경우만 수집 (사용자 요청사항)
                if (title && seq && title.includes('임상시험')) {
                    const medicineKeywords = ["의약품", "약사법", "백신", "항암제", "폐결핵", "고지혈증", "정신분열", "고혈압", "안구건조증", "안구표면", "골관절염", "진통제", "위염", "궤양성대장염", "과민성 장 증후군", "변비", "간장애", "주의력결핍", "한약", "생약", "항생제", "소화성궤양", "세포치료제", "유전자치료제", "올리고", "크론병", "건선", "치료제", "혈액응고인자", "제네릭"];
                    const deviceKeywords = ["의료기기", "스텐트", "콘택트렌즈", "임플란트", "필러", "초음파", "진단기기", "진단지원", "로봇수술", "인공추간판", "인공무릎", "펄스옥시미터", "체외진단", "검안", "실", "캡슐내시경", "MRI", "혈당측정", "창상치료", "조직재생", "ECM패치", "안구영역", "스텐트"];
                    const digitalKeywords = ["디지털", "인공지능", "AI", "SaMD", "VR", "뇌용전기자극", "심리요법"];
                    const dataKeywords = ["데이터", "개인정보", "보안", "전자 자료", "통계", "유전체", "RBM", "메뉴얼", "데이터 관리", "통계분석", "위험도 기반"];
                    const ethicsKeywords = ["IRB", "생명윤리", "윤리", "대상자 보호", "HRPP", "동의서", "보상", "모집", "전자동의", "피해자"];

                    const subCategories: string[] = [];
                    if (medicineKeywords.some(k => title.includes(k))) subCategories.push("의약품");
                    if (deviceKeywords.some(k => title.includes(k))) subCategories.push("의료기기");
                    if (digitalKeywords.some(k => title.includes(k))) subCategories.push("디지털의료·SaMD/AI");
                    if (dataKeywords.some(k => title.includes(k))) subCategories.push("데이터/개인정보/보안");
                    if (ethicsKeywords.some(k => title.includes(k))) subCategories.push("연구윤리/IRB");

                    if (subCategories.length === 0) {
                        subCategories.push("의약품", "의료기기"); // Default for common items
                    }

                    results.push({
                        id: `MFDS_${seq}`,
                        title: title,
                        category: "가이드라인",
                        subCategories: subCategories,
                        organization: "식품의약품안전처",
                        source: "MFDS",
                        url: `https://www.mfds.go.kr/brd/m_1060/view.do?seq=${seq}`,
                        lastUpdated: date.replace(/-/g, '.'),
                        status: "UNCHANGED" as const
                    });
                }
            });
            return results;
        } catch (e) {
            return [];
        } finally {
            clearTimeout(timeoutId);
        }
    };

    // 3. 데이터 처리 및 결합
    // 3-1. 로컬 데이터 중 lawId가 있는 항목은 즉시 링크 생성
    localFiltered = localFiltered.map(item => {
        if (!item.url && item.lawId && item.lawTarget) {
            return {
                ...item,
                url: generateLawUrl(item.lawId, item.lawTarget)
            };
        }
        return item;
    });

    // 3-2. 검색어나 실시간 추적이 필요한 경우
    if (query || categoryQuery === '가이드라인' || !categoryQuery) {
        // MFDS는 '임상시험' 키워드로 실시간 최신 10건을 항상 추적
        const [apiData, mfdsData] = await Promise.all([
            query ? fetchLawData(query) : Promise.resolve([]),
            fetchMfdsData(query || "임상시험")
        ]);

        const combinedApiData = [...apiData];

        // MFDS 가이드라인 처리
        mfdsData.forEach(m => {
            const existingIndex = localFiltered.findIndex(l => l.title.replace(/\s/g, '') === m.title.replace(/\s/g, ''));
            if (existingIndex !== -1) {
                // 기존 데이터가 있으면 최신 정보로 업데이트
                localFiltered[existingIndex] = { ...localFiltered[existingIndex], ...m, status: 'UNCHANGED' as const };
            } else {
                // 신규 데이터면 추가
                localFiltered.push(m);
            }
        });

        // 검색어 기반 매칭 및 새로운 데이터 추가 (법제처)
        if (query) {
            localFiltered = localFiltered.map(localItem => {
                const match = combinedApiData.find(a =>
                    a.title.replace(/\s/g, '').includes(localItem.title.replace(/\s/g, '')) ||
                    localItem.title.replace(/\s/g, '').includes(a.title.replace(/\s/g, ''))
                );
                if (match) {
                    const lastUpdatedDate = new Date(match.lastUpdated.replace(/\./g, '-'));
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    const status = lastUpdatedDate >= oneYearAgo ? 'UPDATED' : 'UNCHANGED';

                    return { ...localItem, url: match.url, lastUpdated: match.lastUpdated, status: status as any, organization: '법제처', source: 'Law.go.kr' };
                }
                return localItem;
            });

            // 로컬에 없는 신규 법령 추가
            const newResults = combinedApiData
                .filter(apiItem => !localFiltered.some(l => l.title.replace(/\s/g, '') === apiItem.title.replace(/\s/g, '')))
                .map(apiItem => {
                    let cat = '고시';
                    if (apiItem.target === 'law') {
                        if (apiItem.title.endsWith('법')) cat = '법률';
                        else if (apiItem.title.endsWith('시행령')) cat = '시행령';
                        else if (apiItem.title.endsWith('규칙')) cat = '시행규칙';
                        else cat = '고시';
                    }
                    return {
                        id: apiItem.id,
                        title: apiItem.title,
                        category: cat,
                        subCategories: ['일반'],
                        organization: '법제처',
                        source: 'Law.go.kr',
                        url: apiItem.url,
                        lastUpdated: apiItem.lastUpdated,
                        status: 'UNCHANGED' as const
                    };
                });
            localFiltered = [...localFiltered, ...newResults];
        }
    }

    // 4. 최종 결과 정렬
    const { CATEGORY_ORDER } = await import('@/lib/data');
    localFiltered.sort((a, b) => {
        // 1순위: 카테고리 순서 (법률 > 하위법령 > 고시 > 가이드라인)
        const orderA = CATEGORY_ORDER[a.category] || 99;
        const orderB = CATEGORY_ORDER[b.category] || 99;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        // 2순위: 최신 업데이트일 순
        const dateA = new Date(a.lastUpdated.replace(/\./g, '-')).getTime();
        const dateB = new Date(b.lastUpdated.replace(/\./g, '-')).getTime();
        return dateB - dateA;
    });

    return NextResponse.json(localFiltered);
}
