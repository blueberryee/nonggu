// KBL 공식 API에서 끝난 정규시즌 경기 스코어를 가져와 scores.json 으로 저장해요.
// 형식: {updated, games:[{date:'YYYY-MM-DD', home:'DB', away:'가스공사', hs, as, final:true}]}
import fs from 'node:fs';

const BASE = 'https://api.kbl.or.kr';
const HEADERS = {
  accept: 'application/json, text/plain, */*',
  channel: 'WEB',
  lang: 'ko',
  teamcode: 'XX',
  origin: 'https://kbl.or.kr',
  referer: 'https://kbl.or.kr/',
  'user-agent': 'Mozilla/5.0 (zikgwan-app)',
};
// 팀 코드(tcodeH/tcodeA) -> 앱에서 쓰는 팀 이름
const TEAM = {
  '16': 'DB', '60': 'KCC', '06': 'KT', '50': 'LG', '55': 'SK',
  '64': '가스공사', '10': '모비스', '35': '삼성', '66': '소노', '70': '정관장',
};

const SEASON_START = { y: 2026, m: 10 };
const kstNow = new Date(Date.now() + 9 * 3600e3);
const endY = kstNow.getUTCFullYear(), endM = kstNow.getUTCMonth() + 1;

const months = [];
for (let y = SEASON_START.y, m = SEASON_START.m; y < endY || (y === endY && m <= endM); ) {
  months.push([y, m]);
  if (++m > 12) { m = 1; y++; }
}

const pad = n => String(n).padStart(2, '0');
const games = [];
let okCount = 0;
for (const [y, m] of months) {
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const url = `${BASE}/match/list?fromDate=${y}${pad(m)}01&toDate=${y}${pad(m)}${pad(last)}&tcodeList=all`;
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error('unexpected response');
    okCount++;
    for (const g of list) {
      if (g.seasonCategory !== 'R' || g.isEnded !== 1) continue;
      const home = TEAM[g.tcodeH], away = TEAM[g.tcodeA];
      const hs = Number(g.scoreH), as = Number(g.scoreA);
      if (!home || !away || !Number.isFinite(hs) || !Number.isFinite(as)) continue;
      const d = String(g.gameDate);
      games.push({ date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, home, away, hs, as, final: true });
    }
    console.log(`${y}-${pad(m)}: ok`);
  } catch (e) {
    console.log(`${y}-${pad(m)}: fail ${e}`);
  }
}
if (!okCount) { console.error('모든 요청이 실패했어요'); process.exit(1); }

games.sort((a, b) => (a.date + a.home).localeCompare(b.date + b.home));
let prev = null;
try { prev = JSON.parse(fs.readFileSync('scores.json', 'utf8')); } catch {}
if (!prev || JSON.stringify(prev.games) !== JSON.stringify(games)) {
  fs.writeFileSync('scores.json', JSON.stringify({ updated: new Date().toISOString(), games }, null, 1));
  console.log(`scores.json 갱신: ${games.length}경기`);
} else {
  console.log('변경 없음');
}
