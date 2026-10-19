// 1단계: KBL 공식 API가 실제로 응답하는지, 응답 모양이 어떤지 확인하는 점검용 스크립트.
// 결과는 raw/probe.json 에 저장됩니다. 파서(scores.json 생성)는 이 결과를 보고 만들어요.
import fs from 'node:fs';

const BASE = 'https://api.kbl.or.kr';
const kst = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const ymd = kst.replaceAll('-', '');

// 아래 주소와 파라미터 이름은 제3자 문서에서 본 것이라 틀릴 수 있어요. 여러 형태를 시도해요.
const tries = [
  ['match-list', '/match/list'],
  ['match-list-date', `/match/list?date=${kst}`],
  ['match-list-gameDate', `/match/list?gameDate=${ymd}`],
  ['match-list-matchDate', `/match/list?matchDate=${kst}`],
  ['team-rank', '/league/rank/team'],
];

const out = { checkedAt: new Date().toISOString(), results: [] };
for (const [name, path] of tries) {
  const url = BASE + path;
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (zikgwan-app)', accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    out.results.push({
      name, url, status: res.status,
      contentType: res.headers.get('content-type'),
      length: text.length,
      sample: text.slice(0, 4000),
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
