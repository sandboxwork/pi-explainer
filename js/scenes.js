/*
 * scenes.js — 모든 원에 숨은 수, 파이
 *
 * Colour promise: cyan = diameter (radius), amber = circumference (π).
 * Geometry that has to follow the maths exactly — the rolling wheel, the flipping diameter sticks,
 * Archimedes' polygons, the pizza slices — is drawn in onFrame(t) from plain state objects that are
 * tweened on `tl`, so every frame is a pure function of the playhead (seekable, identical per take).
 */
Video.define(({ tl, cue, scene, onFrame, data, gsap }) => {
  const PI_DIGITS = '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000313783875288658753320838142061717766914730359825349042875546873115956286388235378759375195778185778053217122680661300192787661119590921642019893809525720106548586327886593615338182796823030195203530185296899577362259941389124972177528347913151557485724245415069595082953311686172785588907509838175463746493931925506040092770167113900984882401285836160356370766010471018194295559619894676783744944825537977472684710404753464620804668425906949129331367702898915210475216205696602405803815019351125338243003558764024749647326391419927260426992279678235478163600934172164121992458631503028618297455570674983850549458858692699569092721079750930295532116534498720275596023648066549911988183479775356636980742654252786255181841757467289097777279380008164706001614524919217321721477235014144197356854816136115735255213347574184946843852332390739414333454776241686251898356948556209921922218427255025425688767179049460165346680498862723279178608578438382796797668145410095388378636095068006422512520511739298489608412848862694560424196528502221066118630674427862203919494504712371378696095636437191728746776465757396241389086583264599581339047802759009';
  const AMBER = '#ffb547';
  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const inOut = gsap.parseEase('power3.inOut');
  const c = (id) => cue(id);
  const w = (id, phrase, off = 0) => cue(id).when(phrase, off);
  const poly = (pts) => 'M' + pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L');
  function mk(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  }

  // ---------- tween helpers (everything lives on tl) ----------
  function rise(target, pos, o = {}) {
    tl.fromTo(target, { y: o.y ?? 30 }, {
      y: 0, autoAlpha: 1, duration: o.d ?? 0.7, ease: o.ease ?? 'expo.out', stagger: o.stagger ?? 0, immediateRender: false,
    }, pos);
  }
  function fade(target, pos, o = {}) {
    tl.to(target, { autoAlpha: o.to ?? 1, duration: o.d ?? 0.5, ease: o.ease ?? 'power2.out', stagger: o.stagger ?? 0 }, pos);
  }
  function pop(target, pos, o = {}) {
    tl.fromTo(target, { scale: o.from ?? 0.4 }, {
      scale: 1, autoAlpha: 1, duration: o.d ?? 0.45, ease: o.ease ?? 'back.out(2.2)', immediateRender: false,
    }, pos);
  }
  function exit(target, pos, o = {}) {
    tl.to(target, { autoAlpha: 0, y: o.y ?? -60, duration: o.d ?? 0.5, ease: 'power2.in', stagger: o.stagger ?? 0 }, pos);
  }
  function draw(target, pos, d = 0.8, ease = 'power2.inOut') {
    gsap.set(target, { drawSVG: '0%' });
    tl.to(target, { autoAlpha: 1, duration: 0.01 }, pos);
    tl.to(target, { drawSVG: '100%', duration: d, ease }, pos);
  }

  // ---------- persistent: graph-paper dots drift the whole time, so no frame is frozen ----------
  tl.fromTo('#grid', { x: 0, y: 0 }, { x: -240, y: -480, duration: data.duration, ease: 'none', immediateRender: false }, 0);

  // =====================================================================================
  // s01 · hook — a compass draws a circle; coins to planets, every circle shares one number
  // =====================================================================================
  scene('#s01', 0, c('c04').start + 0.1);
  gsap.set('#s01-arm', { svgOrigin: '960 500' });
  const tCompass = w('c01', '원이') - 0.25;
  fade('#s01-arm', tCompass - 0.25, { d: 0.25 });
  draw('#s01-main', tCompass, 1.3, 'power2.inOut');
  tl.to('#s01-arm', { rotation: 360, duration: 1.3, ease: 'power2.inOut' }, tCompass);
  fade('#s01-arm', tCompass + 1.35, { to: 0, d: 0.3 });

  const c02 = c('c02');
  tl.to('#s01-main', { attr: { cx: 690, cy: 610, r: 110 }, duration: 0.9, ease: 'power3.inOut' }, c02.start - 0.15);
  tl.to('#s01-dot', { attr: { cx: 690, cy: 610 }, autoAlpha: 0, duration: 0.9, ease: 'power3.inOut' }, c02.start - 0.15);
  tl.fromTo('#s01-coin', { attr: { r: 0 } }, { attr: { r: 26 }, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)', immediateRender: false }, w('c02', '동전처럼') + 0.1);
  rise('#s01-lcoin', w('c02', '동전처럼') + 0.25, { y: 14 });
  draw('#s01-earth', w('c02', '지구처럼') - 0.1, 1.3, 'power2.out');
  rise('#s01-learth', w('c02', '지구처럼') + 0.35, { y: 14 });
  tl.fromTo('#s01-c2', { attr: { r: 0 } }, { attr: { r: 60 }, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.6)', immediateRender: false }, w('c02', '모든') - 0.1);
  tl.fromTo('#s01-c4', { attr: { r: 0 } }, { attr: { r: 170 }, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.6)', immediateRender: false }, w('c02', '모든') + 0.02);
  // "똑같은 수" — every rim lights up in the circumference colour, small to large
  tl.to(['#s01-coin', '#s01-c2', '#s01-main', '#s01-c4', '#s01-earth'], {
    stroke: AMBER, strokeWidth: 5, duration: 0.5, ease: 'power2.out', stagger: 0.09,
  }, w('c02', '똑같은') - 0.1);

  const c03 = c('c03');
  tl.to(['#s01-coin', '#s01-c2', '#s01-main', '#s01-c4'], { attr: { cx: 960, cy: 585, r: 0 }, duration: 0.7, ease: 'power3.in', stagger: 0.05 }, c03.start - 0.3);
  fade(['#s01-earth', '#s01-lcoin', '#s01-learth'], c03.start - 0.3, { to: 0 });
  rise('#s01-title', w('c03', '원주율') - 0.1, { y: 20 });
  tl.fromTo('#s01-pi', { scale: 0.55 }, { scale: 1, autoAlpha: 1, duration: 1.0, ease: 'expo.out', immediateRender: false }, w('c03', '파이') - 0.2);
  tl.to('#s01-pi', { scale: 1.05, duration: 1.8, ease: 'sine.inOut' }, w('c03', '파이') + 0.8);
  exit(['#s01-title', '#s01-pi'], c('c04').start - 0.4, { stagger: 0.05 });

  // =====================================================================================
  // s02 · the two lengths — diameter (cyan), circumference (amber), and the question
  // =====================================================================================
  const c04 = c('c04');
  const c07 = c('c07');
  const handoff = c07.start + 0.92; // s02's circle has glided into s03's start position
  scene('#s02', c04.start - 0.3, handoff + 0.04);
  tl.fromTo('#s02-ring', { attr: { r: 0 } }, { attr: { r: 260 }, autoAlpha: 1, duration: 1.0, ease: 'expo.out', immediateRender: false }, c04.start - 0.25);
  tl.fromTo('#s02-center', { attr: { r: 0 } }, { attr: { r: 8 }, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.5)', immediateRender: false }, w('c04', '중심을') - 0.05);
  draw('#s02-dia', w('c04', '끝에서') - 0.1, 1.1, 'power3.inOut');
  rise('#s02-tdia', w('c04', '지름입니다') - 0.15);
  rise('#s02-cdia', w('c04', '지름입니다') + 0.1, { y: 16 });

  const st2 = { rim: 0 };
  const tRim = w('c05', '한 바퀴') - 0.15;
  fade(['#s02-rim', '#s02-lead'], tRim, { d: 0.15 });
  tl.to(st2, { rim: 1, duration: 1.7, ease: 'power2.inOut' }, tRim);
  fade('#s02-lead', tRim + 1.65, { to: 0, d: 0.3 });
  rise('#s02-trim', w('c05', '둘레입니다') - 0.15);
  rise('#s02-crim', w('c05', '둘레입니다') + 0.1, { y: 16 });
  const rimEl = $('#s02-rim');
  const leadEl = $('#s02-lead');
  const L2 = TAU * 260;
  onFrame(() => {
    rimEl.style.strokeDasharray = `${(st2.rim * L2).toFixed(1)} ${L2.toFixed(1)}`;
    leadEl.setAttribute('cx', (620 + 260 * Math.cos(st2.rim * TAU)).toFixed(2));
    leadEl.setAttribute('cy', (540 + 260 * Math.sin(st2.rim * TAU)).toFixed(2));
  });

  const c06 = c('c06');
  tl.to(['#s02-crim', '#s02-cdia'], { autoAlpha: 0, x: -20, duration: 0.4, ease: 'power2.in' }, c06.start - 0.1);
  tl.fromTo('#s02-bar', { scaleX: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.6, ease: 'power3.out', immediateRender: false }, c06.start + 0.1);
  tl.fromTo('#s02-q', { x: -24 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', immediateRender: false }, w('c06', '몇 배') - 0.25);
  tl.to('#s02-qmark', { scale: 1.16, duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, w('c06', '몇 배') + 0.45);

  // match cut → s03: text leaves, the circle and its diameter glide to the start of the floor
  exit(['#s02-trim', '#s02-tdia', '#s02-bar', '#s02-q'], c07.start - 0.05, { y: -40, d: 0.45, stagger: 0.04 });
  fade('#s02-rim', c07.start - 0.05, { to: 0, d: 0.4 });
  tl.to('#s02-ring', { attr: { cx: 426, cy: 470, r: 170 }, duration: 0.92, ease: 'power3.inOut' }, c07.start);
  tl.to('#s02-dia', { attr: { x1: 256, y1: 470, x2: 596, y2: 470 }, duration: 0.92, ease: 'power3.inOut' }, c07.start);
  tl.to('#s02-center', { attr: { cx: 426, cy: 470 }, duration: 0.92, ease: 'power3.inOut' }, c07.start);

  // =====================================================================================
  // s03 · paint the rim, roll one turn, then measure the line with the circle's own diameter
  // =====================================================================================
  const X0 = 426;          // where the wheel touches the floor at the start
  const R3 = 170;
  const D3 = 340;
  const C3 = Math.PI * D3; // the painted line is exactly this long
  const FY = 640;          // floor
  const CY3 = 470;         // wheel centre height
  const SY = 626;          // sticks lie just on top of the painted line
  scene('#s03', handoff, c('c15').start + 0.1);
  draw('#s03-floor', handoff + 0.02, 1.1, 'power2.inOut');
  fade('#s03-tick0', handoff + 0.6, { d: 0.4 });

  const st3 = { paint: 0, roll: 0, lift: 0, drop: 0, f2: 0, f3: 0, num: 3 };
  tl.to(st3, { paint: 1, duration: 0.9, ease: 'power2.inOut' }, w('c07', '물감') - 0.1);
  const tRoll = w('c08', '한 바퀴') - 0.1;
  tl.to(st3, { roll: 1, duration: 3.0, ease: 'sine.inOut' }, tRoll);
  fade('#s03-tick1', tRoll + 2.85, { d: 0.4 });

  // c09 · what's left on the floor is the circumference
  draw('#s03-brace', w('c09', '이 선의') - 0.1, 0.8);
  tl.to('#s03-roll', { strokeWidth: 14, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, w('c09', '이 선의') - 0.1);
  rise('#s03-lrim', w('c09', '둘레입니다') - 0.15, { y: 14 });

  // c10 · the diameter leaves the wheel and hovers over the start of the line
  fade('#s03-hub', c('c10').start, { to: 0, d: 0.4 });
  tl.to(st3, { lift: 1, duration: 1.3, ease: 'power3.inOut' }, w('c10', '지름을') - 0.15);
  fade('#s03-ring', w('c10', '지름을') + 0.2, { to: 0, d: 0.8 });
  tl.to(['#s03-brace', '#s03-lrim'], { opacity: 0.4, duration: 0.5 }, w('c10', '지름을'));

  // c11 · 하나, 둘, 셋 — word onsets read off this take's loudness envelope (0.04 / 0.52 / 0.83 s of 1.23 s)
  const c11 = c('c11');
  const tOne = c11.at(0.03);
  const tTwo = c11.at(0.42);
  const tThree = c11.at(0.67);
  tl.to(st3, { drop: 1, duration: 0.24, ease: 'power2.in' }, tOne - 0.2);
  pop('#s03-n1', tOne + 0.02);
  tl.to(st3, { f2: 1, duration: 0.3, ease: 'power2.inOut' }, tTwo - 0.22);
  pop('#s03-n2', tTwo + 0.06);
  tl.to(st3, { f3: 1, duration: 0.3, ease: 'power2.inOut' }, tThree - 0.22);
  pop('#s03-n3', tThree + 0.06);

  // c12 · zoom into the little piece that is left over
  gsap.set('#s03-cam', { transformOrigin: '1470px 632px' });
  tl.to('#s03-cam', { scale: 2.6, duration: 1.3, ease: 'power3.inOut' }, c('c12').start + 0.3);
  fade('#s03-rem', w('c12', '조금이') - 0.15, { d: 0.3 });
  tl.to('#s03-rem', { strokeWidth: 22, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 3 }, w('c12', '조금이') + 0.15);
  rise('#s03-little', w('c12', '조금이') - 0.05, { y: 20 });

  // c13 · zoom out and write it down
  const c13 = c('c13');
  tl.to('#s03-cam', { scale: 1, duration: 1.0, ease: 'power3.inOut' }, c13.start - 0.3);
  fade('#s03-little', c13.start - 0.3, { to: 0, d: 0.3 });
  rise('#s03-eq > *', c13.start + 0.02, { y: 24, stagger: 0.07 });

  // c14 · 3 + 조금 → 3.14 → π
  const tNum = w('c14', '3.14') - 0.15;
  exit('#s03-a', tNum, { y: -40, d: 0.35 });
  tl.to('#s03-slot', { width: 201, duration: 0.5, ease: 'power3.inOut' }, tNum);
  rise('#s03-b', tNum + 0.2, { y: 40, d: 0.5 });
  tl.to(st3, { num: 3.14, duration: 0.8, ease: 'power2.out' }, tNum + 0.2);
  pop('#s03-n4', tNum + 0.3, { from: 0.6 });
  const tPi = w('c14', '파이입니다') - 0.15;
  exit('#s03-b', tPi, { y: -40, d: 0.35 });
  tl.to('#s03-slot', { width: 68, duration: 0.5, ease: 'power3.inOut' }, tPi);
  tl.fromTo('#s03-c', { scale: 1.6 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'expo.out', immediateRender: false }, tPi + 0.15);
  exit('#s03-wrap', c('c15').start - 0.6);

  const ringEl = $('#s03-ring');
  const rollEl = $('#s03-roll');
  const spokeEl = $('#s03-spoke');
  const hubEl = $('#s03-hub');
  const b2El = $('#s03-b2');
  const b3El = $('#s03-b3');
  const numEl = $('#s03-num');
  // butt-capped stick; `inset` px trimmed at both ends so neighbouring sticks read as separate pieces
  function stick(el, p, q, inset) {
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = (dx / len) * inset;
    const uy = (dy / len) * inset;
    el.setAttribute('x1', (p[0] + ux).toFixed(2));
    el.setAttribute('y1', (p[1] + uy).toFixed(2));
    el.setAttribute('x2', (q[0] - ux).toFixed(2));
    el.setAttribute('y2', (q[1] - uy).toFixed(2));
  }
  // a copy of the stick turns over the right end of the previous one (over the top, clockwise)
  function flip(el, px, f) {
    el.style.visibility = f > 0 ? 'visible' : 'hidden';
    const a = Math.PI + f * Math.PI;
    stick(el, [px, SY], [px + D3 * Math.cos(a), SY + D3 * Math.sin(a)], 2);
  }
  onFrame(() => {
    const s = st3.roll * C3;
    const cx = X0 + s;
    const phi = s / R3; // clockwise rotation of the wheel
    ringEl.setAttribute('cx', cx.toFixed(2));
    hubEl.setAttribute('cx', cx.toFixed(2));

    // paint = the part already pressed onto the floor + the arc still on the wheel (contact point backwards)
    const a0 = Math.PI / 2 + phi;
    const a1 = a0 + st3.paint * (TAU - phi);
    const pts = [];
    if (s > 0.05) pts.push([X0, FY], [cx, FY]);
    if (a1 - a0 > 1e-4) {
      const n = Math.max(2, Math.ceil(((a1 - a0) / TAU) * 240));
      for (let i = 0; i <= n; i++) {
        const a = a1 - ((a1 - a0) * i) / n;
        pts.push([cx + R3 * Math.cos(a), CY3 + R3 * Math.sin(a)]);
      }
    }
    rollEl.setAttribute('d', pts.length > 1 ? poly(pts) : 'M0,0');

    // the diameter: a spoke while rolling, then the first measuring stick
    let p = [cx - R3 * Math.cos(phi), CY3 - R3 * Math.sin(phi)];
    let q = [cx + R3 * Math.cos(phi), CY3 + R3 * Math.sin(phi)];
    let inset = 0;
    if (st3.lift > 0) {
      const u = st3.lift;
      const y = lerp(560, SY, st3.drop);
      const arc = -90 * Math.sin(Math.PI * u);
      p = [lerp(p[0], X0, u), lerp(CY3, y, u) + arc];
      q = [lerp(q[0], X0 + D3, u), lerp(CY3, y, u) + arc];
      inset = 2 * u;
    }
    stick(spokeEl, p, q, inset);
    flip(b2El, X0 + D3, st3.f2);
    flip(b3El, X0 + 2 * D3, st3.f3);
    numEl.textContent = st3.num.toFixed(2);
  });

  // =====================================================================================
  // s04 · twice the circle → twice both lengths, so the ratio never changes
  // =====================================================================================
  const c15 = c('c15');
  scene('#s04', c15.start - 0.2, c('c18').start - 0.1);
  const t4 = c15.start - 0.15;
  draw('#s04-ca', t4, 0.7);
  draw('#s04-da', t4 + 0.2, 0.5);
  draw('#s04-la', t4 + 0.25, 0.7, 'power2.out');
  ['#s04-a1', '#s04-a2', '#s04-a3'].forEach((s, i) => draw(s, t4 + 0.55 + i * 0.1, 0.25, 'power1.out'));
  const tB = w('c15', '커지면') - 0.15;
  tl.fromTo('#s04-cb', { attr: { cy: 330, r: 70 } }, { attr: { cy: 700, r: 140 }, autoAlpha: 1, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, tB);
  tl.fromTo('#s04-db', { attr: { x1: 190, y1: 330, x2: 330, y2: 330 } }, { attr: { x1: 120, y1: 700, x2: 400, y2: 700 }, autoAlpha: 1, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, tB);
  const tLb = w('c15', '둘레도') - 0.1;
  draw('#s04-lb', tLb, 0.9);
  ['#s04-b1', '#s04-b2', '#s04-b3'].forEach((s, i) => draw(s, tLb + 0.25 + i * 0.14, 0.3, 'power1.out'));
  rise('#s04-x2d', w('c15', '정확히') - 0.2, { y: 12 });
  draw('#s04-g1', w('c15', '정확히') + 0.1, 0.5);
  draw('#s04-g2', w('c15', '정확히') + 0.5, 0.5);
  rise('#s04-x2c', w('c15', '늘어납니다') - 0.3, { y: 12 });

  // c16 · 둘레 / 지름 = π   (words start in fraction position, offsets from their final spots)
  gsap.set('#s04-w1', { x: 234, y: -56 });
  gsap.set('#s04-w2', { x: -78, y: 72 });
  gsap.set('#s04-eqs', { x: 249 });
  gsap.set('#s04-pi', { x: -60 });
  gsap.set('#s04-bar', { transformOrigin: '50% 50%' });
  const c16 = c('c16');
  fade(['#s04-x2d', '#s04-x2c', '#s04-g1', '#s04-g2'], c16.start - 0.1, { to: 0, d: 0.4 });
  const settle = { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'expo.out', immediateRender: false };
  tl.fromTo('#s04-w1', { scale: 0.85 }, { ...settle }, w('c16', '둘레를') - 0.1);
  tl.fromTo('#s04-bar', { scaleX: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, w('c16', '지름으로') - 0.25);
  tl.fromTo('#s04-w2', { scale: 0.85 }, { ...settle }, w('c16', '지름으로') - 0.05);
  tl.fromTo(['#s04-eqs', '#s04-pi'], { scale: 0.85 }, { ...settle, stagger: 0.15 }, w('c16', '파이가') - 0.3);
  // c17 · the denominator moves across: 둘레 = 지름 × π
  const tAlg = w('c17', '둘레는') - 0.1;
  tl.to(['#s04-w1', '#s04-w2', '#s04-eqs', '#s04-pi'], { x: 0, y: 0, duration: 0.9, ease: 'power3.inOut', stagger: 0.03 }, tAlg);
  tl.to('#s04-bar', { scaleX: 0, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, tAlg);
  fade('#s04-tm', tAlg + 0.55, { d: 0.4 });
  exit('#s04 > .wrap', c('c18').start - 0.7);

  // =====================================================================================
  // s05 · Archimedes traps π between a polygon inside and one outside
  // =====================================================================================
  const c18 = c('c18');
  const c19 = c('c19');
  scene('#s05', c18.start - 0.2, c('c25').start - 0.2);
  rise('#s05-q', c18.start - 0.1, { y: 40, d: 0.8 });
  exit('#s05-q', c19.start - 0.55, { y: -50, d: 0.5 });
  // the unknown digits after 3.14: three question marks breathing in a wave
  tl.to('#s05-q .qm', { opacity: 1, y: -14, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: 3, stagger: 0.12 }, w('c18', '정확히') - 0.2);

  tl.fromTo('#s05-kick', { x: -24 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', immediateRender: false }, w('c19', '아르키메데스') - 0.3);
  draw('#s05-circ', w('c19', '원 안과') - 0.15, 1.0);
  const st5 = { dIn: 0, dOut: 0, p: 0, band: 0 };
  const tPoly = w('c19', '다각형을') - 0.15;
  fade('#s05-in', tPoly, { d: 0.01 });
  tl.to(st5, { dIn: 1, duration: 0.9, ease: 'power2.inOut' }, tPoly);
  fade('#s05-out', tPoly + 0.2, { d: 0.01 });
  tl.to(st5, { dOut: 1, duration: 0.9, ease: 'power2.inOut' }, tPoly + 0.2);
  tl.to(['#s05-in', '#s05-out'], { strokeWidth: 5.5, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, w('c19', '가두었습니다') - 0.05);

  // c20 · inner hexagon: six radii make six equal triangles → perimeter = 3 diameters
  const c20 = c('c20');
  tl.to('#s05-out', { opacity: 0.25, duration: 0.4 }, c20.start - 0.1);
  tl.to('#s05-in', { strokeWidth: 4.5, duration: 0.4 }, c20.start - 0.1);
  $$('#s05-spokes line').forEach((el, i) => draw(el, w('c20', '정육각형은') - 0.15 + i * 0.07, 0.4, 'power2.out'));
  rise('#s05-rin', w('c20', '정육각형은') - 0.05, { y: 14 });
  rise('#s05-vin', w('c20', '딱 세 배') - 0.3, { y: 16 });

  // c21 · outer square: each side is one diameter → perimeter = 4 diameters
  const c21 = c('c21');
  fade('#s05-spokes', c21.start - 0.15, { to: 0, d: 0.4 });
  tl.to('#s05-in', { opacity: 0.3, strokeWidth: 3, duration: 0.4 }, c21.start - 0.15);
  tl.to('#s05-out', { opacity: 1, strokeWidth: 4.5, duration: 0.4 }, c21.start - 0.15);
  draw('#s05-dia', w('c21', '정사각형은') - 0.15, 0.6);
  rise('#s05-rout', w('c21', '정사각형은') - 0.05, { y: 14 });
  rise('#s05-vout', w('c21', '네 배') - 0.3, { y: 16 });

  // c22 · so 3 < π < 4
  const c22 = c('c22');
  tl.to(['#s05-in', '#s05-out'], { opacity: 1, strokeWidth: 3, duration: 0.4 }, c22.start - 0.1);
  fade('#s05-dia', c22.start - 0.1, { to: 0, d: 0.4 });
  const ticksG = $('#s05-ticks');
  for (let i = 0; i <= 10; i++) {
    const x = 1120 + i * 64;
    const big = i === 0 || i === 10;
    mk('line', { x1: x, x2: x, y1: big ? 664 : 672, y2: big ? 696 : 688, class: 'axtick' }, ticksG);
  }
  draw('#s05-axis', c22.start + 0.3, 0.8);
  fade(['#s05-ticks', '#s05-l3', '#s05-l4'], c22.start + 0.7, { d: 0.5, stagger: 0.08 });
  fade('#s05-band', w('c22', '3과') - 0.2, { d: 0.01 });
  tl.to(st5, { band: 1, duration: 0.7, ease: 'power2.inOut' }, w('c22', '3과') - 0.2);
  fade('#s05-pim', w('c22', '사이의') - 0.15, { d: 0.4 });

  // c23–c24 · more sides squeeze the gap: 6→96 inside, 4→96 outside
  tl.to(st5, { p: 1, duration: 4.6, ease: 'sine.inOut' }, c('c23').start + 0.2);
  rise('#s05-res', w('c24', '3.141과') - 0.25, { y: 24 });
  exit('#s05 > .wrap', c('c25').start - 0.8);

  const inEl = $('#s05-in');
  const outEl = $('#s05-out');
  const bandEl = $('#s05-band');
  const pimEl = $('#s05-pim');
  const nInEl = $('#s05-nin');
  const nOutEl = $('#s05-nout');
  const loEl = $('#s05-lo');
  const hiEl = $('#s05-hi');
  const PCX = 600;
  const PCY = 560;
  const PR = 300;
  const ngon = (n, rad, rot) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = rot + (i * TAU) / n;
      pts.push([PCX + rad * Math.cos(a), PCY + rad * Math.sin(a)]);
    }
    return poly(pts) + 'Z';
  };
  onFrame(() => {
    const ni = Math.round(6 * Math.pow(16, st5.p));
    const no = Math.round(4 * Math.pow(24, st5.p));
    const ro = PR / Math.cos(Math.PI / no);
    inEl.setAttribute('d', ngon(ni, PR, -Math.PI / 2));
    outEl.setAttribute('d', ngon(no, ro, -Math.PI / 2 + Math.PI / no));
    const lo = ni * Math.sin(Math.PI / ni); // perimeter ÷ diameter, inside
    const hi = no * Math.tan(Math.PI / no); // perimeter ÷ diameter, outside
    const perIn = lo * 2 * PR;
    const perOut = hi * 2 * PR;
    inEl.style.strokeDasharray = st5.dIn >= 1 ? 'none' : `${(st5.dIn * perIn).toFixed(1)} ${perIn.toFixed(1)}`;
    outEl.style.strokeDasharray = st5.dOut >= 1 ? 'none' : `${(st5.dOut * perOut).toFixed(1)} ${perOut.toFixed(1)}`;
    const moving = st5.p > 1e-4;
    nInEl.textContent = moving ? `정${ni}각형` : '정육각형';
    nOutEl.textContent = moving ? `정${no}각형` : '정사각형';
    loEl.textContent = moving ? lo.toFixed(4) : '3';
    hiEl.textContent = moving ? hi.toFixed(4) : '4';
    const x0 = 1120 + (lo - 3) * 640;
    const x1 = 1120 + (hi - 3) * 640;
    const wBand = Math.max(2, (x1 - x0) * st5.band);
    bandEl.setAttribute('x', x0.toFixed(2));
    bandEl.setAttribute('width', wBand.toFixed(2));
    pimEl.style.transform = `translateX(${(x0 + wBand / 2).toFixed(1)}px)`;
  });

  // =====================================================================================
  // s06 · the digits never end and never repeat; the letter π
  // =====================================================================================
  const c25 = c('c25');
  scene('#s06', c25.start - 0.3, c('c29').start + 0.12);
  $('#s06-tick').textContent = PI_DIGITS.slice(0, 302);
  $('#s06-wall').textContent = PI_DIGITS.replace('.', '');
  gsap.set('#s06-line', { scaleX: 0 });
  fade('#s06-tw', c25.start - 0.2, { d: 0.6 });
  tl.to('#s06-line', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, c25.start - 0.1);
  const T0 = c25.start + 0.5;
  const tickEl = $('#s06-tick');
  onFrame((t) => {
    const u = Math.max(0, t - T0); // accelerating scroll
    tickEl.style.transform = `translateX(${(300 - (50 * u + 40 * u * u)).toFixed(1)}px)`;
  });

  const c26 = c('c26');
  rise('#s06-rep', c26.start - 0.25, { y: 20 });
  tl.to('#s06-rep .g', { '--u': 1, duration: 0.4, ease: 'power2.out', stagger: 0.18 }, w('c26', '되풀이되지도') - 0.2);

  const c27 = c('c27');
  exit('#s06-rep', c27.start - 0.2, { y: -20, d: 0.4 });
  tl.to('#s06-tw', { y: -310, opacity: 0.22, duration: 0.9, ease: 'power3.inOut' }, c27.start - 0.1);
  fade('#s06-wall', c27.start, { to: 0.09, d: 1.2 });
  const st6 = { e: 0 };
  const countEl = $('#s06-count');
  rise('#s06-count', c27.start + 0.1, { y: 30 });
  tl.to(st6, { e: 14, duration: 1.7, ease: 'power2.in' }, c27.start + 0.2); // 10^0 → 10^14
  rise('#s06-unit', w('c27', '100조') + 0.05, { y: 16 });
  onFrame(() => {
    countEl.textContent = Math.floor(Math.pow(10, st6.e) + 1e-6).toLocaleString('en-US');
  });

  const c28 = c('c28');
  exit(['#s06-count', '#s06-unit'], c28.start - 0.2, { y: -30, d: 0.5 });
  fade('#s06-tw', c28.start - 0.2, { to: 0, d: 0.6 });
  rise('#s06-greek', w('c28', '둘레를') - 0.15, { y: 30 });
  rise('#s06-mean', w('c28', '둘레를') + 0.25, { y: 16 });
  tl.to('#s06-gpi', { color: AMBER, duration: 0.4 }, w('c28', '첫 글자') - 0.1);
  tl.to('#s06-grest', { opacity: 0.28, duration: 0.4 }, w('c28', '첫 글자') - 0.1);
  const tLetter = w('c28', 'π로') - 0.1;
  tl.to('#s06-grest', { width: 0, opacity: 0, duration: 0.8, ease: 'power3.inOut' }, tLetter);
  fade('#s06-mean', tLetter, { to: 0, d: 0.4 });
  tl.to('#s06-gpi', { scale: 2.4, duration: 1.0, ease: 'expo.inOut' }, tLetter + 0.1);
  fade('#s06-wall', tLetter + 0.3, { to: 0, d: 1.2 });
  tl.to('#s06-gpi', { scale: 0.3, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, c('c29').start - 0.5);

  // =====================================================================================
  // s07 · area — slice the circle like a pizza, lay the slices top/bottom, get a rectangle
  // =====================================================================================
  const c29 = c('c29');
  scene('#s07', c29.start - 0.55, null);
  const S7 = { cx: 960, cy: 470, r: 220 };
  const LV = [8, 16, 32, 64];
  const st7 = { P: 0, lv: 0, cut: 0, explode: 0, fill: 0.16, gTop: 0, gBot: 0, whole: 1 };

  // slice k points (k + ½)·360/N degrees clockwise from "up". Upper-half slices go to the even slots
  // (tip down, crust on top), lower-half slices to the odd slots (turned 180°), both left → right.
  const plans = {};
  LV.forEach((N) => {
    const list = [];
    for (let k = 0; k < N; k++) {
      let th = ((k + 0.5) * 360) / N;
      if (th > 180) th -= 360;
      list.push({ th, up: Math.abs(th) < 90, sx: Math.sin(th * DEG) });
    }
    list.filter((o) => o.up).sort((a, b) => a.sx - b.sx).forEach((o, j) => { o.slot = 2 * j; o.rot1 = 0; });
    list.filter((o) => !o.up).sort((a, b) => a.sx - b.sx).forEach((o, j) => { o.slot = 2 * j + 1; o.rot1 = o.th > 0 ? 180 : -180; });
    const a = Math.PI / N;
    const s = S7.r * Math.sin(a);
    const xs = S7.cx - ((N + 1) * s) / 2;
    const yb = S7.cy + S7.r / 2;
    list.forEach((o) => {
      o.tx = xs + (o.slot + 1) * s;
      o.ty = o.slot % 2 === 0 ? yb : yb - S7.r * Math.cos(a);
    });
    plans[N] = list;
  });

  function buildLayer(g) {
    const items = [];
    for (let i = 0; i < 64; i++) {
      const grp = mk('g', {}, g);
      items.push({
        grp,
        fill: mk('path', { class: 'w-fill' }, grp),
        edge: mk('path', { class: 'w-edge' }, grp),
        crust: mk('path', { class: 'w-crust' }, grp),
      });
    }
    return { g, items, n: 0 };
  }
  function shapeLayer(L, N) {
    if (L.n === N) return;
    L.n = N;
    const r = S7.r;
    const sx = (r * Math.sin(Math.PI / N)).toFixed(3);
    const sy = (-r * Math.cos(Math.PI / N)).toFixed(3);
    L.items.forEach((it, i) => {
      it.grp.style.visibility = i < N ? 'visible' : 'hidden';
      it.fill.setAttribute('d', `M0,0L-${sx},${sy}A${r},${r} 0 0 1 ${sx},${sy}Z`);
      it.edge.setAttribute('d', `M-${sx},${sy}L0,0L${sx},${sy}`);
      it.crust.setAttribute('d', `M-${sx},${sy}A${r},${r} 0 0 1 ${sx},${sy}`);
    });
  }
  function renderLayer(L, N, P, alpha) {
    L.g.style.opacity = alpha.toFixed(3);
    if (alpha <= 0) return;
    shapeLayer(L, N);
    const pl = plans[N];
    const edgeOp = (st7.cut * 0.55 * Math.sqrt(8 / N)).toFixed(3);
    for (let k = 0; k < N; k++) {
      const o = pl[k];
      const it = L.items[k];
      const u = inOut(clamp01((P - (o.slot / (N - 1)) * 0.35) / 0.65)); // slices leave one after another
      const ex = st7.explode * 12 * (1 - u);
      const x = lerp(S7.cx, o.tx, u) + Math.sin(o.th * DEG) * ex;
      const y = lerp(S7.cy, o.ty, u) - Math.cos(o.th * DEG) * ex;
      it.grp.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${lerp(o.th, o.rot1, u).toFixed(2)})`);
      it.edge.style.opacity = edgeOp;
      it.fill.style.fillOpacity = st7.fill;
      it.crust.style.strokeWidth = (3 + 5 * (o.slot % 2 === 0 ? st7.gTop : st7.gBot)).toFixed(2);
    }
  }
  const LA = buildLayer($('#s07-la'));
  const LB = buildLayer($('#s07-lb'));
  const diskEl = $('#s07-disk');
  const orbEl = $('#s07-orb');
  const c36 = c('c36');
  onFrame((t) => {
    const ia = Math.min(3, Math.floor(st7.lv));
    const fr = ia < 3 ? st7.lv - ia : 0; // crossfade to the next, finer slicing
    diskEl.style.opacity = st7.whole;
    diskEl.style.fillOpacity = st7.fill;
    const wedges = 1 - st7.whole;
    renderLayer(LA, LV[ia], st7.P, wedges * (1 - fr));
    renderLayer(LB, LV[Math.min(3, ia + 1)], 1, wedges * fr);
    const a = -Math.PI / 2 + Math.max(0, t - c36.start) * 0.55;
    orbEl.setAttribute('cx', (S7.cx + S7.r * Math.cos(a)).toFixed(2));
    orbEl.setAttribute('cy', (S7.cy + S7.r * Math.sin(a)).toFixed(2));
  });

  gsap.set('#s07-grow', { svgOrigin: '960 470', scale: 0 });
  tl.to('#s07-grow', { scale: 1, duration: 0.9, ease: 'expo.out' }, c29.start - 0.5);
  rise('#s07-area', w('c29', '넓이에도') - 0.15, { y: 16 });

  // c30 · cut, pull apart, lay out alternately
  const tCut = w('c30', '피자처럼') - 0.1;
  exit('#s07-area', tCut, { y: -20, d: 0.3 });
  tl.to(st7, { whole: 0, duration: 0.01 }, tCut);
  tl.to(st7, { cut: 1, duration: 0.5, ease: 'power2.out' }, tCut);
  tl.to(st7, { explode: 1, duration: 0.45, ease: 'power2.out' }, w('c30', '자른 다음') - 0.1);
  tl.to(st7, { P: 1, duration: 2.2, ease: 'none' }, w('c30', '위아래로') - 0.1);

  // c31 · thinner slices: 8 → 16 → 32 → 64, the shape becomes a rectangle
  const tThin = w('c31', '가늘어질수록') - 0.1;
  [1, 2, 3].forEach((k, i) => tl.to(st7, { lv: k, duration: 0.35, ease: 'power1.inOut' }, tThin + i * 0.6));
  fade('#s07-rect', w('c31', '직사각형이') - 0.1, { d: 0.6 });

  // c32 · height = the slice's length = radius
  draw('#s07-lbr', w('c32', '조각의 길이') - 0.1, 0.6);
  rise('#s07-lr', w('c32', '반지름이고') - 0.2, { y: 12 });

  // c33 · top and bottom crusts share the circumference → width = half of it = π × radius
  tl.to(st7, { gTop: 1, duration: 0.4, ease: 'power2.out' }, w('c33', '윗변과') - 0.05);
  tl.to(st7, { gBot: 1, duration: 0.4, ease: 'power2.out' }, w('c33', '아랫변이') - 0.05);
  tl.to(st7, { gBot: 0.2, duration: 0.5 }, w('c33', '가로는') - 0.1);
  draw('#s07-tbr', w('c33', '가로는') - 0.1, 0.7);
  rise('#s07-ta', w('c33', '둘레의 절반') - 0.15, { y: 12 });
  exit('#s07-ta', w('c33', '파이 곱하기') - 0.2, { y: -16, d: 0.3 });
  rise('#s07-tb', w('c33', '파이 곱하기') - 0.05, { y: 16 });

  // c34 · 넓이 = 가로 × 세로 → π × 반지름 × 반지름 → π × 반지름²
  tl.to(st7, { fill: 0.34, duration: 0.6 }, w('c34', '넓이는') - 0.15);
  rise('#s07-eq > *', w('c34', '넓이는') - 0.1, { y: 20, stagger: 0.07 });
  const tB7 = w('c34', '파이 곱하기') - 0.15;
  exit('#s07-a', tB7, { y: -30, d: 0.3 });
  tl.to('#s07-slot', { width: 588, duration: 0.5, ease: 'power3.inOut' }, tB7);
  rise('#s07-b', tB7 + 0.15, { y: 30, d: 0.5 });
  const tC7 = w('c34', '제곱입니다') - 0.2;
  exit('#s07-b', tC7, { y: -30, d: 0.3 });
  tl.to('#s07-slot', { width: 349, duration: 0.5, ease: 'power3.inOut' }, tC7);
  rise('#s07-c', tC7 + 0.15, { y: 30, d: 0.5 });

  // =====================================================================================
  // s08 · close — the slices fold back into the circle: π = 둘레 ÷ 지름
  // =====================================================================================
  const c35 = c('c35');
  scene('#s08', c35.start - 0.6, null);
  const tBack = c35.start - 1.0;
  exit(['#s07-eq', '#s07-lr', '#s07-tl'], tBack - 0.1, { y: -20, d: 0.45 });
  fade(['#s07-rect', '#s07-lbr', '#s07-tbr'], tBack - 0.1, { to: 0, d: 0.45 });
  tl.to(st7, { gTop: 0, gBot: 0, fill: 0.12, duration: 0.5 }, tBack - 0.1);
  tl.to(st7, { P: 0, duration: 1.4, ease: 'none' }, tBack + 0.2);
  tl.to(st7, { explode: 0, duration: 0.8, ease: 'power2.inOut' }, tBack + 0.8);
  draw('#s07-rim', c35.start - 0.05, 0.9, 'power2.inOut');
  draw('#s07-dia', w('c35', '지름으로') - 0.15, 0.6, 'power3.out');
  rise('#s08-eq', w('c35', '나눈') - 0.2, { y: 24 });

  exit('#s08-eq', c36.start - 0.3, { y: -20, d: 0.45 });
  fade('#s07-dia', c36.start - 0.3, { to: 0, d: 0.45 });
  tl.to(st7, { cut: 0, duration: 0.6 }, c36.start - 0.3);
  tl.to(st7, { whole: 1, duration: 0.01 }, c36.start + 0.35);
  tl.fromTo('#s08-pi', { scale: 0.7 }, { scale: 1, autoAlpha: 1, duration: 1.0, ease: 'expo.out', immediateRender: false }, c36.start + 0.1);
  gsap.set('#s08-digits', { clipPath: 'inset(0% 100% 0% 0%)' });
  fade('#s08-digits', w('c36', '3.14를') - 0.4, { d: 0.01 });
  tl.to('#s08-digits', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power2.out' }, w('c36', '3.14를') - 0.4);
  rise('#s08-title', c36.end + 0.1, { y: 12, d: 0.9 });
  fade('#s07-orb', c36.start + 0.4, { d: 0.6 });
  tl.to('#s07-cam', { scale: 1.035, duration: data.duration - (c35.start - 0.5), ease: 'sine.inOut' }, c35.start - 0.5);
});
