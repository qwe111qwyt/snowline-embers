import { gsap } from "gsap";
import {
  Accessibility, Archive, ArrowRight, BriefcaseMedical, Check, Eye, FileText,
  Flame, Footprints, Hand, Map, RotateCcw, Settings2, Shirt, Thermometer,
  Utensils, Volume2, VolumeX, Wind, X, createIcons,
} from "lucide";
import { AudioManager } from "./audio-manager.js";
import { assets, buildRecord, coverLines, createInitialState, sceneMeta } from "./game-data.js";
import "./style.css";

const SAVE_KEY = "snowline-embers-save-v2";
const icons = {
  Accessibility, Archive, ArrowRight, BriefcaseMedical, Check, Eye, FileText,
  Flame, Footprints, Hand, Map, RotateCcw, Settings2, Shirt, Thermometer,
  Utensils, Volume2, VolumeX, Wind, X,
};
const state = createInitialState();
const audio = new AudioManager();
const clamp = gsap.utils.clamp(0, 100);
const app = document.querySelector("#app");

app.innerHTML = `
  <main class="game-shell" id="game" aria-label="雪线余火沉浸式互动作品">
    <section class="scene intro" id="introScene" aria-labelledby="gameTitle">
      <img class="scene-bg intro-bg" src="${assets.poster}" alt="交通员手持档案走入东北雪林" />
      <div class="intro-shade"></div>
      <div class="intro-copy">
        <p class="archive-code">互动叙事作品 · 艺术化合成</p>
        <h1 class="title" id="gameTitle">雪线余火</h1>
        <p class="subtitle">护送一份联络档案穿过封锁。活下去不是为了赢下一局，而是为了让火种抵达。</p>
        <button class="primary-btn" id="startBtn" type="button" disabled>
          <span>素材装帧中</span><i data-lucide="archive"></i>
        </button>
        <button class="text-btn" id="resumeBtn" type="button" hidden>继续上次体验</button>
        <p class="intro-note">人物与情节为基于史实环境的艺术化合成 · 建议开启声音</p>
      </div>
    </section>

    <section class="scene archive-scene" id="archiveScene" hidden aria-label="序章 冰封档案">
      <img class="scene-bg archive-bg" src="${assets.night}" alt="被风雪笼罩的山林" />
      <div class="archive-table">
        <p class="archive-index">档案编号 07 / 记忆待启封</p>
        <div class="frozen-photo" id="frozenPhoto">
          <img src="${assets.poster}" alt="雪林中的交通员旧影" />
          <canvas id="frostCanvas" aria-label="擦去旧照片上的霜"></canvas>
          <div class="photo-years" aria-hidden="true"><span>林海</span><span>密营</span><span>封锁</span><span>回响</span></div>
        </div>
        <p class="archive-line">这不是一张胜利合影。照片背后，只留下一个被雪水洇开的地名。</p>
      </div>
      <div class="task-hint" id="scratchHint">用手指擦去玻璃上的霜</div>
      <button class="hold-entry" id="holdEntry" type="button" hidden>
        <span class="hold-ring"></span><span>按住进入记忆</span>
      </button>
    </section>

    <section class="scene journey-scene" id="dayScene" hidden aria-label="第一章 雪线行军">
      <img class="scene-bg day-bg" src="${assets.day}" alt="白日风雪中的林海雪坡" />
      <canvas class="snow-canvas"></canvas>
      <div class="narrative">
        <p class="kicker">第一章 · 雪线行军</p>
        <blockquote>“雪能藏住脚印，也能藏住回去的路。”</blockquote>
      </div>
      <img class="parallax-tree birch-tree" src="${assets.birch}" alt="" />
      <img class="parallax-tree pine-tree" src="${assets.pine}" alt="" />
      <div class="cover day-cover-1" data-cover="0"><img src="${assets.deadPine}" alt="枯松掩体" /><span class="anchor"></span></div>
      <div class="cover day-cover-2" data-cover="1"><img src="${assets.rock}" alt="岩石掩体" /><span class="anchor"></span></div>
      <div class="cover day-cover-3" data-cover="2"><img src="${assets.log}" alt="倒木掩体" /><span class="anchor"></span></div>
      <button class="memory-beacon" id="medicineMemory" type="button" aria-label="查看倒木旁的旧药箱" hidden>
        <img src="${assets.medbox}" alt="" /><i data-lucide="file-text"></i>
      </button>
      <div class="footprints-layer" aria-hidden="true"></div>
      <span class="waypoint" aria-hidden="true"></span>
      <div class="player" data-testid="day-player"><img src="${assets.heroWalk}" alt="年轻交通员" /></div>
      <div class="task-hint">按住雪地拖动 · 松手伏低</div>
      <aside class="paper-sheet route-sheet" id="routeSheet" hidden aria-label="路线选择">
        <p class="sheet-label">路线抉择 · 不设正确答案</p>
        <h2>风把两条路都盖住了</h2>
        <p>一条穿过迎风坡，一条绕进密林。代价不同，但档案都必须送到。</p>
        <div class="choices">
          <button class="choice" data-route="short" type="button"><span><strong>迎风近路</strong><small>路程短 · 体温消耗更快</small></span><i data-lucide="wind"></i></button>
          <button class="choice" data-route="long" type="button"><span><strong>林下远路</strong><small>脚印隐蔽 · 体力消耗更多</small></span><i data-lucide="footprints"></i></button>
        </div>
      </aside>
      <div class="frost"></div><div class="shade"></div>
    </section>

    <section class="scene camp-scene" id="campScene" hidden aria-label="第二章 密营余火">
      <img class="scene-bg camp-bg" src="${assets.day}" alt="风雪中的隐蔽密营" />
      <canvas class="snow-canvas"></canvas>
      <div class="camp-roof"></div>
      <div class="narrative camp-narrative">
        <p class="kicker">第二章 · 密营余火</p>
        <blockquote>“屋里没有多余的东西。每一件，都要跟着人走进黑夜。”</blockquote>
      </div>
      <img class="camp-person captain" src="${assets.captain}" alt="林队长" />
      <img class="camp-person zhou" src="${assets.zhou}" alt="负伤的老周" />
      <img class="camp-person messenger" src="${assets.messenger}" alt="通讯员小满" />
      <div class="camp-table" aria-label="密营物件">
        <button class="camp-object object-lamp" data-object="lamp" aria-label="查看火盆" type="button"><img src="${assets.lamp}" alt="" /><span>余火</span></button>
        <button class="camp-object object-medbox" data-object="medbox" aria-label="查看药箱" type="button"><img src="${assets.medbox}" alt="" /><span>药箱</span></button>
        <button class="camp-object object-map" data-object="map" aria-label="查看路线图" type="button"><img src="${assets.map}" alt="" /><span>路线图</span></button>
        <button class="camp-object object-food" data-object="food" aria-label="查看干粮" type="button"><img src="${assets.food}" alt="" /><span>干粮</span></button>
        <button class="camp-object object-coat" data-object="coat" aria-label="查看棉衣" type="button"><img src="${assets.coat}" alt="" /><span>棉衣</span></button>
      </div>
      <div class="object-note" id="objectNote"><span>0 / 5</span><p>查看密营里的五件物品</p></div>
      <aside class="paper-sheet decision-sheet" id="campDecision" hidden aria-live="polite"></aside>
      <aside class="map-study" id="mapStudy" hidden aria-label="记住封锁路线">
        <p class="sheet-label">路线只展开五秒</p>
        <img src="${assets.map}" alt="由枯松、河沟、石崖组成的路线图" />
        <ol><li>枯松</li><li>河沟</li><li>石崖</li></ol>
        <span class="map-countdown">5</span>
      </aside>
      <aside class="paper-sheet recall-sheet" id="recallSheet" hidden>
        <p class="sheet-label">地图已经收起</p>
        <h2>三个标志的顺序是？</h2>
        <div class="choices compact">
          <button class="choice" data-sequence="correct" type="button"><span><strong>枯松 → 河沟 → 石崖</strong></span><i data-lucide="arrow-right"></i></button>
          <button class="choice" data-sequence="wrong" type="button"><span><strong>河沟 → 石崖 → 枯松</strong></span><i data-lucide="arrow-right"></i></button>
          <button class="choice" data-sequence="wrong" type="button"><span><strong>石崖 → 枯松 → 河沟</strong></span><i data-lucide="arrow-right"></i></button>
        </div>
      </aside>
      <div class="shade"></div>
    </section>

    <section class="scene journey-scene night-scene" id="nightScene" hidden aria-label="第三章 夜越封锁">
      <img class="scene-bg night-bg" src="${assets.night}" alt="月夜中的封锁线" />
      <canvas class="spotlight-canvas"></canvas><canvas class="snow-canvas"></canvas>
      <div class="narrative night-narrative">
        <p class="kicker">第三章 · <span id="nightSection">枯松哨线</span></p>
        <blockquote>“远处没有路标。只有风向、树影，还有不能被照见的脚印。”</blockquote>
      </div>
      <div class="enemy enemy-one"><img src="${assets.enemyOne}" alt="远处巡逻兵" /></div>
      <div class="enemy enemy-two"><img src="${assets.enemyTwo}" alt="持灯搜索的巡逻兵" /></div>
      <div class="cover night-cover-1" data-cover="0"><img src="${assets.deadPine}" alt="枯松掩体" /><span class="anchor"></span></div>
      <div class="cover night-cover-2" data-cover="1"><img src="${assets.rock}" alt="岩石掩体" /><span class="anchor"></span></div>
      <div class="cover night-cover-3" data-cover="2"><img src="${assets.log}" alt="倒木掩体" /><span class="anchor"></span></div>
      <img class="night-shrub" src="${assets.shrub}" alt="" />
      <div class="footprints-layer" aria-hidden="true"></div>
      <span class="waypoint" aria-hidden="true"></span>
      <div class="player" data-testid="night-player"><img src="${assets.heroCrouch}" alt="伏低前行的交通员" /></div>
      <button class="breath-control" id="breathButton" type="button"><span>屏息</span><small>按住</small></button>
      <div class="task-hint">循掩体前进 · 灯光逼近时屏息</div>
      <div class="danger-vignette"></div><div class="frost"></div><div class="shade"></div>
    </section>

    <section class="scene fire-scene" id="fireScene" hidden aria-label="第四章 守住火种">
      <img class="scene-bg fire-bg" src="${assets.night}" alt="暴风雪中的残破山屋" />
      <canvas class="snow-canvas"></canvas>
      <div class="narrative fire-narrative">
        <p class="kicker">第四章 · 守住火种</p>
        <blockquote>“风从窗缝里灌进来。档案上的路，只差最后一段光。”</blockquote>
      </div>
      <img class="fire-captain" src="${assets.captain}" alt="将档案交出的林队长" />
      <img class="fire-archive" src="${assets.archive}" alt="桦皮联络档案" />
      <button class="lamp-guard" id="lampGuard" type="button" aria-label="按住护住油灯火苗">
        <span class="flame"><span></span></span>
        <img src="${assets.lamp}" alt="油灯" />
        <span class="guard-meter"><b></b></span>
      </button>
      <div class="task-hint" id="fireHint">用手挡住火苗 · 持续六秒</div>
      <aside class="paper-sheet archive-choice" id="archiveChoice" hidden>
        <p class="sheet-label">档案去向</p>
        <h2>光照出了最后一段路线</h2>
        <p>远处的灯正在逼近。无论怎样选择，历史都不会被一局游戏改写。</p>
        <div class="choices">
          <button class="choice" data-archive-choice="companion" type="button"><span><strong>交给同伴带走</strong><small>你留下掩护，不承诺个人生还</small></span><i data-lucide="hand"></i></button>
          <button class="choice" data-archive-choice="tree" type="button"><span><strong>封入树洞</strong><small>象征性艺术表达，等待后来者</small></span><i data-lucide="archive"></i></button>
        </div>
      </aside>
      <div class="shade"></div><div class="frost"></div>
    </section>

    <section class="scene echo-scene" id="echoScene" hidden aria-label="终章 山河回响">
      <img class="scene-bg echo-modern" src="${assets.poster}" alt="雪后晨光中的长白山林" />
      <div class="echo-historic"><img src="${assets.night}" alt="黑白雪夜山林" /></div>
      <div class="echo-copy">
        <p class="kicker">终章 · 山河回响</p>
        <h2>把黑夜交还给山河</h2>
        <p>拖开旧影。你所见的春天，从来不是一局游戏的奖赏。</p>
      </div>
      <div class="reveal-control">
        <label for="echoRange"><span>旧影</span><span>今朝</span></label>
        <input id="echoRange" type="range" min="0" max="100" value="0" aria-label="拖动查看当代山河" />
      </div>
      <button class="primary-btn echo-continue" id="echoContinue" type="button" hidden><span>接过这份记忆</span><i data-lucide="arrow-right"></i></button>
      <div class="shade"></div>
    </section>

    <section class="scene result-scene" id="resultScene" hidden aria-label="个人体验档案">
      <img class="scene-bg result-bg" src="${assets.poster}" alt="雪后山林" />
      <article class="result-document">
        <header><p>个人体验档案 · 001</p><span>不作评分</span></header>
        <h2>火种抵达之后</h2>
        <p class="record" data-record="cost"></p>
        <p class="record" data-record="companion"></p>
        <p class="record" data-record="memory"></p>
        <p class="record" data-record="ending"></p>
        <section class="source-note">
          <h3>史实与创作说明</h3>
          <p>东北抗联密营是山林斗争环境中的重要依托。虚构交通员用于承载交互，不对应单一真实人物；路线、封锁与树洞情节为艺术化合成。</p>
          <p>正式参赛版的具体年份、地域、装备与馆藏编号，需由史料顾问依据纪念馆、档案馆、地方志及权威出版物完成终审。</p>
        </section>
        <blockquote>“白山黑水犹在。记忆被交到我们手中。”</blockquote>
        <div class="result-actions">
          <button class="primary-btn" id="restartBtn" type="button"><span>重新体验另一种选择</span><i data-lucide="rotate-ccw"></i></button>
        </div>
      </article>
    </section>

    <header class="topbar" id="topbar" hidden>
      <div class="chapter-mark"><span class="chapter-no">01</span><span class="chapter-line"></span><span class="chapter-name">雪线行军</span></div>
      <div class="icon-actions">
        <button class="icon-btn" id="settingsBtn" type="button" aria-label="体验设置" title="体验设置"><i data-lucide="settings-2"></i></button>
        <button class="icon-btn" id="soundBtn" type="button" aria-label="关闭声音" title="关闭声音" aria-pressed="false"><i data-lucide="volume-2"></i></button>
      </div>
      <span class="chapter-progress"><b></b></span>
    </header>

    <div class="status" id="statusBar" hidden aria-label="当前状态">
      <div class="status-item"><i data-lucide="thermometer"></i><div class="status-track" title="体温"><div class="status-fill" data-status="warmth"></div></div></div>
      <div class="status-item"><i data-lucide="footprints"></i><div class="status-track" title="体力"><div class="status-fill" data-status="stamina"></div></div></div>
      <div class="status-item danger"><i data-lucide="eye"></i><div class="status-track" title="暴露"><div class="status-fill" data-status="exposure"></div></div></div>
    </div>

    <aside class="settings-panel" id="settingsPanel" hidden aria-label="体验设置">
      <div class="settings-head"><h2>体验设置</h2><button class="plain-icon" id="closeSettings" type="button" aria-label="关闭设置"><i data-lucide="x"></i></button></div>
      <label><span><strong>低动态模式</strong><small>减少风雪、镜头移动与画面抖动</small></span><input id="reduceToggle" type="checkbox" /></label>
      <label><span><strong>辅助潜行</strong><small>显示灯光边界并延长容错时间</small></span><input id="assistToggle" type="checkbox" /></label>
    </aside>

    <aside class="memory-sheet paper-sheet" id="memorySheet" hidden aria-live="polite">
      <button class="plain-icon close-memory" type="button" aria-label="关闭史料卡"><i data-lucide="x"></i></button>
      <p class="sheet-label">记忆物件 · 旧药箱</p>
      <img src="${assets.medbox}" alt="旧式木制药箱" />
      <h2>雪下留下的空处</h2>
      <p>严寒山林中的医疗补给难以维持。此物件用于呈现匮乏处境，不对应一件已确认馆藏；正式版须补充来源编号。</p>
    </aside>

    <div class="toast" role="status" aria-live="polite"></div>
    <div class="grain"></div>
    <p class="hidden-accessible" id="liveRegion" aria-live="assertive"></p>
  </main>
`;

createIcons({ icons });

const game = document.querySelector("#game");
const scenes = Object.fromEntries([...document.querySelectorAll(".scene")].map((scene) => [scene.id.replace("Scene", ""), scene]));
const topbar = document.querySelector("#topbar");
const statusBar = document.querySelector("#statusBar");
const toast = document.querySelector(".toast");
const liveRegion = document.querySelector("#liveRegion");
const breathButton = document.querySelector("#breathButton");
let activeTimeline = null;
let nightFrame = 0;
let snowStops = [];
let fireTween = null;
let mapTimer = null;
let lastFootprint = 0;

const positions = {
  day: { start: [0.52, 0.86], covers: [[0.17, 0.70], [0.78, 0.63], [0.49, 0.82]] },
  night: { start: [0.16, 0.87], covers: [[0.17, 0.70], [0.76, 0.62], [0.52, 0.82]] },
};

function duration(value) {
  return state.reduced ? 0 : value;
}

function saveProgress() {
  if (["intro", "archive"].includes(state.scene)) return;
  const serializable = { ...state, breathing: false, sheltered: false, running: true };
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
}

function restoreState(saved) {
  Object.assign(state, createInitialState(), saved, { breathing: false, sheltered: false, running: true });
}

function clearSceneActivity() {
  activeTimeline?.kill();
  activeTimeline = null;
  cancelAnimationFrame(nightFrame);
  nightFrame = 0;
  snowStops.forEach((stop) => stop());
  snowStops = [];
  clearInterval(mapTimer);
}

function setChapter(sceneName) {
  const meta = sceneMeta[sceneName];
  if (!meta) {
    topbar.hidden = true;
    statusBar.hidden = true;
    return;
  }
  topbar.hidden = false;
  statusBar.hidden = !["day", "night"].includes(sceneName);
  topbar.querySelector(".chapter-no").textContent = meta[0];
  topbar.querySelector(".chapter-name").textContent = meta[1];
  topbar.querySelector(".chapter-progress b").style.transform = `scaleX(${meta[2] / 100})`;
}

function transitionTo(sceneName, after) {
  const current = scenes[state.scene];
  const next = scenes[sceneName];
  clearSceneActivity();
  next.hidden = false;
  gsap.set(current, { pointerEvents: "none" });
  gsap.set(next, { autoAlpha: 0, pointerEvents: "none", zIndex: 60 });
  state.scene = sceneName;
  setChapter(sceneName);
  audio.setScene(sceneName);
  const complete = () => {
    if (current && current !== next) current.hidden = true;
    gsap.set(next, { clearProps: "visibility", pointerEvents: "auto" });
    after?.();
    saveProgress();
  };
  activeTimeline = gsap.timeline({ defaults: { duration: duration(0.55), ease: "power2.inOut" }, onComplete: complete })
    .to(current, { autoAlpha: 0 }, 0)
    .fromTo(next, { autoAlpha: 0, scale: state.reduced ? 1 : 1.015 }, { autoAlpha: 1, scale: 1 }, duration(0.16));
}

function updateStatus() {
  for (const key of ["warmth", "stamina", "exposure"]) {
    const fill = document.querySelector(`[data-status="${key}"]`);
    fill.style.transform = `scaleX(${clamp(state[key]) / 100})`;
  }
  const activeFrost = scenes[state.scene]?.querySelector(".frost");
  if (activeFrost) activeFrost.style.opacity = String(0.12 + (100 - clamp(state.warmth)) / 130);
}

function showToast(message, displayTime = 1800) {
  toast.textContent = message;
  liveRegion.textContent = message;
  gsap.killTweensOf(toast);
  gsap.timeline()
    .set(toast, { autoAlpha: 0, y: 8 })
    .to(toast, { autoAlpha: 1, y: 0, duration: duration(0.25) })
    .to(toast, { autoAlpha: 0, y: -5, duration: duration(0.25) }, `+=${displayTime / 1000}`);
}

function startSnow(scene, count) {
  const canvas = scene.querySelector(".snow-canvas");
  if (!canvas) return;
  const rect = scene.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const context = canvas.getContext("2d");
  const flakes = Array.from({ length: state.reduced ? Math.min(28, count) : count }, () => ({
    x: Math.random() * rect.width, y: Math.random() * rect.height,
    radius: 0.4 + Math.random() * 1.55, velocity: 0.25 + Math.random() * 0.85,
  }));
  let frame = 0;
  const render = () => {
    if (scene.hidden || !state.running) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "rgba(237,242,240,.54)";
    for (const flake of flakes) {
      flake.y += flake.velocity;
      flake.x -= flake.velocity * 0.42;
      if (flake.y > rect.height) { flake.y = -3; flake.x = Math.random() * rect.width; }
      if (flake.x < -3) flake.x = rect.width + 3;
      context.beginPath(); context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2); context.fill();
    }
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);
  snowStops.push(() => cancelAnimationFrame(frame));
}

function preloadAssets() {
  const startButton = document.querySelector("#startBtn");
  const urls = [...new Set(Object.values(assets))];
  const loads = urls.map((source) => new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve; image.onerror = resolve; image.src = source;
  }));
  Promise.all(loads).then(() => {
    startButton.disabled = false;
    startButton.innerHTML = `<span>启封档案</span><i data-lucide="archive"></i>`;
    createIcons({ icons });
  });
}

function resetRun() {
  const preferences = { muted: state.muted, reduced: state.reduced, assisted: state.assisted };
  restoreState({ ...preferences });
  localStorage.removeItem(SAVE_KEY);
  updateStatus();
}

function beginArchive() {
  audio.unlock();
  resetRun();
  transitionTo("archive", setupFrostCanvas);
}

function setupFrostCanvas() {
  const canvas = document.querySelector("#frostCanvas");
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.fillStyle = "rgba(206,216,213,.94)";
  context.fillRect(0, 0, rect.width, rect.height);
  for (let index = 0; index < 180; index += 1) {
    context.strokeStyle = `rgba(244,248,245,${0.08 + Math.random() * 0.2})`;
    context.lineWidth = 0.5 + Math.random() * 1.4;
    context.beginPath();
    const x = Math.random() * rect.width; const y = Math.random() * rect.height;
    context.moveTo(x, y); context.lineTo(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 50); context.stroke();
  }
  canvas.dataset.ready = "true";
}

const scratchedCells = new Set();
let scratchPointer = null;
let scratchTaps = 0;
function scratchAt(event) {
  const canvas = document.querySelector("#frostCanvas");
  if (canvas.dataset.ready !== "true") setupFrostCanvas();
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left; const y = event.clientY - rect.top;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const context = canvas.getContext("2d");
  context.save(); context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.globalCompositeOperation = "destination-out";
  const radius = Math.max(24, rect.width * 0.09);
  context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill(); context.restore();
  const gridX = Math.floor((x / rect.width) * 10); const gridY = Math.floor((y / rect.height) * 16);
  for (let ox = -1; ox <= 1; ox += 1) for (let oy = -1; oy <= 1; oy += 1) scratchedCells.add(`${gridX + ox}:${gridY + oy}`);
  if (scratchedCells.size / 160 >= 0.45 || scratchTaps >= 3) revealArchive();
}

function revealArchive() {
  const canvas = document.querySelector("#frostCanvas");
  if (canvas.dataset.revealed === "true") return;
  canvas.dataset.revealed = "true";
  document.querySelector("#holdEntry").hidden = false;
  document.querySelector("#scratchHint").textContent = "照片已经显出 · 按住进入记忆";
  gsap.to(canvas, { autoAlpha: 0.28, duration: duration(0.7) });
  gsap.fromTo(".photo-years span", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: duration(0.4) });
}

function startEntryHold(event) {
  event.preventDefault();
  audio.unlock();
  const button = document.querySelector("#holdEntry");
  button.setPointerCapture?.(event.pointerId);
  gsap.killTweensOf(button);
  gsap.set(button, { "--hold-progress": 0 });
  gsap.to(button, { "--hold-progress": 1, duration: duration(1.2), ease: "none", onComplete: enterDay });
}

function cancelEntryHold() {
  const button = document.querySelector("#holdEntry");
  gsap.killTweensOf(button);
  gsap.to(button, { "--hold-progress": 0, duration: duration(0.2) });
}

function enterDay() {
  audio.cue(330, 0.35);
  transitionTo("day", () => {
    resetPlayer("day"); updateWaypoint("day"); updateStatus(); startSnow(scenes.day, 76);
    activeTimeline = gsap.timeline({ defaults: { duration: duration(0.55), ease: "power2.out" } })
      .fromTo(scenes.day.querySelectorAll(".narrative > *"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.12 })
      .fromTo(scenes.day.querySelectorAll(".cover"), { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.08 }, "<0.18");
  });
}

function sceneMetrics() {
  const rect = game.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function resetPlayer(sceneName) {
  const scene = scenes[sceneName]; const player = scene.querySelector(".player");
  const [px, py] = positions[sceneName].start; const { width, height } = sceneMetrics();
  player._x = px * width; player._y = py * height;
  gsap.set(player, { x: player._x - player.offsetWidth / 2, y: player._y - player.offsetHeight, scale: 1, autoAlpha: 1 });
}

function updateWaypoint(sceneName) {
  const scene = scenes[sceneName]; const step = state[`${sceneName}Step`];
  const point = positions[sceneName].covers[step]; const waypoint = scene.querySelector(".waypoint");
  if (!point) { waypoint.hidden = true; return; }
  waypoint.hidden = false;
  waypoint.style.left = `calc(${point[0] * 100}% - 12px)`;
  waypoint.style.top = `calc(${point[1] * 100}% - 12px)`;
  scene.querySelectorAll(".cover").forEach((cover, index) => cover.classList.toggle("active", index === step));
}

function addFootprint(scene, x, y) {
  const now = performance.now();
  if (now - lastFootprint < 110) return;
  lastFootprint = now;
  const mark = document.createElement("span");
  mark.style.left = `${x}px`; mark.style.top = `${y}px`;
  scene.querySelector(".footprints-layer").append(mark);
  gsap.fromTo(mark, { autoAlpha: 0.42, scale: 0.7 }, { autoAlpha: 0, scale: 1, duration: state.reduced ? 2 : 4.5, onComplete: () => mark.remove() });
}

function attachMovement(sceneName) {
  const scene = scenes[sceneName]; const player = scene.querySelector(".player");
  let pointerId = null;
  const xTo = gsap.quickTo(player, "x", { duration: state.reduced ? 0 : 0.18, ease: "power2.out" });
  const yTo = gsap.quickTo(player, "y", { duration: state.reduced ? 0 : 0.18, ease: "power2.out" });
  const move = (event) => {
    if (pointerId === null || state.scene !== sceneName) return;
    const rect = scene.getBoundingClientRect();
    const x = clampMovement(event.clientX - rect.left, 34, rect.width - 34);
    const y = clampMovement(event.clientY - rect.top, rect.height * 0.48, rect.height * 0.9);
    player._x = x; player._y = y; player.classList.add("walking"); player.classList.remove("sheltered"); state.sheltered = false;
    xTo(x - player.offsetWidth / 2); yTo(y - player.offsetHeight); addFootprint(scene, x, y + 2);
  };
  const end = (event) => {
    if (pointerId === null) return;
    pointerId = null; player.classList.remove("walking"); player.querySelector("img").src = assets.heroCrouch;
    const step = state[`${sceneName}Step`]; const point = positions[sceneName].covers[step];
    if (!point) return;
    const { width, height } = sceneMetrics(); const distanceToCover = Math.hypot(player._x - point[0] * width, player._y - point[1] * height);
    if (distanceToCover < Math.max(52, width * 0.17)) {
      player._x = point[0] * width; player._y = point[1] * height;
      gsap.to(player, { x: player._x - player.offsetWidth / 2, y: player._y - player.offsetHeight, duration: duration(0.2), ease: "power2.out" });
      completeCover(sceneName, step);
    }
  };
  scene.addEventListener("pointerdown", (event) => {
    if (state.scene !== sceneName || event.target.closest("button, aside")) return;
    pointerId = event.pointerId; player.querySelector("img").src = assets.heroWalk; move(event);
  });
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
}

function clampMovement(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function completeCover(sceneName, index) {
  if (index !== state[`${sceneName}Step`]) return;
  const scene = scenes[sceneName]; const player = scene.querySelector(".player");
  state.sheltered = true; state.exposure = Math.max(0, state.exposure - 16); state[`${sceneName}Step`] += 1;
  player.classList.add("sheltered"); navigator.vibrate?.(24); audio.cue(170, 0.09);
  updateStatus(); updateWaypoint(sceneName); showToast(coverLines[index], 1050);
  if (sceneName === "day") {
    if (state.dayStep === 2 && !state.memories.includes("medicine")) document.querySelector("#medicineMemory").hidden = false;
    if (state.dayStep === 3) window.setTimeout(() => showSheet(document.querySelector("#routeSheet")), 650);
  } else {
    document.querySelector("#nightSection").textContent = ["冻河沟", "石崖封锁", "封锁线之后"][index];
    if (index === 1 && state.food === "share") {
      state.exposure = Math.max(0, state.exposure - 28); showToast("老周在远处制造了声响。巡逻灯转开了。", 1600);
    }
    if (state.nightStep === 3) window.setTimeout(enterFire, 850);
  }
  saveProgress();
}

function showSheet(sheet) {
  sheet.hidden = false;
  gsap.fromTo(sheet, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: duration(0.42), ease: "power3.out" });
}

function chooseRoute(route) {
  state.route = route;
  if (route === "short") { state.warmth -= 15; state.stamina -= 5; state.exposure += 5; }
  else { state.warmth -= 7; state.stamina -= 12; }
  updateStatus();
  const message = route === "short" ? "你省下了路程，迎风坡带走了更多体温。" : "林下遮住了脚印，更长的路消耗了体力。";
  showToast(message, 1450); saveProgress();
  gsap.to("#routeSheet", { autoAlpha: 0, y: 24, duration: duration(0.32), onComplete: enterCamp });
}

const objectNotes = {
  lamp: "火盆只剩余温，不能再添柴。烟会把密营的位置送出去。",
  medbox: "药箱里只剩几卷布和空瓶。老周把位置让给更急的人。",
  map: "地图上的三个标志被反复描深：枯松、河沟、石崖。",
  food: "最后一份干粮冻得发硬。它只能支撑一个人的下一段路。",
  coat: "唯一干燥的棉衣搭在木箱上。风口就在封锁线前面。",
};

function enterCamp() {
  transitionTo("camp", () => {
    startSnow(scenes.camp, 32);
    gsap.fromTo(scenes.camp.querySelectorAll(".camp-person, .camp-object"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: duration(0.45) });
  });
}

function inspectObject(button) {
  const key = button.dataset.object;
  if (!state.inspected.includes(key)) state.inspected.push(key);
  button.classList.add("inspected");
  const note = document.querySelector("#objectNote");
  note.querySelector("span").textContent = `${state.inspected.length} / 5`;
  note.querySelector("p").textContent = objectNotes[key];
  audio.cue(220 + state.inspected.length * 20, 0.08);
  if (state.inspected.length === 5) window.setTimeout(() => showCampDecision("food"), 550);
  saveProgress();
}

function showCampDecision(kind) {
  const sheet = document.querySelector("#campDecision");
  sheet.dataset.kind = kind;
  sheet.innerHTML = kind === "food" ? `
    <p class="sheet-label">选择一 · 最后一份干粮</p><h2>木桌旁没有多余的一份</h2>
    <p>老周仍能行动，但伤口让他难以跟上。你的夜行也需要体力。</p>
    <div class="choices">
      <button class="choice" data-food="keep"><span><strong>留作夜行补充</strong><small>体力提高 · 老周留下休息</small></span><i data-lucide="utensils"></i></button>
      <button class="choice" data-food="share"><span><strong>分给伤员老周</strong><small>同行增加 · 夜里得到一次掩护</small></span><i data-lucide="briefcase-medical"></i></button>
    </div>` : `
    <p class="sheet-label">选择二 · 唯一干燥棉衣</p><h2>门缝里的风越来越近</h2>
    <p>棉衣只能穿在一个人身上。你和小满都要经过风口。</p>
    <div class="choices">
      <button class="choice" data-coat="keep"><span><strong>自己穿上</strong><small>体温提高 · 屏息消耗降低</small></span><i data-lucide="shirt"></i></button>
      <button class="choice" data-coat="share"><span><strong>交给通讯员小满</strong><small>同行增加 · 获得灯光方向提示</small></span><i data-lucide="accessibility"></i></button>
    </div>`;
  createIcons({ icons }); showSheet(sheet);
}

function chooseCampResource(kind, value) {
  if (kind === "food") {
    state.food = value;
    if (value === "keep") state.stamina = clamp(state.stamina + 20);
    else { state.stamina = clamp(state.stamina - 8); state.bond += 1; }
    gsap.to("#campDecision", { autoAlpha: 0, y: 20, duration: duration(0.25), onComplete: () => showCampDecision("coat") });
  } else {
    state.coat = value;
    if (value === "keep") state.warmth = clamp(state.warmth + 22);
    else { state.warmth = clamp(state.warmth - 8); state.bond += 1; }
    gsap.to("#campDecision", { autoAlpha: 0, y: 20, duration: duration(0.25), onComplete: startMapStudy });
  }
  updateStatus(); saveProgress();
}

function startMapStudy() {
  const study = document.querySelector("#mapStudy");
  study.hidden = false;
  let seconds = 5;
  study.querySelector(".map-countdown").textContent = seconds;
  gsap.fromTo(study, { autoAlpha: 0 }, { autoAlpha: 1, duration: duration(0.35) });
  clearInterval(mapTimer);
  mapTimer = window.setInterval(() => {
    seconds -= 1; study.querySelector(".map-countdown").textContent = seconds;
    if (seconds <= 0) finishMapStudy();
  }, 1000);
}

function finishMapStudy() {
  clearInterval(mapTimer);
  const study = document.querySelector("#mapStudy");
  if (study.hidden) return;
  gsap.to(study, { autoAlpha: 0, duration: duration(0.25), onComplete: () => { study.hidden = true; showSheet(document.querySelector("#recallSheet")); } });
}

function chooseSequence(correct) {
  state.routeMemory = correct;
  if (!correct) { state.searches = 1; state.exposure = clamp(state.exposure + 8); }
  showToast(correct ? "三个标志重新连成了路。" : "方向偏了一次。前方巡逻已经更近。", 1300);
  saveProgress();
  gsap.to("#recallSheet", { autoAlpha: 0, y: 20, duration: duration(0.28), onComplete: () => window.setTimeout(enterNight, 350) });
}

function enterNight() {
  transitionTo("night", () => {
    state.sheltered = true;
    if (state.coat === "share") {
      state.assisted = true; document.querySelector("#assistToggle").checked = true;
      showToast("小满打出手势：灯光将从右侧折返。", 1700);
    }
    resetPlayer("night"); updateWaypoint("night"); updateStatus(); startSnow(scenes.night, 62); startNightLoop();
    activeTimeline = gsap.timeline({ defaults: { duration: duration(0.5), ease: "power2.out" } })
      .fromTo(scenes.night.querySelectorAll(".enemy"), { autoAlpha: 0, x: 12 }, { autoAlpha: 0.78, x: 0, stagger: 0.12 })
      .fromTo(scenes.night.querySelectorAll(".cover"), { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.08 }, "<");
  });
}

function startNightLoop() {
  cancelAnimationFrame(nightFrame);
  let previous = performance.now();
  const tick = (now) => {
    if (state.scene !== "night" || !state.running) return;
    const delta = Math.min(0.05, (now - previous) / 1000); previous = now;
    drawSpotlight(now, delta); nightFrame = requestAnimationFrame(tick);
  };
  nightFrame = requestAnimationFrame(tick);
}

function drawSpotlight(now, delta) {
  const scene = scenes.night; const canvas = scene.querySelector(".spotlight-canvas"); const rect = scene.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
  }
  const context = canvas.getContext("2d"); context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, rect.width, rect.height);
  const origin = { x: rect.width * 0.84, y: rect.height * 0.31 };
  const speed = state.searches >= 2 ? 0.0003 : state.routeMemory === false ? 0.00048 : 0.0004;
  const angle = 1.9 + Math.sin(now * speed) * 0.65; const spread = state.assisted ? 0.34 : 0.3; const length = rect.height * 0.82;
  const gradient = context.createRadialGradient(origin.x, origin.y, 5, origin.x, origin.y, length);
  gradient.addColorStop(0, "rgba(242,239,207,.52)"); gradient.addColorStop(0.55, "rgba(228,234,218,.25)"); gradient.addColorStop(1, "rgba(210,222,215,0)");
  context.beginPath(); context.moveTo(origin.x, origin.y); context.arc(origin.x, origin.y, length, angle - spread, angle + spread); context.closePath(); context.fillStyle = gradient; context.fill();
  if (state.assisted || state.searches >= 2) { context.strokeStyle = "rgba(235,240,224,.62)"; context.lineWidth = 1; context.stroke(); }
  const player = scene.querySelector(".player");
  if (!Number.isFinite(player._x) || state.sheltered) {
    state.exposure = Math.max(0, state.exposure - delta * 10); state.centerLightTime = 0; updateStatus(); return;
  }
  const dx = player._x - origin.x; const dy = player._y - origin.y; const distanceFromLight = Math.hypot(dx, dy);
  const playerAngle = Math.atan2(dy, dx); const difference = Math.abs(Math.atan2(Math.sin(playerAngle - angle), Math.cos(playerAngle - angle)));
  const inEdge = distanceFromLight < length && difference < spread; const inCenter = distanceFromLight < length && difference < spread * 0.46;
  const breathFactor = state.breathing ? 0.28 : 1;
  state.exposure = inEdge ? clamp(state.exposure + delta * 18 * breathFactor) : clamp(state.exposure - delta * 7);
  state.centerLightTime = inCenter ? state.centerLightTime + delta * breathFactor : 0;
  scene.querySelector(".danger-vignette").classList.toggle("hot", inEdge);
  if (state.centerLightTime > (state.assisted || state.searches >= 2 ? 0.9 : 0.65) || state.exposure >= 100) triggerSearch();
  if (state.breathing) {
    state.stamina = clamp(state.stamina - delta * (state.coat === "keep" ? 5 : 8));
    if (state.stamina === 0) stopBreathing();
  }
  updateStatus();
}

function triggerSearch() {
  state.searches += 1; state.centerLightTime = 0; state.exposure = Math.max(28, state.exposure - 35); state.sheltered = true;
  navigator.vibrate?.([35, 45, 35]);
  const player = scenes.night.querySelector(".player"); const fallback = state.nightStep === 0 ? positions.night.start : positions.night.covers[state.nightStep - 1];
  const { width, height } = sceneMetrics(); player._x = fallback[0] * width; player._y = fallback[1] * height;
  gsap.timeline({ defaults: { ease: "power2.inOut" } })
    .to(scenes.night, { x: state.reduced ? 0 : 4, duration: 0.06, repeat: state.reduced ? 0 : 3, yoyo: true })
    .to(player, { x: player._x - player.offsetWidth / 2, y: player._y - player.offsetHeight, duration: duration(0.4) })
    .set(scenes.night, { x: 0 });
  player.classList.add("sheltered");
  if (state.searches >= 2) state.assisted = true;
  showToast(state.searches >= 2 ? "风雪收紧了视野。巡逻节奏已经放缓。" : "队长按低你的肩。退回上一处掩体。", 1650);
  saveProgress();
}

function startBreathing(event) {
  event.preventDefault();
  if (state.scene !== "night" || state.stamina <= 0) return;
  state.breathing = true; breathButton.classList.add("active"); breathButton.setPointerCapture?.(event.pointerId);
}
function stopBreathing() { state.breathing = false; breathButton.classList.remove("active"); }

function enterFire() {
  transitionTo("fire", () => {
    startSnow(scenes.fire, 46);
    gsap.fromTo([".fire-captain", ".fire-archive", ".lamp-guard"], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: duration(0.5) });
  });
}

function startProtectFlame(event) {
  event.preventDefault();
  if (state.scene !== "fire" || !document.querySelector("#archiveChoice").hidden) return;
  const guard = document.querySelector("#lampGuard"); guard.classList.add("guarding"); guard.setPointerCapture?.(event.pointerId);
  const progress = Number(guard.dataset.progress || 0); const holder = { value: progress };
  fireTween?.kill();
  fireTween = gsap.to(holder, {
    value: 1, duration: duration((1 - progress) * 6), ease: "none",
    onUpdate: () => { guard.dataset.progress = String(holder.value); guard.style.setProperty("--guard", holder.value); },
    onComplete: completeFire,
  });
}

function stopProtectFlame() {
  const guard = document.querySelector("#lampGuard"); guard.classList.remove("guarding"); fireTween?.kill();
  if (guard.disabled) return;
  const holder = { value: Number(guard.dataset.progress || 0) };
  fireTween = gsap.to(holder, { value: Math.max(0, holder.value - 0.16), duration: duration(0.5), onUpdate: () => { guard.dataset.progress = String(holder.value); guard.style.setProperty("--guard", holder.value); } });
}

function completeFire() {
  const guard = document.querySelector("#lampGuard"); guard.classList.remove("guarding"); guard.disabled = true;
  document.querySelector("#fireHint").textContent = "火光照出了档案上的最后一段路";
  audio.cue(360, 0.22); navigator.vibrate?.(30); showSheet(document.querySelector("#archiveChoice"));
}

function chooseArchive(value) {
  state.archiveChoice = value; saveProgress();
  const image = document.createElement("img"); image.className = "hands-transition"; image.src = assets.handsArchive; image.alt = "手与手传递档案";
  scenes.fire.append(image);
  gsap.timeline({ defaults: { duration: duration(0.55), ease: "power2.out" } })
    .fromTo(image, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1 })
    .to(image, { autoAlpha: 0 }, "+=0.65")
    .add(enterEcho);
}

function enterEcho() {
  transitionTo("echo", () => {
    const range = document.querySelector("#echoRange"); range.value = 0; updateEchoReveal(0);
    gsap.fromTo(".echo-copy > *", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: duration(0.5) });
  });
}

function updateEchoReveal(value) {
  const amount = Number(value); document.querySelector(".echo-historic").style.clipPath = `inset(0 ${amount}% 0 0)`;
  document.querySelector("#echoContinue").hidden = amount < 88;
}

function showResult() {
  const record = buildRecord(state);
  for (const [key, value] of Object.entries(record)) document.querySelector(`[data-record="${key}"]`).textContent = value;
  transitionTo("result", () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, scene: "result" }));
    gsap.fromTo(".result-document", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration(0.6), ease: "power3.out" });
  });
}

function discoverMedicine() {
  if (!state.memories.includes("medicine")) state.memories.push("medicine");
  document.querySelector("#medicineMemory").classList.add("found"); showSheet(document.querySelector("#memorySheet")); audio.cue(420, 0.14); saveProgress();
}

function closeMemory() {
  gsap.to("#memorySheet", { autoAlpha: 0, y: 18, duration: duration(0.25), onComplete: () => { document.querySelector("#memorySheet").hidden = true; } });
}

function toggleSound() {
  audio.unlock(); state.muted = !state.muted; audio.setMuted(state.muted);
  const button = document.querySelector("#soundBtn");
  button.innerHTML = `<i data-lucide="${state.muted ? "volume-x" : "volume-2"}"></i>`;
  button.setAttribute("aria-label", state.muted ? "开启声音" : "关闭声音"); button.setAttribute("aria-pressed", String(state.muted));
  createIcons({ icons }); showToast(state.muted ? "环境声已关闭" : "环境声已开启", 900);
}

function toggleSettings(force) {
  const panel = document.querySelector("#settingsPanel"); const shouldOpen = force ?? panel.hidden;
  if (shouldOpen) { panel.hidden = false; gsap.fromTo(panel, { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: duration(0.28) }); }
  else gsap.to(panel, { autoAlpha: 0, x: 18, duration: duration(0.22), onComplete: () => { panel.hidden = true; } });
}

function resumeRun() {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
  if (!saved) return beginArchive();
  restoreState(saved); audio.unlock();
  const target = ["day", "camp", "night", "fire", "echo", "result"].includes(saved.scene) ? saved.scene : "day";
  state.scene = "intro";
  if (target === "day") { state.dayStep = 0; enterDay(); }
  else if (target === "camp") { state.inspected = []; enterCamp(); }
  else if (target === "night") { state.nightStep = 0; enterNight(); }
  else if (target === "fire") enterFire();
  else if (target === "echo") enterEcho();
  else showResult();
}

document.querySelector("#startBtn").addEventListener("click", beginArchive);
document.querySelector("#resumeBtn").addEventListener("click", resumeRun);
document.querySelector("#restartBtn").addEventListener("click", () => { localStorage.removeItem(SAVE_KEY); location.reload(); });
document.querySelector("#soundBtn").addEventListener("click", toggleSound);
document.querySelector("#settingsBtn").addEventListener("click", () => toggleSettings());
document.querySelector("#closeSettings").addEventListener("click", () => toggleSettings(false));
document.querySelector("#reduceToggle").addEventListener("change", (event) => {
  state.reduced = event.target.checked;
  game.classList.toggle("reduced-motion", state.reduced);
  showToast(state.reduced ? "低动态模式已开启" : "低动态模式已关闭", 900);
});
document.querySelector("#assistToggle").addEventListener("change", (event) => { state.assisted = event.target.checked; showToast(state.assisted ? "辅助潜行已开启" : "辅助潜行已关闭", 900); });
document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => chooseRoute(button.dataset.route)));
document.querySelectorAll("[data-object]").forEach((button) => button.addEventListener("click", () => inspectObject(button)));
document.querySelectorAll("[data-sequence]").forEach((button) => button.addEventListener("click", () => chooseSequence(button.dataset.sequence === "correct")));
document.querySelectorAll("[data-archive-choice]").forEach((button) => button.addEventListener("click", () => chooseArchive(button.dataset.archiveChoice)));
document.querySelector("#campDecision").addEventListener("click", (event) => {
  const food = event.target.closest("[data-food]"); const coat = event.target.closest("[data-coat]");
  if (food) chooseCampResource("food", food.dataset.food); if (coat) chooseCampResource("coat", coat.dataset.coat);
});
document.querySelector("#medicineMemory").addEventListener("click", discoverMedicine);
document.querySelector(".close-memory").addEventListener("click", closeMemory);
document.querySelector("#echoRange").addEventListener("input", (event) => updateEchoReveal(event.target.value));
document.querySelector("#echoContinue").addEventListener("click", showResult);

const frostCanvas = document.querySelector("#frostCanvas");
frostCanvas.addEventListener("pointerdown", (event) => { scratchPointer = event.pointerId; scratchTaps += 1; frostCanvas.setPointerCapture(scratchPointer); scratchAt(event); });
frostCanvas.addEventListener("pointermove", (event) => { if (event.pointerId === scratchPointer) scratchAt(event); });
frostCanvas.addEventListener("pointerup", () => { scratchPointer = null; });
frostCanvas.addEventListener("pointercancel", () => { scratchPointer = null; });
const holdEntry = document.querySelector("#holdEntry");
holdEntry.addEventListener("pointerdown", startEntryHold); holdEntry.addEventListener("pointerup", cancelEntryHold); holdEntry.addEventListener("pointercancel", cancelEntryHold); holdEntry.addEventListener("pointerleave", cancelEntryHold);
holdEntry.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) startEntryHold(event); });
holdEntry.addEventListener("keyup", cancelEntryHold);
breathButton.addEventListener("pointerdown", startBreathing); breathButton.addEventListener("pointerup", stopBreathing); breathButton.addEventListener("pointercancel", stopBreathing); breathButton.addEventListener("pointerleave", stopBreathing);
const lampGuard = document.querySelector("#lampGuard");
lampGuard.addEventListener("pointerdown", startProtectFlame); lampGuard.addEventListener("pointerup", stopProtectFlame); lampGuard.addEventListener("pointercancel", stopProtectFlame); lampGuard.addEventListener("pointerleave", stopProtectFlame);

attachMovement("day"); attachMovement("night");
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: reduce)", () => {
  state.reduced = true;
  game.classList.add("reduced-motion");
  document.querySelector("#reduceToggle").checked = true;
});
document.addEventListener("visibilitychange", () => {
  state.running = !document.hidden;
  if (document.hidden) audio.suspend(); else { audio.resume(); if (state.scene === "night") startNightLoop(); }
});
window.addEventListener("resize", () => {
  if (["day", "night"].includes(state.scene)) resetPlayer(state.scene);
  if (state.scene === "archive") setupFrostCanvas();
});

try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
  if (saved?.scene && saved.scene !== "result") {
    const label = sceneMeta[saved.scene]?.[1] || "上次体验";
    const resume = document.querySelector("#resumeBtn"); resume.hidden = false; resume.textContent = `继续：${label}`;
  }
} catch { localStorage.removeItem(SAVE_KEY); }

preloadAssets();
window.__snowline = { state, revealArchive, enterDay, enterCamp, finishMapStudy, enterNight, enterFire, completeFire, enterEcho, showResult };
