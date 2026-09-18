export const assets = {
  day: "./assets/day.webp",
  night: "./assets/night.webp",
  poster: "./assets/poster.webp",
  modern: "./assets/modern.webp",
  heroWalk: "./assets/hero-walk.webp",
  heroCrouch: "./assets/hero-crouch.webp",
  heroReference: "./assets/hero-reference.webp",
  enemyOne: "./assets/enemy-01.webp",
  enemyTwo: "./assets/enemy-02.webp",
  captain: "./assets/captain.webp",
  messenger: "./assets/messenger.webp",
  zhou: "./assets/zhou.webp",
  handsArchive: "./assets/hands-archive.webp",
  birch: "./assets/birch.webp",
  pine: "./assets/pine.webp",
  deadPine: "./assets/dead-pine.webp",
  shrub: "./assets/shrub.webp",
  rock: "./assets/rock.webp",
  log: "./assets/log.webp",
  food: "./assets/food.webp",
  coat: "./assets/coat.webp",
  archive: "./assets/archive.webp",
  lamp: "./assets/lamp.webp",
  map: "./assets/map.webp",
  medbox: "./assets/medbox.webp",
  rifleSide: "./assets/rifle-side.webp",
  rifleCarried: "./assets/rifle-carried.webp",
};

export const sceneMeta = {
  day: ["01", "雪线行军", 20],
  camp: ["02", "密营余火", 40],
  night: ["03", "夜越封锁", 60],
  fire: ["04", "守住火种", 80],
  echo: ["05", "山河回响", 100],
};

export function createInitialState() {
  return {
    scene: "intro",
    route: null,
    food: null,
    coat: null,
    archiveChoice: null,
    warmth: 70,
    stamina: 70,
    exposure: 0,
    bond: 0,
    sheltered: false,
    breathing: false,
    muted: false,
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    assisted: false,
    dayStep: 0,
    nightStep: 0,
    searches: 0,
    centerLightTime: 0,
    routeMemory: null,
    memories: [],
    inspected: [],
    running: true,
  };
}

export const coverLines = [
  "枯松挡住了风。",
  "岩石压低了身影。",
  "倒木后的脚印正在被雪盖住。",
];

export function buildRecord(state) {
  const cost = state.route === "short"
    ? "你走上迎风近路，省下路程，也让身体更快失去温度。抵达封锁线时，每一次停顿都更沉。"
    : "你绕进林下远路，枝叶遮住脚印，也消耗了更多体力。抵达封锁线时，步子已经慢下来。";

  const companion = state.food === "share" && state.coat === "share"
    ? "你把干粮留给老周，把棉衣交给小满。他们没有替你消除代价，却在封锁线上分别为你争取了声音和方向。"
    : state.food === "share"
      ? "那份干粮让老周恢复了一点力气。他在冻河沟制造的远处声响，为档案换来一段安静。"
      : state.coat === "share"
        ? "那件干燥棉衣让小满在风口多坚持了一段路。他提前指出了灯光反转的方向。"
        : "你留下干粮与棉衣，换来更稳定的脚步和体温。老周留在密营休息，小满独自守住另一段联络线。";

  const memory = state.memories.includes("medicine")
    ? "你在倒木下看见一只旧药箱。它没有成为积分，只留下密营医疗物资匮乏的具体触感。"
    : "你没有停下查看倒木旁的旧药箱。终章档案保留了这一处空白。";

  const ending = state.archiveChoice === "companion"
    ? "最后，你把档案交给同伴带走，自己留下掩护。作品不承诺任何个人的结局，只记录组织协作让信息继续前行。"
    : "最后，你把档案封入树洞，等待后来者。这是基于历史环境的象征性虚构情节，并非具体史实事件。";

  return { cost, companion, memory, ending };
}
