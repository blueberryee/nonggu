// 2단계: KBL 사이트가 보내는 것과 같은 헤더(Channel/Lang/Teamcode)로 경기 목록을 요청해 응답 모양을 확인해요.
// 결과는 raw/probe.json 에 저장됩니다. 파서(scores.json 생성)는 이 결과를 보고 만들어요.
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

const tries = [
  ['match-list-2026-10', '/match/list?fromDate=20261001&toDate=20261031&tcodeList=all'],
  ['match-list-2026-09', '/match/list?fromDate=20260901&toDate=20260930&tcodeList=all'],
];

const out = { checkedAt: new Date().toISOString(), results: [] };
for (const [name, path] of tries) {
  const url = BASE + path;
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
    const text = await res.text();
    out.results.push({
      name, url, status: res.status,
      contentType: res.headers.get('content-type'),
      length: text.length,
      sample: text.slice(0, 6000),
    });
  } catch (e) {
    out.results.push({ name, url, error: String(e) });
  }
}
fs.mkdirSync('raw', { recursive: true });
fs.writeFileSync('raw/probe.json', JSON.stringify(out, null, 2));
if (!fs.existsSync('scores.json')) {
  fs.writeFileSync('scores.json', JSON.stringify({ updated: null, games: [] }, null, 2));
}
console.log(out.results.map(r => `${r.name}: ${r.status ?? r.error}`).join('\n'));
