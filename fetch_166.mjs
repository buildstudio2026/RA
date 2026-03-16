
import * as cheerio from 'cheerio';

async function fetchMfdsPage(page = 1) {
    const url = `https://www.mfds.go.kr/brd/m_1060/list.do?multi_itm_seq=0&board_id=data0011&data_stts_gubun=C9999&srchTp=0&srchWord=%EC%9E%84%EC%83%81%EC%8B%9C%ED%97%98&page=${page}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const pageItems = [];
    $('.bbs_list01 > ul > li').each((i, el) => {
        const titleLink = $(el).find('a.title');
        const title = titleLink.text().trim();
        const href = titleLink.attr('href') || '';
        const date = $(el).find('.right_column').text().trim();
        const seqMatch = href.match(/seq=(\d+)/);
        const seq = seqMatch ? seqMatch[1] : '';

        if (title && seq && title.includes('임상시험')) {
            pageItems.push({
                id: `MFDS_${seq}`,
                title: title,
                category: "MFDS 가이드라인",
                subCategory: "임상공통",
                organization: "식품의약품안전처",
                source: "MFDS",
                url: `https://www.mfds.go.kr/brd/m_1060/view.do?seq=${seq}`,
                lastUpdated: date.replace(/-/g, '.'),
                status: "NEW"
            });
        }
    });
    return pageItems;
}

async function fetchAll() {
    let allResults = [];
    let page = 1;
    while (true) {
        console.error(`Page ${page}...`);
        const items = await fetchMfdsPage(page);
        if (items.length === 0) break;
        allResults = allResults.concat(items);
        page++;
        if (page > 20) break;
        await new Promise(r => setTimeout(r, 100));
    }
    console.log(JSON.stringify(allResults, null, 2));
}

fetchAll();
