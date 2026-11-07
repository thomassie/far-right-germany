/* Europe's Divides: The Far Right in Germany (D3 v7), drawn into one element:

     <div id="far-right-germany" data-base="https://<data host>/"></div>

   data-base       where data/*.json live (default: next to the page)
   data-header     "false" leaves out the built-in title (when the host page has its own)
   data-layout     "standalone" adds the page's own width and side gutters

   Reads data/*.json, written by pipeline/run.py from mart.de_* (MotherDuck), and data/counties.topo.json
   (county boundaries of each federal election, BKG VG-Hist). No database access here.
   Styles: germany.css (scoped under .dfr); colours come from the host's tokens or theme.css.
   One meaning per colour: red = far right, ink = the national (federal) result. */
(function () {
  'use strict';

  const root = document.getElementById('far-right-germany');
  if (!root || typeof d3 === 'undefined') return;
  const BASE = root.dataset.base ? root.dataset.base.replace(/\/?$/, '/') : '';
  root.classList.add('dfr');
  if (root.dataset.layout === 'standalone') root.classList.add('dfr--standalone');

  const DOT = '<svg class="title-dot" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="5"/></svg>';
  root.innerHTML = `<svg class="dfr-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
  <pattern id="dfr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect class="dfr-hatch-bg" width="5" height="5"/><line class="dfr-hatch-line" x1="0" y1="0" x2="0" y2="5"/></pattern>
</defs></svg>
<div class="masthead wrap">
  <div class="masthead__text">
    <p class="eyebrow">Europe&rsquo;s Divides</p>
    <h1>The Far Right in Germany${DOT}</h1>
    <p class="lede">Every state and federal election since 1946: how far-right parties rose, fell and rose again.</p>
  </div>
</div>
<div class="wrap">
  <section class="hero" aria-label="In short">
    <div class="hero__item">
      <p class="hero__label"><i class="dfr-sw dfr-sw--red"></i>Best result in a state election</p>
      <p class="hero__figure" id="dfr-best">&nbsp;</p>
      <p class="hero__text" id="dfr-best-text"></p>
    </div>
    <div class="hero__item">
      <p class="hero__label"><i class="dfr-sw dfr-sw--red"></i>State parliaments with far-right members</p>
      <p class="hero__figure" id="dfr-now">&nbsp;</p>
      <p class="hero__text" id="dfr-now-text"></p>
    </div>
  </section>

  <section class="block" aria-labelledby="dfr-h-all">
    <div class="block__rail">
      <h2 id="dfr-h-all">Every election since 1946${DOT}</h2>
      <p>Each dot is the far right&rsquo;s share of the vote in one election in one of the 16 states. The line with squares is the federal result for Germany as a whole.</p>
      <p>The far right has come in waves. Each of the first four ebbed within a few years. The current one, carried by the AfD since 2015, has not.</p>
    </div>
    <div class="block__body">
      <div class="filters">
        <div class="seg" id="dfr-level" role="group" aria-label="Elections"></div>
      </div>
      <div class="dfr-tools">
        <label class="dfr-find" for="dfr-follow">Follow a state</label>
        <select id="dfr-follow"></select>
      </div>
      <div class="dfr-key" id="dfr-key"></div>
      <div class="chart" id="dfr-arc"></div>
      <p class="note" id="dfr-arc-note"></p>
    </div>
  </section>

  <section class="block" aria-labelledby="dfr-h-parl">
    <div class="block__rail">
      <h2 id="dfr-h-parl">In the state parliaments${DOT}</h2>
      <p>Each row is a state, each red stretch a term in which far-right members sat in its parliament. A party needs 5% of the vote for seats (Bremen counts its two cities separately).</p>
      <p>The line above counts how many parliaments had far-right members at the time.</p>
    </div>
    <div class="block__body">
      <div class="chart" id="dfr-parl"></div>
      <p class="note">Hatched: no free elections (the east before 1990). Berlin 1950&ndash;1990 means West Berlin. The Saarland&rsquo;s elections before it joined the Federal Republic in 1957 are included as published.</p>
    </div>
  </section>

  <section class="block" aria-labelledby="dfr-h-states">
    <div class="block__rail">
      <h2 id="dfr-h-states">State by state${DOT}</h2>
      <p>The far right&rsquo;s share in each state&rsquo;s own elections (red) and, in the same state, in federal elections (squares). Ordered by the latest state election.</p>
    </div>
    <div class="block__body">
      <div class="dfr-key" id="dfr-key2"></div>
      <div class="dfr-panels" id="dfr-panels"></div>
    </div>
  </section>

  <section class="block" aria-labelledby="dfr-h-map">
    <div class="block__rail">
      <h2 id="dfr-h-map">County by county${DOT}</h2>
      <p>The far right&rsquo;s share of the second vote in every county in federal elections since 1953, within the county boundaries of the day.</p>
      <p>The strongholds have moved: in 1953 the DRP did best in Lower Saxony and Rhenish Hesse, in 1969 the NPD in the rural Palatinate, Rhenish Hesse and Franconia, in 1990 the Republikaner in Bavaria. Since 2005 the strongest counties have all been in the east, mostly in Saxony and Thuringia.</p>
    </div>
    <div class="block__body">
      <div class="seg dfr-years" id="dfr-year" role="group" aria-label="Federal election"></div>
      <div class="dfr-mapkey" id="dfr-mapkey"></div>
      <div class="chart dfr-map" id="dfr-map"></div>
      <p class="note" id="dfr-map-note"></p>
    </div>
  </section>

  <section class="block" aria-labelledby="dfr-h-towns">
    <div class="block__rail">
      <h2 id="dfr-h-towns">Town by town${DOT}</h2>
      <p>The federal elections of 2017, 2021 and 2025 in all of Germany&rsquo;s some 10,700 municipalities. Many small municipalities count their postal votes together; they are shown as one area, so that every area holds all of its votes.</p>
      <p>In 2025 the AfD won more than half of the second votes in 100 areas, all in the east, led by Schnaudertal in Saxony-Anhalt (58.0%); in 2021 it had passed 40% in 18. In the west its strongest areas lie in the Bavarian Forest and in parts of Baden-W&uuml;rttemberg, none above 40%.</p>
    </div>
    <div class="block__body">
      <div class="seg dfr-years" id="dfr-tyear" role="group" aria-label="Federal election"></div>
      <div class="dfr-tools">
        <label class="dfr-find" for="dfr-tfind">Find a municipality</label>
        <input id="dfr-tfind" class="dfr-search" type="search" list="dfr-tnames" autocomplete="off" placeholder="e.g. Görlitz">
        <datalist id="dfr-tnames"></datalist>
        <span class="dfr-zoom" role="group" aria-label="Zoom">
          <button type="button" id="dfr-tzin" aria-label="Zoom in">+</button><button type="button" id="dfr-tzout" aria-label="Zoom out">&minus;</button><button type="button" id="dfr-tzreset">Reset</button>
        </span>
      </div>
      <div class="dfr-mapkey" id="dfr-tkey"></div>
      <div class="chart dfr-map dfr-tmap" id="dfr-tmap"></div>
      <p class="note" id="dfr-tmap-note"></p>
    </div>
  </section>

  <section class="block" aria-labelledby="dfr-h-parties">
    <div class="block__rail">
      <h2 id="dfr-h-parties">What counts as far right${DOT}</h2>
      <p>Parties classed as far right by the PopuList, a classification by political scientists used across Europe, and, for parties it does not cover, by the research literature on the German far right.</p>
      <p>The AfD counts from 2015, as in the PopuList. Its results in 2013 and 2014 are shown as hollow circles and not added in.</p>
    </div>
    <div class="block__body">
      <div class="tablewrap dfr-tablewrap"><table id="dfr-parties"></table></div>
    </div>
  </section>
</div>
<footer class="wrap foot">
  <h2>How this is counted</h2>
  <div>
    <ul>
      <li>Shares are of valid votes: in state elections the vote that decides the seats (the second vote where there are two; Bavaria: first and second votes together; Hamburg from 2008 and Bremen from 2011: all five votes), in federal elections the second vote (1949: the only vote).</li>
      <li>Federal results for Germany as a whole cover the former West Germany without West Berlin until 1987, and all of Germany from 1990.</li>
      <li>The far right is the sum of all lists counted as far right in that election. The list of parties, with sources, is in the table above.</li>
      <li>Baden-W&uuml;rttemberg was formed in 1952; its forerunners W&uuml;rttemberg-Baden, Baden and W&uuml;rttemberg-Hohenzollern (1946&ndash;1950) are shown under it. Berlin 1950&ndash;1989 means West Berlin. Berlin&rsquo;s 2021 election was repeated in full in February 2023; the repeat is shown.</li>
      <li>Brandenburg 1990 is missing from the federal compilation and comes from the Brandenburg statistical office, which groups the smallest parties under &ldquo;others&rdquo;; its far-right share is a lower bound.</li>
      <li>County maps: second votes by Landkreis and kreisfreie Stadt from the federal returning officer&rsquo;s county files, drawn on the county boundaries valid on election day. The files for 1957, 1965 and 1980 count the far-right list among &ldquo;others&rdquo;, so these elections have no map. The files for 1957&ndash;1965 leave out postal votes, and from 1990 a few postal votes could not be assigned to a county. Berlin is shown as one unit.</li>
      <li>Municipality maps: second votes from the federal returning officer&rsquo;s results by polling district (2017, 2021, 2025), added up by municipality and drawn on the municipal boundaries of election day. Where small municipalities count their postal votes together (an Amt, Verbandsgemeinde or Samtgemeinde), they are shown as one area; a few tiny municipalities whose ballots were counted with a neighbour&rsquo;s are part of the neighbour&rsquo;s area. The areas add up exactly to the official result of each state.</li>
      <li>Not counted: Freie Sachsen (2.2% in Saxony 2024) and other lists that none of the classifications used here covers.</li>
    </ul>
    <p class="credit" id="dfr-credit">Election results: Die Bundeswahlleiterin, <a href="https://www.bundeswahlleiterin.de/dam/jcr/a333e523-0717-42ad-a772-d5ad7e7e97cc/ltw_erg_gesamt.pdf">Ergebnisse früherer Landtagswahlen</a> (as of 13 October 2026) and <a href="https://bundeswahlleiterin.de/dam/jcr/397735e3-0585-46f6-a0b5-2c60c5b83de6/btw_ab49_gesamt.pdf">Ergebnisse früherer Bundestagswahlen</a> (June 2025), Wiesbaden; Brandenburg 1990: Landesamt f&uuml;r Datenverarbeitung und Statistik Brandenburg, <a href="https://www.statistischebibliothek.de/mir/servlets/MCRFileNodeServlet/BBHeft_derivate_00010767/SB_B7-2-1_5j-99_BBa.pdf">Statistischer Bericht B VII 2-1 5j/99</a>. Classification: <a href="https://popu-list.org">The PopuList 4.0</a> (Rooduijn et al. 2024); R. St&ouml;ss (1993), <a href="https://www.bpb.de/shop/zeitschriften/apuz/archiv/536428/rechtsextremismus-und-wahlen-in-der-bundesrepublik/">Rechtsextremismus und Wahlen in der Bundesrepublik</a>; J. Schedler (2021), <a href="https://www.bpb.de/kurz-knapp/lexika/handwoerterbuch-politisches-system/202097/extrem-rechte-parteien/">(Extrem) rechte Parteien</a>; the far-right list of <a href="https://doi.org/10.1038/s41597-025-04811-5">GERDA</a> (Heddesheimer et al. 2025) for the smallest parties. Results by county: Die Bundeswahlleiterin, <a href="https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/weitere-ergebnisse.html">Ergebnisse nach kreisfreien St&auml;dten und Landkreisen</a> (one file per federal election, 1953&ndash;2025). County boundaries: &copy; <a href="https://www.bkg.bund.de">BKG</a> (2026) <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>, VG-Hist, <a href="https://sgx.geodatenzentrum.de/web_public/gdz/datenquellen/datenquellen_vg-hist.pdf">Datenquellen</a>; changed: generalised, and counties merged where the results merge them. Results by polling district: Die Bundeswahlleiterin, <a href="https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/weitere-ergebnisse.html">Wahlbezirksstatistik</a> (2017, 2021, 2025). Municipal boundaries: &copy; <a href="https://www.bkg.bund.de">BKG</a> (2026) <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>, VG250, <a href="https://sgx.geodatenzentrum.de/web_public/gdz/datenquellen/datenquellen_vg_nuts.pdf">Datenquellen</a>; changed: generalised, and municipalities merged where they count postal votes together.</p>
  </div>
</footer>`;
  if (root.dataset.header === 'false') root.querySelector('.masthead').remove();

  // ---------- settings ----------
  const STATES = {
    SH: 'Schleswig-Holstein', HH: 'Hamburg', NI: 'Lower Saxony', HB: 'Bremen', NW: 'North Rhine-Westphalia',
    HE: 'Hesse', RP: 'Rhineland-Palatinate', BW: 'Baden-Württemberg', BY: 'Bavaria', SL: 'Saarland', BE: 'Berlin',
    BB: 'Brandenburg', MV: 'Mecklenburg-Vorpommern', SN: 'Saxony', ST: 'Saxony-Anhalt', TH: 'Thuringia',
  };
  const EAST = new Set(['BB', 'MV', 'SN', 'ST', 'TH']);
  const TERRITORY = { 'West Berlin': 'West Berlin', Berlin: 'Berlin (all sectors)', 'Württemberg-Baden': 'Württemberg-Baden',
    Baden: 'Baden', 'Württemberg-Hohenzollern': 'Württemberg-Hohenzollern' };
  // the waves, as dated in the literature (Stöss 1993 for the first three)
  const WAVES = [
    { from: 1949.5, to: 1952.9, label: 'SRP', short: 'SRP' },
    { from: 1966, to: 1969.9, label: 'NPD', short: 'NPD' },
    { from: 1989, to: 1998.9, label: 'REP, DVU', short: 'REP' },
    { from: 2004, to: 2011.9, label: 'NPD (east)', short: 'NPD' },
    { from: 2014.9, to: 2026.9, label: 'AfD', short: 'AfD' },
  ];
  const T0 = new Date(1946, 0, 1), T1 = new Date(2027, 0, 1);
  const state = { level: 'state', follow: '' };
  const STORE = { level: 'dfr-level', follow: 'dfr-follow' };
  try {
    const l = localStorage.getItem(STORE.level); if (l === 'state' || l === 'federal') state.level = l;
    const f = localStorage.getItem(STORE.follow); if (f === '' || STATES[f]) state.follow = f || '';
  } catch (e) { /* storage unavailable */ }

  let ELECTIONS = [], PARTIES = new Map();
  const VIEWS = {};

  // ---------- helpers ----------
  const $ = (sel) => root.querySelector(sel.replace(/#([\w-]+)/g, '#dfr-$1'));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f1 = d3.format('.1f');
  const pct = (v) => (v == null ? '–' : f1(v) + '%');
  const fmtDate = d3.timeFormat('%-d %b %Y');
  const parseDate = d3.timeParse('%Y-%m-%d');
  const yearOf = (d) => d.getFullYear() + d.getMonth() / 12;

  async function getJSON(path) {
    const r = await fetch(BASE + path + '?m=' + Math.floor(Date.now() / 60000), { cache: 'no-cache' });
    if (!r.ok) throw new Error('Could not load ' + BASE + path + ' (' + r.status + ').');
    return r.json();
  }

  function onWidth(el, draw) {
    let last = -1;
    const run = () => {
      const w = Math.round(el.clientWidth);
      if (w && w !== last) { last = w; draw(); }
    };
    if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(run)).observe(el);
    else window.addEventListener('resize', run);
    run();
    return () => { last = -1; run(); };
  }

  function tooltip(container) {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.hidden = true;
    tip.setAttribute('role', 'status');
    container.appendChild(tip);
    return {
      show(html, x, y) {
        tip.innerHTML = html;
        tip.hidden = false;
        const cw = container.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        let left = x + 14;
        if (left + tw > cw) left = Math.max(0, x - tw - 14);
        let top = y - th - 12;
        if (top < 0) top = y + 16;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      },
      hide() { tip.hidden = true; },
      el: tip,
    };
  }

  function buildSeg(el, items, key, onPick) {
    el.innerHTML = '';
    items.forEach(([val, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.setAttribute('aria-pressed', String(state[key] === val));
      b.addEventListener('click', () => {
        if (state[key] === val) return;
        state[key] = val;
        try { localStorage.setItem(STORE[key], val); } catch (e) { /* ignore */ }
        el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        onPick(val);
      });
      el.appendChild(b);
    });
  }

  // ---------- tooltip content ----------
  function electionTip(e) {
    const where = e.a === 'DE' ? 'Germany' : e.a === 'FBG' ? 'West Germany (without West Berlin)' : STATES[e.a];
    const kind = e.lv === 'state' ? 'State election' : 'Federal election';
    const terr = TERRITORY[e.t] ? ' · ' + TERRITORY[e.t] : '';
    let html = '<p class="tt__meta">' + kind + terr + '</p><p class="tt__title">' + esc(where) + ', ' + fmtDate(e.date) + '</p>';
    html += '<table class="tt__tab"><tbody>';
    if (e.ps.length) {
      e.ps.forEach((p) => {
        html += '<tr><th>' + esc(p.l) + '</th><td>' + pct(p.pct) + '</td>' + (e.lv === 'state' ? '<td>' + (p.s ? p.s + ' seats' : '') + '</td>' : '') + '</tr>';
      });
      if (e.ps.length > 1) html += '<tr class="tt__sub"><th>Far right together</th><td>' + pct(e.f) + '</td>' + (e.lv === 'state' ? '<td>' + (e.fs ? e.fs + ' seats' : '') + '</td>' : '') + '</tr>';
    } else {
      html += '<tr><th>Far right</th><td>none on the ballot</td></tr>';
    }
    if (e.afd0 != null) html += '<tr><th>AfD (not counted)</th><td>' + pct(e.afd0) + '</td>' + (e.lv === 'state' ? '<td></td>' : '') + '</tr>';
    if (e.to != null) html += '<tr class="tt__sub"><th>Turnout</th><td>' + pct(e.to) + '</td>' + (e.lv === 'state' ? '<td></td>' : '') + '</tr>';
    html += '</tbody></table>';
    const notes = [];
    if (e.afd0 != null) notes.push('The PopuList classes the AfD as far right from 2015.');
    if (e.a === 'BB' && e.lv === 'state' && e.year === 1990) notes.push('Small parties are grouped under others in the source; a lower bound.');
    if (e.a === 'BE' && e.lv === 'state' && e.year === 2023) notes.push('Repeat of the 2021 election, which a court annulled.');
    if (e.note) notes.push(e.note.replace('zur verfassungsgebenden Landesversammlung', 'Constituent assembly of Baden-Württemberg'));
    if (notes.length) html += '<p class="tt__note">' + notes.map(esc).join(' ') + '</p>';
    return html;
  }

  // ---------- hero ----------
  function renderHero() {
    const st = ELECTIONS.filter((e) => e.lv === 'state');
    const best = st.reduce((a, b) => (b.f > a.f ? b : a));
    $('#best').innerHTML = f1(best.f) + '<small>%</small>';
    const prev = st.filter((e) => e.year < 2015).reduce((a, b) => (b.f > a.f ? b : a));
    $('#best-text').textContent = (best.ps[0] ? best.ps[0].l : 'Far right') + ' in ' + STATES[best.a] + ', ' + best.year +
      '. Before the AfD, the best was ' + f1(prev.f) + '% (' + prev.ps.map((p) => p.l).join(', ') + ' in ' + STATES[prev.a] + ', ' + prev.year + ').';
    const latest = d3.rollup(st, (v) => v.reduce((a, b) => (b.date > a.date ? b : a)), (e) => e.a);
    const now = [...latest.values()].filter((e) => e.fs > 0);
    const without = [...latest.values()].filter((e) => !(e.fs > 0)).map((e) => STATES[e.a]);
    const maxBefore = d3.max(PARL.count.filter((c) => c.year < 2014), (c) => c.n);
    $('#now').innerHTML = now.length + '<small> of 16</small>';
    $('#now-text').textContent = 'after each state’s latest election' + (without.length ? ' (not ' + without.join(', ') + ')' : '') +
      '. Before 2014, never more than ' + maxBefore + ' at the same time.';
  }

  // ---------- parliament timeline (computed once) ----------
  const PARL = { rows: [], count: [] };
  function computeParliaments() {
    const st = ELECTIONS.filter((e) => e.lv === 'state');
    const byState = d3.group(st, (e) => e.a);
    const rows = [];
    Object.keys(STATES).forEach((code) => {
      // Baden-Württemberg's three forerunners (1946-1950) are left out of the row: three parliaments,
      // none with far-right members; Berlin and West Berlin form one row
      const FORERUNNER = new Set(['Württemberg-Baden', 'Baden', 'Württemberg-Hohenzollern']);
      const list = (byState.get(code) || []).filter((e) => !FORERUNNER.has(e.t)).sort((a, b) => a.date - b.date);
      const terms = list.map((e, i) => ({ e, from: e.date, to: i + 1 < list.length ? list[i + 1].date : T1 }));
      rows.push({ code, terms, first: list.length ? list[0].date : null });
    });
    PARL.rows = rows;
    // count of parliaments with far-right members, at every change
    const events = new Set();
    rows.forEach((r) => r.terms.forEach((t) => { events.add(+t.from); }));
    const times = [...events].sort((a, b) => a - b);
    PARL.count = times.map((t) => {
      const n = rows.filter((r) => r.terms.some((x) => +x.from <= t && t < +x.to && x.e.fs > 0)).length;
      return { date: new Date(t), year: new Date(t).getFullYear(), n };
    });
  }

  // ---------- main chart: every election ----------
  function drawArc(el) {
    const W = Math.round(el.clientWidth);
    if (!W) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const small = W < 560;
    const H = Math.round(Math.max(300, Math.min(W * 0.58, 520)));
    const m = { t: small ? 34 : 22, r: 12, b: 28, l: small ? 30 : 36 };
    const x = d3.scaleTime().domain([T0, T1]).range([m.l, W - m.r]);
    const ymax = 45;
    const y = d3.scaleLinear().domain([0, ymax]).range([H - m.b, m.t]);
    const pts = ELECTIONS.filter((e) => e.lv === state.level && STATES[e.a]);
    const nat = ELECTIONS.filter((e) => e.lv === 'federal' && (e.a === 'DE' || e.a === 'FBG')).sort((a, b) => a.date - b.date);

    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img').attr('aria-label', 'Far-right share in every ' + (state.level === 'state' ? 'state' : 'federal') +
        ' election by state since 1946, with the federal result for Germany as a line. Highest: ' + f1(d3.max(pts, (e) => e.f)) + '%.');
    // waves
    const wv = svg.append('g').attr('class', 'dfr-waves');
    WAVES.forEach((w, i) => {
      const x0 = x(new Date(Math.floor(w.from), Math.round((w.from % 1) * 12), 1));
      const x1 = x(new Date(Math.floor(w.to), Math.round((w.to % 1) * 12), 1));
      wv.append('rect').attr('x', x0).attr('width', Math.max(2, x1 - x0)).attr('y', m.t).attr('height', H - m.b - m.t);
      wv.append('text').attr('class', 'dfr-wave-label').attr('x', (x0 + x1) / 2).attr('y', m.t - 8 - (small && i % 2 ? 12 : 0))
        .attr('text-anchor', 'middle').text(small ? w.short : w.label);
    });
    const g = svg.append('g').attr('class', 'grid');
    const yt = [0, 10, 20, 30, 40];
    g.selectAll('line.h').data(yt).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', (d) => Math.round(y(d)) + 0.5).attr('y2', (d) => Math.round(y(d)) + 0.5);
    svg.append('g').selectAll('text').data(yt).join('text').attr('class', 'tick').attr('x', m.l - 6).attr('y', (d) => y(d)).attr('dy', '0.32em')
      .attr('text-anchor', 'end').text((d, i) => (i === yt.length - 1 ? d + '%' : d));
    const xt = small ? [1950, 1970, 1990, 2010] : [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
    svg.append('g').selectAll('text').data(xt).join('text').attr('class', 'tick').attr('x', (d) => x(new Date(d, 0, 1))).attr('y', H - m.b + 16)
      .attr('text-anchor', 'middle').text((d) => d);
    // a line per state, connecting its elections
    const line = d3.line().x((e) => x(e.date)).y((e) => y(e.f));
    const byState = d3.group(pts, (e) => e.a);
    const lines = svg.append('g').selectAll('path').data([...byState]).join('path').attr('class', 'dfr-stateline')
      .attr('d', ([, v]) => line(v.slice().sort((a, b) => a.date - b.date)));
    // AfD before 2015 (not counted): hollow circles
    const pre = pts.filter((e) => e.afd0 != null);
    svg.append('g').selectAll('circle').data(pre).join('circle').attr('class', 'dfr-pre').attr('r', small ? 3 : 3.6)
      .attr('cx', (e) => x(e.date)).attr('cy', (e) => y(e.afd0));
    // the national federal result
    svg.append('path').attr('class', 'dfr-natline').attr('d', line(nat));
    const sq = small ? 6 : 7;
    svg.append('g').selectAll('rect').data(nat).join('rect').attr('class', 'dfr-nat').attr('width', sq).attr('height', sq)
      .attr('x', (e) => x(e.date) - sq / 2).attr('y', (e) => y(e.f) - sq / 2);
    // the elections
    const r = small ? 3 : 3.6;
    const dots = svg.append('g').selectAll('circle').data(pts).join('circle').attr('class', 'dfr-dot').attr('r', r)
      .attr('cx', (e) => x(e.date)).attr('cy', (e) => y(e.f));
    const ring = svg.append('circle').attr('class', 'focus-ring').attr('r', r + 3).attr('visibility', 'hidden');
    const label = svg.append('text').attr('class', 'dfr-follow-label').attr('visibility', 'hidden');

    const mark = (code) => {
      svg.classed('has-follow', !!code);
      lines.classed('is-on', ([c]) => c === code);
      dots.classed('is-on', (e) => e.a === code);
      if (code && byState.get(code)) {
        const last = byState.get(code).reduce((a, b) => (b.date > a.date ? b : a));
        label.attr('visibility', 'visible').attr('x', Math.min(x(last.date) - 6, W - m.r)).attr('y', y(last.f) - 10)
          .attr('text-anchor', 'end').text(STATES[code]);
      } else label.attr('visibility', 'hidden');
    };
    VIEWS.arc = { mark };
    const show = (e) => {
      const a = el.getBoundingClientRect(), b = svg.node().getBoundingClientRect();
      const cy = e.f;
      ring.attr('visibility', 'visible').attr('cx', x(e.date)).attr('cy', y(cy));
      tip.show(electionTip(e), b.left - a.left + x(e.date), b.top - a.top + y(cy));
    };
    const all = pts.concat(nat);
    svg.append('rect').attr('class', 'overlay').attr('width', W).attr('height', H).attr('aria-hidden', 'true')
      .on('pointermove pointerdown', (ev) => {
        const [px, py] = d3.pointer(ev);
        let best = null, bd = 14;
        all.forEach((e) => { const d = Math.hypot(x(e.date) - px, y(e.f) - py); if (d < bd) { bd = d; best = e; } });
        if (best) { show(best); mark(best.a === 'DE' || best.a === 'FBG' ? state.follow : best.a); }
        else { tip.hide(); ring.attr('visibility', 'hidden'); mark(state.follow); }
      })
      .on('pointerleave', () => { tip.hide(); ring.attr('visibility', 'hidden'); mark(state.follow); });
    mark(state.follow);

    $('#key').innerHTML = '<span><i class="dfr-sw dfr-sw--red"></i>' + (state.level === 'state' ? 'State election' : 'Federal election, in one state') + '</span>' +
      '<span><i class="dfr-sw dfr-sw--nat"></i>Federal result, Germany</span><span><i class="dfr-sw dfr-sw--pre"></i>AfD before 2015 (not counted)</span>';
    const top = pts.slice().sort((a, b) => b.f - a.f).slice(0, 3)
      .map((e) => STATES[e.a] + ' ' + e.year + ' (' + f1(e.f) + '%)');
    $('#arc-note').textContent = pts.length + ' ' + (state.level === 'state' ? 'state' : 'federal') + ' elections by state. Highest: ' + top.join(', ') + '. Bands mark the waves named above them.';
  }

  // ---------- parliaments timeline ----------
  function drawParl(el) {
    const W = Math.round(el.clientWidth);
    if (!W) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const small = W < 560;
    const lw = small ? 34 : 150;      // row labels
    const rowH = small ? 15 : 17, countH = small ? 70 : 84, gap = 18;
    const codes = Object.keys(STATES);
    const H = countH + gap + codes.length * rowH + 22;
    const x = d3.scaleTime().domain([T0, T1]).range([lw, W - 8]);
    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img').attr('aria-label', 'Terms with far-right members in each state parliament since 1946, and their number over time.');
    // count line
    const yc = d3.scaleLinear().domain([0, 16]).range([countH, 6]);
    const g = svg.append('g').attr('class', 'grid');
    [0, 8, 16].forEach((v) => g.append('line').attr('x1', lw).attr('x2', W - 8).attr('y1', Math.round(yc(v)) + 0.5).attr('y2', Math.round(yc(v)) + 0.5));
    svg.append('g').selectAll('text').data([0, 8, 16]).join('text').attr('class', 'tick').attr('x', lw - 6).attr('y', (d) => yc(d)).attr('dy', '0.32em')
      .attr('text-anchor', 'end').text((d) => d);
    const steps = PARL.count.concat([{ date: T1, n: PARL.count[PARL.count.length - 1].n }]);
    svg.append('path').attr('class', 'dfr-count').attr('d', d3.line().curve(d3.curveStepAfter).x((c) => x(c.date)).y((c) => yc(c.n))(steps));
    svg.append('path').attr('class', 'dfr-count-area').attr('d', d3.area().curve(d3.curveStepAfter).x((c) => x(c.date)).y0(yc(0)).y1((c) => yc(c.n))(steps));
    // rows
    const top = countH + gap;
    const rows = svg.append('g');
    PARL.rows.forEach((r, i) => {
      const y0 = top + i * rowH;
      rows.append('text').attr('class', 'dfr-rowlabel').attr('x', lw - 8).attr('y', y0 + rowH / 2).attr('dy', '0.32em').attr('text-anchor', 'end')
        .text(small ? r.code : STATES[r.code]);
      rows.append('rect').attr('class', 'dfr-rowbg').attr('x', lw).attr('width', W - 8 - lw).attr('y', y0 + 2).attr('height', rowH - 4);
      if (EAST.has(r.code)) rows.append('rect').attr('class', 'dfr-nofree').attr('x', lw).attr('width', x(new Date(1990, 9, 14)) - lw).attr('y', y0 + 2).attr('height', rowH - 4);
      r.terms.filter((t) => t.e.fs > 0).forEach((t) => {
        rows.append('rect').datum(t).attr('class', 'dfr-term').attr('x', x(t.from)).attr('width', Math.max(1.5, x(t.to) - x(t.from) - 1))
          .attr('y', y0 + 2).attr('height', rowH - 4);
      });
    });
    const xt = small ? [1950, 1970, 1990, 2010] : [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
    svg.append('g').selectAll('text').data(xt).join('text').attr('class', 'tick').attr('x', (d) => x(new Date(d, 0, 1))).attr('y', H - 4)
      .attr('text-anchor', 'middle').text((d) => d);
    svg.append('text').attr('class', 'dfr-count-title').attr('x', lw).attr('y', 0).attr('dy', '0.8em').text('Parliaments with far-right members');
    const hl = svg.append('rect').attr('class', 'focus-ring').attr('visibility', 'hidden');
    svg.append('rect').attr('class', 'overlay').attr('width', W).attr('height', H).attr('aria-hidden', 'true')
      .on('pointermove pointerdown', (ev) => {
        const [px, py] = d3.pointer(ev);
        const a = el.getBoundingClientRect(), b = svg.node().getBoundingClientRect();
        const t = x.invert(px);
        if (py < countH + 4 && px >= lw) {
          const c = PARL.count.filter((cc) => cc.date <= t).pop();
          if (!c) { tip.hide(); hl.attr('visibility', 'hidden'); return; }
          const names = PARL.rows.filter((r) => r.terms.some((x2) => x2.from <= t && t < x2.to && x2.e.fs > 0)).map((r) => STATES[r.code]);
          hl.attr('visibility', 'hidden');
          tip.show('<p class="tt__meta">' + fmtDate(t) + '</p><p class="tt__title">' + c.n + (c.n === 1 ? ' parliament' : ' parliaments') + '</p>' +
            (names.length ? '<p class="tt__note">' + esc(names.join(', ')) + '</p>' : ''), b.left - a.left + px, b.top - a.top + yc(c.n));
          return;
        }
        const i = Math.floor((py - top) / rowH);
        const r = PARL.rows[i];
        if (!r || px < lw) { tip.hide(); hl.attr('visibility', 'hidden'); return; }
        const term = r.terms.find((tt) => tt.from <= t && t < tt.to);
        if (!term) { tip.hide(); hl.attr('visibility', 'hidden'); return; }
        const y0 = top + i * rowH;
        hl.attr('visibility', 'visible').attr('x', x(term.from) - 1).attr('y', y0).attr('width', Math.max(3, x(term.to) - x(term.from) + 1)).attr('height', rowH);
        tip.show(electionTip(term.e) + '<p class="tt__note">Term until ' + (term.to >= T1 ? 'today' : fmtDate(term.to)) + '.</p>',
          b.left - a.left + px, b.top - a.top + y0);
      })
      .on('pointerleave', () => { tip.hide(); hl.attr('visibility', 'hidden'); });
  }

  // ---------- small multiples ----------
  function drawPanels(el) {
    const W = Math.round(el.clientWidth);
    if (!W) return;
    const tip = el._tip || (el._tip = tooltip(el));
    [...el.children].forEach((n) => { if (n !== tip.el) n.remove(); });
    tip.hide();
    const cols = W < 520 ? 2 : W < 860 ? 3 : 4;
    const gapX = 18, pw = Math.floor((W - (cols - 1) * gapX) / cols), ph = Math.round(Math.max(120, pw * 0.62));
    const m = { t: 6, r: 6, b: 18, l: 24 };
    const x = d3.scaleTime().domain([T0, T1]).range([m.l, pw - m.r]);
    const y = d3.scaleLinear().domain([0, 45]).range([ph - m.b, m.t]);
    const st = d3.group(ELECTIONS.filter((e) => e.lv === 'state'), (e) => e.a);
    const fe = d3.group(ELECTIONS.filter((e) => e.lv === 'federal'), (e) => e.a);
    const latest = (code) => (st.get(code) || []).reduce((a, b) => (b.date > a.date ? b : a));
    const order = Object.keys(STATES).sort((a, b) => latest(b).f - latest(a).f);
    const grid = document.createElement('div');
    grid.className = 'dfr-panelgrid';
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    el.insertBefore(grid, el.firstChild);
    order.forEach((code) => {
      const box = document.createElement('div');
      box.className = 'dfr-panel';
      const last = latest(code);
      box.innerHTML = '<p class="dfr-panel__name">' + esc(STATES[code]) + '</p><p class="dfr-panel__sub">' + f1(last.f) + '% in ' + last.year + '</p>';
      grid.appendChild(box);
      const svg = d3.select(box).append('svg').attr('width', pw).attr('height', ph).attr('viewBox', `0 0 ${pw} ${ph}`)
        .attr('role', 'img').attr('aria-label', STATES[code] + ': far-right share in state and federal elections; latest state election ' + f1(last.f) + '% (' + last.year + ').');
      const g = svg.append('g').attr('class', 'grid');
      [0, 20, 40].forEach((v) => g.append('line').attr('x1', m.l).attr('x2', pw - m.r).attr('y1', Math.round(y(v)) + 0.5).attr('y2', Math.round(y(v)) + 0.5));
      svg.append('g').selectAll('text').data([0, 20, 40]).join('text').attr('class', 'tick').attr('x', m.l - 4).attr('y', (d) => y(d)).attr('dy', '0.32em')
        .attr('text-anchor', 'end').text((d) => d);
      svg.append('g').selectAll('text').data([1950, 1990, 2020]).join('text').attr('class', 'tick').attr('x', (d) => x(new Date(d, 0, 1))).attr('y', ph - 4)
        .attr('text-anchor', 'middle').text((d) => d);
      if (EAST.has(code)) svg.append('rect').attr('class', 'dfr-nofree').attr('x', m.l).attr('y', m.t).attr('width', x(new Date(1990, 9, 14)) - m.l).attr('height', ph - m.b - m.t);
      const fed = (fe.get(code) || []).slice().sort((a, b) => a.date - b.date);
      const sl = (st.get(code) || []).slice().sort((a, b) => a.date - b.date);
      const ln = d3.line().x((e) => x(e.date)).y((e) => y(e.f));
      svg.append('path').attr('class', 'dfr-panel-fedline').attr('d', ln(fed));
      svg.append('g').selectAll('rect').data(fed).join('rect').attr('class', 'dfr-panel-fed').attr('width', 5).attr('height', 5)
        .attr('x', (e) => x(e.date) - 2.5).attr('y', (e) => y(e.f) - 2.5);
      svg.append('path').attr('class', 'dfr-panel-line').attr('d', ln(sl));
      svg.append('g').selectAll('circle').data(sl.filter((e) => e.afd0 != null)).join('circle').attr('class', 'dfr-pre').attr('r', 2.6)
        .attr('cx', (e) => x(e.date)).attr('cy', (e) => y(e.afd0));
      svg.append('g').selectAll('circle').data(sl).join('circle').attr('class', 'dfr-dot').attr('r', 2.8)
        .attr('cx', (e) => x(e.date)).attr('cy', (e) => y(e.f));
      const ring = svg.append('circle').attr('class', 'focus-ring').attr('r', 5.5).attr('visibility', 'hidden');
      const all = sl.concat(fed);
      svg.append('rect').attr('class', 'overlay').attr('width', pw).attr('height', ph).attr('aria-hidden', 'true')
        .on('pointermove pointerdown', (ev) => {
          const [px, py] = d3.pointer(ev);
          let best = null, bd = 12;
          all.forEach((e) => { const d = Math.hypot(x(e.date) - px, y(e.f) - py); if (d < bd) { bd = d; best = e; } });
          if (!best) { tip.hide(); ring.attr('visibility', 'hidden'); return; }
          ring.attr('visibility', 'visible').attr('cx', x(best.date)).attr('cy', y(best.f));
          const a = el.getBoundingClientRect(), b = svg.node().getBoundingClientRect();
          tip.show(electionTip(best), b.left - a.left + x(best.date), b.top - a.top + y(best.f));
        })
        .on('pointerleave', () => { tip.hide(); ring.attr('visibility', 'hidden'); });
    });
    $('#key2').innerHTML = '<span><i class="dfr-sw dfr-sw--red"></i>State election</span><span><i class="dfr-sw dfr-sw--fed"></i>Federal election, in this state</span>' +
      '<span><i class="dfr-sw dfr-sw--pre"></i>AfD before 2015 (not counted)</span><span><i class="dfr-sw dfr-sw--none"></i>No free elections</span>';
  }

  // ---------- county map ----------
  // TopoJSON decoding (only what the map needs: polygons and a border mesh), so the page needs no
  // further library.
  function topoReader(topo) {
    const t = topo.transform;
    const arcs = topo.arcs.map((a) => {
      if (!t) return a;
      let x = 0, y = 0;
      return a.map(([dx, dy]) => { x += dx; y += dy; return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]]; });
    });
    const arc = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
    const ring = (ids) => { const pts = []; ids.forEach((i, k) => { const a = arc(i); pts.push(...(k ? a.slice(1) : a)); }); return pts; };
    const polys = (g) => (g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []);
    return {
      features(obj) {
        return obj.geometries.filter((g) => g.arcs).map((g) => ({
          type: 'Feature', id: g.id, properties: g.properties || {},
          geometry: { type: 'MultiPolygon', coordinates: polys(g).map((p) => p.map(ring)) },
        }));
      },
      // arcs between two geometries for which keep(a, b) holds; an arc on the outside has a === b
      mesh(obj, keep) {
        const owners = new Map();
        obj.geometries.forEach((g) => polys(g).forEach((p) => p.forEach((r) => r.forEach((i) => {
          const k = i < 0 ? ~i : i;
          if (!owners.has(k)) owners.set(k, []);
          owners.get(k).push(g);
        }))));
        const lines = [];
        owners.forEach((gs, k) => { if (keep(gs[0], gs[1] || gs[0])) lines.push(arcs[k]); });
        return { type: 'MultiLineString', coordinates: lines };
      },
    };
  }

  const AGS = { '01': 'SH', '02': 'HH', '03': 'NI', '04': 'HB', '05': 'NW', '06': 'HE', '07': 'RP', '08': 'BW', '09': 'BY',
    10: 'SL', 11: 'BE', 12: 'BB', 13: 'MV', 14: 'SN', 15: 'ST', 16: 'TH' };
  const BINS = [1, 2, 5, 10, 20, 30, 40, 50];         // far-right share, %: classes c1 (<1) ... c9 (50 and more)
  const BIN_LABELS = ['<1', '1–2', '2–5', '5–10', '10–20', '20–30', '30–40', '40–50', '50+'];
  const rampKey = () => '<div class="dfr-ramp" aria-label="Far-right share of the second vote, percent">' +
    BIN_LABELS.map((l, i) => '<span><i class="dfr-c' + (i + 1) + '"></i>' + l + '</span>').join('') + '<span class="dfr-ramp__unit">%</span></div>';
  const binOf = (v) => (v == null ? 0 : 1 + d3.bisectRight(BINS, v));
  const MAP = { topo: null, reader: null, rows: new Map(), files: [], year: null, cache: new Map() };

  function mapFeatures(year) {
    if (!MAP.cache.has(year)) {
      const obj = MAP.topo.objects['y' + year];
      const feats = MAP.reader.features(obj);
      const data = MAP.rows.get(year) || new Map();
      feats.forEach((f) => { f.properties.r = data.get(f.id) || null; });
      MAP.cache.set(year, {
        feats,
        states: MAP.reader.mesh(obj, (a, b) => a !== b && a.properties && b.properties && a.properties.s !== b.properties.s),
        outline: MAP.reader.mesh(obj, (a, b) => a === b),
      });
    }
    return MAP.cache.get(year);
  }

  function countyTip(f, file) {
    const p = f.properties, r = p.r;
    let html = '<p class="tt__meta">Federal election ' + file.y + ' · ' + esc(STATES[AGS[p.s]] || '') + '</p><p class="tt__title">' + esc(p.n) + '</p>';
    if (!file.ok) return html + '<p class="tt__note">No county figures for the far right in this election.</p>';
    if (!r) return html;
    html += '<table class="tt__tab"><tbody>';
    const lists = r.ps ? r.ps.split('|').map((x) => { const i = x.lastIndexOf(':'); return [x.slice(0, i), +x.slice(i + 1)]; }) : [];
    if (lists.length) {
      lists.forEach(([l, v]) => { html += '<tr><th>' + esc(l) + '</th><td>' + pct(v) + '</td></tr>'; });
      if (lists.length > 1) html += '<tr class="tt__sub"><th>Far right together</th><td>' + pct(r.f) + '</td></tr>';
    } else html += '<tr><th>Far right</th><td>no list on the ballot</td></tr>';
    if (r.a0 != null) html += '<tr><th>AfD (not counted)</th><td>' + pct(r.a0) + '</td></tr>';
    html += '<tr class="tt__sub"><th>Valid second votes</th><td>' + d3.format(',')(r.v) + '</td></tr></tbody></table>';
    return html;
  }

  function drawMap(el) {
    const W = Math.round(el.clientWidth);
    if (!W || !MAP.topo) return;
    el.querySelectorAll('svg, .dfr-map__msg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const file = MAP.files.find((x) => x.y === MAP.year);
    const { feats, states, outline } = mapFeatures(MAP.year);
    const counties = feats.filter((f) => f.properties.s);
    const others = feats.filter((f) => !f.properties.s);
    const all = { type: 'FeatureCollection', features: feats };
    const probe = d3.geoIdentity().reflectY(true).fitWidth(W, all);
    const b = d3.geoPath(probe).bounds(all);
    const H = Math.round(Math.min(b[1][1] - b[0][1], Math.max(420, Math.min(W * 1.35, 760))));
    const proj = d3.geoIdentity().reflectY(true).fitExtent([[2, 2], [W - 2, H - 2]], all);
    const path = d3.geoPath(proj);
    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img');
    svg.append('g').selectAll('path').data(others).join('path')
      .attr('class', (f) => (f.id === 'gdr' ? 'dfr-nofree' : 'dfr-novote')).attr('d', path);
    const shapes = svg.append('g').selectAll('path').data(counties).join('path')
      .attr('class', (f) => 'dfr-county ' + (file.ok ? 'dfr-c' + (f.properties.r && f.properties.r.ps ? binOf(f.properties.r.f) : 0) : 'dfr-cx'))
      .attr('d', path);
    svg.append('path').attr('class', 'dfr-statelines').attr('d', path(states));
    svg.append('path').attr('class', 'dfr-outline').attr('d', path(outline));
    const hl = svg.append('path').attr('class', 'focus-ring');
    const show = (ev, f) => {
      hl.attr('d', path(f)).attr('visibility', 'visible');
      const [px, py] = d3.pointer(ev, el);
      tip.show(countyTip(f, file), px, py);
    };
    shapes.on('pointermove pointerdown', show);
    svg.on('pointerleave', () => { tip.hide(); hl.attr('visibility', 'hidden'); });

    // what the map says, in words
    const vals = counties.filter((f) => f.properties.r).map((f) => ({ f: f.properties.r.f, n: f.properties.n, s: f.properties.s, ps: f.properties.r.ps }));
    const notes = [];
    if (file.ok && vals.length) {
      const top = vals.reduce((a, c) => (c.f > a.f ? c : a));
      const cut = top.f >= 30 ? 30 : top.f >= 10 ? 10 : 5;
      const over = vals.filter((v) => v.f >= cut);
      const east = over.filter((v) => +v.s >= 12).length;
      const sorted = vals.map((v) => v.f).sort(d3.ascending);
      notes.push(vals.length + ' counties. Highest: ' + top.n + ', ' + f1(top.f) + '%. Median county: ' + f1(d3.quantileSorted(sorted, 0.5)) + '%. ' +
        cut + '% or more in ' + over.length + (over.length === 1 ? ' county' : ' counties') +
        (MAP.year >= 1990 && over.length ? (east === over.length ? (over.length === 1 ? ', in the east' : over.length === 2 ? ', both in the east' : ', all in the east')
          : east ? ', ' + east + ' of them in the east' : ', none in the east') : '') + '.');
      svg.attr('aria-label', 'Map of the far right’s share of the second vote by county, federal election ' + MAP.year + '. ' + notes[0]);
    } else {
      const msg = document.createElement('p');
      msg.className = 'dfr-map__msg';
      msg.textContent = 'No county figures for the far right in ' + MAP.year + ': the county file counts the ' + file.miss.join(', ') + ' among “others”.';
      el.appendChild(msg);
      svg.attr('aria-label', 'County boundaries of ' + MAP.year + '. ' + msg.textContent);
    }
    if (MAP.year < 1990) notes.push('West Germany only: the east held no free elections, and West Berlin' + (MAP.year < 1957 ? ' and the Saarland' : '') + ' did not take part in federal elections.');
    if (!file.post) notes.push('The county file counts ballot-box votes only; postal votes (' + f1(file.un) + '% of valid votes) were not assigned to counties.');
    else if (file.un >= 0.5) notes.push(f1(file.un) + '% of valid votes (postal votes) could not be assigned to a county.');
    if (file.ok && file.miss.length) notes.push('Not in the county file: ' + file.miss.join(', ') + ' (' + f1(file.missp) + '% of the far-right vote), counted among “others”.');
    if (vals.some((v) => v.ps == null) && file.ok) notes.push('Blank: no far-right list on the ballot in that state.');
    if (MAP.year === 2013) notes.push('The AfD counts as far right from 2015; hover to see its 2013 result.');
    $('#map-note').textContent = notes.join(' ');
  }

  function renderMapKey() {
    $('#mapkey').innerHTML = rampKey() +
      '<div class="dfr-key"><span><i class="dfr-sw dfr-sw--blank"></i>No far-right list</span><span><i class="dfr-sw dfr-sw--none"></i>No free elections</span>' +
      '<span><i class="dfr-sw dfr-sw--novote"></i>Not in federal elections</span></div>';
  }

  function setupMap(el) {
    let started = false;
    const start = async () => {
      if (started) return;
      started = true;
      try {
        const [topo, rows, files] = await Promise.all([getJSON('data/counties.topo.json'), getJSON('data/counties.json'), getJSON('data/county_files.json')]);
        MAP.topo = topo;
        MAP.reader = topoReader(topo);
        rows.forEach((r) => { if (!MAP.rows.has(r.y)) MAP.rows.set(r.y, new Map()); MAP.rows.get(r.y).set(r.u, r); });
        MAP.files = files.filter((f) => topo.objects['y' + f.y]);
      } catch (err) {
        el.insertAdjacentHTML('afterbegin', '<p class="error">' + esc(err.message) + '</p>');
        return;
      }
      MAP.year = d3.max(MAP.files.filter((f) => f.ok), (f) => f.y);
      const seg = $('#year');
      MAP.files.forEach((f) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = f.y;
        if (!f.ok) { b.classList.add('is-off'); b.title = 'No county figures for the far right in ' + f.y; }
        b.setAttribute('aria-pressed', String(f.y === MAP.year));
        b.addEventListener('click', () => {
          if (MAP.year === f.y) return;
          MAP.year = f.y;
          seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          redraw();
        });
        seg.appendChild(b);
      });
      renderMapKey();
      const redraw = onWidth(el, () => drawMap(el));
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '800px 0px' });
      io.observe(el);
    } else start();
  }

  // ---------- municipality map ----------
  const TOWN = { year: null, years: [], cache: new Map(), view: null };

  async function townData(year) {
    if (!TOWN.cache.has(year)) {
      const [topo, rows] = await Promise.all([getJSON('data/municipalities_' + year + '.topo.json'), getJSON('data/municipalities_' + year + '.json')]);
      const reader = topoReader(topo);
      const obj = topo.objects.units;
      const byId = new Map(rows.map((r) => [r.u, r]));
      const feats = reader.features(obj);
      feats.forEach((f) => { f.properties.r = byId.get(f.id) || null; });
      TOWN.cache.set(year, {
        feats,
        states: reader.mesh(obj, (a, b) => a !== b && a.properties && b.properties && a.properties.s !== b.properties.s),
        counties: reader.mesh(obj, (a, b) => a !== b && a.properties && b.properties && a.properties.c !== b.properties.c && a.properties.s === b.properties.s),
        outline: reader.mesh(obj, (a, b) => a === b),
        rows,
      });
    }
    return TOWN.cache.get(year);
  }

  function townTip(f, year) {
    const r = f.properties.r;
    if (!r) return '<p class="tt__meta">Federal election ' + year + '</p><p class="tt__title">' +
      (f.id === 'novoters' ? 'Unincorporated area' : 'No result of its own') + '</p><p class="tt__note">' +
      (f.id === 'novoters' ? 'No inhabitants entitled to vote (forest, lake or military area).' : 'Its ballots were counted with a neighbouring municipality’s.') + '</p>';
    let html = '<p class="tt__meta">Federal election ' + year + ' · ' + esc(STATES[AGS[r.u.slice(0, 2)]] || '') + '</p><p class="tt__title">' + esc(r.n) + '</p>';
    if (r.m > 1) {
      const names = r.ms ? r.ms.split('|') : [];
      html += '<p class="tt__note">' + (r.g ? r.m + ' municipalities that count their postal votes together' : r.m + ' municipalities counted together') +
        (names.length ? ': ' + esc(names.slice(0, 8).join(', ')) + (names.length > 8 ? ' and ' + (names.length - 8) + ' more' : '') : '') + '.</p>';
    }
    html += '<table class="tt__tab"><tbody>';
    const lists = r.ps ? r.ps.split('|').map((x) => { const i = x.lastIndexOf(':'); return [x.slice(0, i), +x.slice(i + 1)]; }) : [];
    if (lists.length) {
      lists.forEach(([l, v]) => { html += '<tr><th>' + esc(l) + '</th><td>' + pct(v) + '</td></tr>'; });
      if (lists.length > 1) html += '<tr class="tt__sub"><th>Far right together</th><td>' + pct(r.f) + '</td></tr>';
    } else html += '<tr><th>Far right</th><td>no votes</td></tr>';
    html += '<tr class="tt__sub"><th>Valid second votes</th><td>' + d3.format(',')(r.v) + '</td></tr></tbody></table>';
    return html;
  }

  function drawTowns(el, data) {
    const W = Math.round(el.clientWidth);
    if (!W || !data) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const all = { type: 'FeatureCollection', features: data.feats };
    const probe = d3.geoIdentity().reflectY(true).fitWidth(W, all);
    const b = d3.geoPath(probe).bounds(all);
    const H = Math.round(Math.min(b[1][1] - b[0][1], Math.max(440, Math.min(W * 1.35, 780))));
    const proj = d3.geoIdentity().reflectY(true).fitExtent([[2, 2], [W - 2, H - 2]], all);
    const path = d3.geoPath(proj);
    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img');
    const g = svg.append('g');
    const shapes = g.append('g').selectAll('path').data(data.feats).join('path')
      .attr('class', (f) => (f.id === 'novoters' ? 'dfr-county dfr-c0 dfr-nov' : f.id === 'noresult' ? 'dfr-county dfr-cx' :
        'dfr-county dfr-town dfr-c' + (f.properties.r && f.properties.r.ps ? binOf(f.properties.r.f) : 0)))
      .attr('d', path);
    g.append('path').attr('class', 'dfr-countylines').attr('d', path(data.counties));
    g.append('path').attr('class', 'dfr-statelines').attr('d', path(data.states));
    g.append('path').attr('class', 'dfr-outline').attr('d', path(data.outline));
    const hl = g.append('path').attr('class', 'focus-ring');
    const show = (ev, f) => {
      hl.attr('d', path(f)).attr('visibility', 'visible');
      const [px, py] = d3.pointer(ev, el);
      tip.show(townTip(f, TOWN.year), px, py);
    };
    shapes.on('pointermove pointerdown', show);
    svg.on('pointerleave', () => { tip.hide(); hl.attr('visibility', 'hidden'); });
    // zoom: buttons, pinch, ctrl/cmd + wheel, drag once zoomed in; one finger still scrolls the page
    const zoom = d3.zoom().scaleExtent([1, 32]).translateExtent([[0, 0], [W, H]])
      .filter((ev) => (ev.type === 'wheel' ? ev.ctrlKey || ev.metaKey : ev.type === 'touchstart' ? ev.touches.length > 1 : !ev.button))
      .on('zoom', (ev) => { g.attr('transform', ev.transform); svg.classed('is-zoomed', ev.transform.k > 1.01); tip.hide(); });
    svg.call(zoom).on('dblclick.zoom', null);
    const zoomTo = (f) => {
      const [[x0, y0], [x1, y1]] = path.bounds(f);
      const k = Math.min(24, 0.5 / Math.max((x1 - x0) / W, (y1 - y0) / H));
      const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
      svg.transition().duration(600).call(zoom.transform, t).on('end', () => {
        hl.attr('d', path(f)).attr('visibility', 'visible');
        const c = path.centroid(f);
        const p = t.apply(c);
        tip.show(townTip(f, TOWN.year), p[0], p[1]);
      });
    };
    TOWN.view = { zoom, svg, zoomTo, data };

    const vals = data.rows;
    const top = vals.reduce((a, c) => (c.f > a.f ? c : a));
    const own = vals.filter((r) => r.m === 1).length, groups = vals.filter((r) => r.g), inGroups = d3.sum(groups, (r) => r.m);
    const cut = 40;
    const over = vals.filter((r) => r.f >= cut);
    const east = over.filter((r) => +r.u.slice(0, 2) >= 12).length;
    $('#tmap-note').textContent = vals.length.toLocaleString('en') + ' areas: ' + own.toLocaleString('en') + ' municipalities with results of their own and ' +
      groups.length + ' groups of ' + inGroups.toLocaleString('en') + ' small municipalities that count postal votes together. Highest: ' + top.n + ', ' + f1(top.f) + '%. ' +
      (over.length ? cut + '% or more in ' + over.length + ' areas' + (east === over.length ? ', all in the east' : ', ' + east + ' of them in the east') + '. ' : '') +
      'Zoom with the buttons, by pinching, or with Ctrl or ⌘ and the scroll wheel.';
    svg.attr('aria-label', 'Map of the far right’s share of the second vote by municipality, federal election ' + TOWN.year + '. Highest: ' + top.n + ', ' + f1(top.f) + '%.');
  }

  function setupTowns(el) {
    let started = false;
    const years = [2017, 2021, 2025];
    TOWN.year = years[years.length - 1];
    let redraw = null;
    const render = async () => {
      let data;
      try { data = await townData(TOWN.year); } catch (err) {
        el.insertAdjacentHTML('afterbegin', '<p class="error">' + esc(err.message) + '</p>');
        return;
      }
      const names = new Map();
      data.rows.forEach((r) => {
        names.set(r.n, r.u);
        if (r.ms) r.ms.split('|').forEach((n) => { if (!names.has(n)) names.set(n, r.u); });
      });
      TOWN.names = names;
      $('#tnames').innerHTML = [...names.keys()].sort((a, b) => a.localeCompare(b, 'de')).map((n) => '<option value="' + esc(n) + '">').join('');
      if (!redraw) redraw = onWidth(el, () => drawTowns(el, TOWN.cache.get(TOWN.year)));
      else redraw();
    };
    const start = () => {
      if (started) return;
      started = true;
      const seg = $('#tyear');
      years.forEach((y) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = y;
        b.setAttribute('aria-pressed', String(y === TOWN.year));
        b.addEventListener('click', () => {
          if (TOWN.year === y) return;
          TOWN.year = y;
          seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          render();
        });
        seg.appendChild(b);
      });
      $('#tkey').innerHTML = rampKey() +
        '<div class="dfr-key"><span><i class="dfr-sw dfr-sw--novote"></i>No result of its own</span><span><i class="dfr-sw dfr-sw--blank"></i>No voters</span></div>';
      const find = $('#tfind');
      find.addEventListener('change', () => {
        const u = TOWN.names && TOWN.names.get(find.value);
        if (!u || !TOWN.view) return;
        const f = TOWN.view.data.feats.find((x) => x.id === u);
        if (f) TOWN.view.zoomTo(f);
      });
      $('#tzin').addEventListener('click', () => TOWN.view && TOWN.view.svg.transition().duration(300).call(TOWN.view.zoom.scaleBy, 2));
      $('#tzout').addEventListener('click', () => TOWN.view && TOWN.view.svg.transition().duration(300).call(TOWN.view.zoom.scaleBy, 0.5));
      $('#tzreset').addEventListener('click', () => TOWN.view && TOWN.view.svg.transition().duration(400).call(TOWN.view.zoom.transform, d3.zoomIdentity));
      render();
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' });
      io.observe(el);
    } else start();
  }

  // ---------- parties table ----------
  function renderParties(list) {
    const short = { populist4: 'PopuList 4.0', stoess1993: 'Stöss 1993', schedler2021: 'Schedler 2021', gerda2025: 'GERDA' };
    const rows = list.filter((p) => p.best_pct != null || p.party === 'AfD').sort((a, b) => (a.first_year || 9999) - (b.first_year || 9999));
    $('#parties').innerHTML = '<thead><tr><th>Party</th><th class="num">In state elections</th><th class="num">Best</th><th>Classed by</th></tr></thead><tbody>' +
      rows.map((p) => '<tr><td><b>' + esc(p.party) + '</b> ' + esc(p.party_name) + '</td><td class="num">' + (p.first_year ? p.first_year + (p.last_year !== p.first_year ? '–' + p.last_year : '') : '') +
        '</td><td class="num">' + (p.best_pct != null ? pct(p.best_pct) + ' <span class="dfr-at">' + esc(p.best_at) + '</span>' : '') + '</td><td>' +
        esc(p.basis.split(';').map((b) => short[b] || b).join(', ')) + '</td></tr>').join('') + '</tbody>';
  }

  // ---------- boot ----------
  async function boot() {
    try {
      const [elections, parties] = await Promise.all([getJSON('data/elections.json'), getJSON('data/parties.json')]);
      ELECTIONS = elections.map((e) => {
        const date = parseDate(e.d);
        return { ...e, date, year: date.getFullYear() };
      });
      parties.forEach((p) => PARTIES.set(p.party, p));
    } catch (err) {
      root.querySelector('.wrap').insertAdjacentHTML('afterbegin', '<p class="error">' + esc(err.message) + '</p>');
      return;
    }
    computeParliaments();
    renderHero();
    renderParties([...PARTIES.values()]);
    const sel = $('#follow');
    sel.innerHTML = '<option value="">None</option>' + Object.entries(STATES).sort((a, b) => a[1].localeCompare(b[1]))
      .map(([c, n]) => '<option value="' + c + '"' + (state.follow === c ? ' selected' : '') + '>' + esc(n) + '</option>').join('');
    sel.addEventListener('change', () => {
      state.follow = sel.value;
      try { localStorage.setItem(STORE.follow, state.follow); } catch (e) { /* ignore */ }
      if (VIEWS.arc) VIEWS.arc.mark(state.follow);
    });
    const redrawArc = onWidth($('#arc'), () => drawArc($('#arc')));
    buildSeg($('#level'), [['state', 'State elections'], ['federal', 'Federal elections, by state']], 'level', redrawArc);
    onWidth($('#parl'), () => drawParl($('#parl')));
    onWidth($('#panels'), () => drawPanels($('#panels')));
    setupMap($('#map'));
    setupTowns($('#tmap'));
  }
  boot();
})();
