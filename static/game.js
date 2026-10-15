(() => {
  "use strict";

  const canvas = document.querySelector("#battlefield");
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = 960;
  const H = 600;
  const maps = {
    meadow: { name: "Verdant Crossing", stars: 1, scale: 1, tint: "#294b46", route: [[-24, 145], [205, 145], [205, 365], [455, 365], [455, 173], [705, 173], [705, 455], [984, 455]] },
    ember: { name: "Ember Pass", stars: 2, scale: 1.05, tint: "#604238", route: [[-24, 270], [165, 270], [165, 105], [385, 105], [385, 470], [610, 470], [610, 190], [820, 190], [820, 455], [984, 455]] },
    frostfall: { name: "Frostfall Ridge", stars: 3, scale: 1.1, tint: "#35515a", route: [[-24, 78], [285, 78], [285, 275], [85, 275], [85, 505], [520, 505], [520, 130], [760, 130], [760, 455], [984, 455]] },
    abyss: { name: "Abyssal Reach", stars: 4, scale: 1.16, tint: "#39334e", route: [[-24, 455], [220, 455], [220, 155], [430, 155], [430, 435], [660, 435], [660, 105], [850, 105], [850, 455], [984, 455]] },
    citadel: { name: "The Shattered Citadel", stars: 5, scale: 1.23, tint: "#55433b", route: [[-24, 300], [155, 300], [155, 95], [365, 95], [365, 305], [575, 305], [575, 500], [790, 500], [790, 455], [984, 455]] },
  };
  const modes = {
    easy: { name: "Easy", waves: 30, scale: .72, reward: 25, description: "A gentler defense with fewer, slower enemies." },
    intermediate: { name: "Intermediate", waves: 35, scale: 1, reward: 35, description: "A balanced campaign with steadily growing threats." },
    molten: { name: "Molten", waves: 35, scale: 1.28, reward: 42, description: "Faster assaults and tougher enemies test your defenses." },
    void: { name: "Void", waves: 40, scale: 1.58, reward: 50, description: "Armored, hidden enemies and punishing boss waves." },
    frost: { name: "Frost", waves: 50, scale: 1.9, reward: 65, description: "The harshest campaign: relentless, swift, resilient enemies." },
  };
  const modeOrder = ["easy", "intermediate", "molten", "void", "frost"];
  const towers = {
    ranger: { name: "Sunshot", role: "QUICK · PRECISE", icon: "➶", cost: 65, range: 142, cooldown: .58, damage: 14, color: "#f3cf7b", shot: "arrow", limit: 15 },
    cannon: { name: "Blastforge", role: "HEAVY · SPLASH", icon: "✹", cost: 115, range: 128, cooldown: 1.4, damage: 37, color: "#ff946e", shot: "shell", splash: 61, limit: 10 },
    frost: { name: "Rimecaller", role: "CHILL · SLOW", icon: "❄", cost: 85, range: 136, cooldown: 1.08, damage: 8, color: "#81daeb", shot: "frost", slow: .43, splash: 33, limit: 12 },
    tesla: { name: "Stormcoil", role: "CHAIN · LIGHTNING", icon: "ϟ", cost: 145, range: 118, cooldown: 1.3, damage: 22, color: "#c7a4ff", shot: "lightning", chains: 3, limit: 12 },
    summoner: { name: "Soulweaver", role: "SUMMON · SKELETONS", icon: "💀", cost: 155, range: 172, cooldown: 2.1, damage: 7, color: "#b9a0ff", shot: "summon", limit: 10 },
    elementalist: { name: "Elementalist Beacon", role: "FIRE · ICE · AREA CONTROL", icon: "✺", cost: 185, range: 150, cooldown: .95, damage: 19, color: "#f2a76a", shot: "element", limit: 10, gemCost: 25, premium: true },
    laser: { name: "Laser Array Turret", role: "BEAM · PRISM · CHAIN", icon: "⌁", cost: 205, range: 178, cooldown: .72, damage: 16, color: "#ff687e", shot: "laser", limit: 12, gemCost: 30, premium: true },
    alchemist: { name: "Alchemist Launcher", role: "TOXIN · ACID · AREA CONTROL", icon: "⚗", cost: 175, range: 160, cooldown: 1.25, damage: 24, color: "#77e28f", shot: "alchemist", limit: 12, gemCost: 25, premium: true },
    void: { name: "Void Rift Spire", role: "GRAVITY · RIFT · DISTORTION", icon: "◉", cost: 220, range: 165, cooldown: 1.45, damage: 34, color: "#b783ff", shot: "void", limit: 10, gemCost: 35, premium: true },
    overcharge: { name: "Tesla Overcharge Spire", role: "PLASMA · CHAINS · STATIC FIELD", icon: "ϟ", cost: 230, range: 145, cooldown: 1.12, damage: 21, color: "#69caff", shot: "overcharge", limit: 10, gemCost: 35, premium: true },
  };
  const enemies = {
    shade: { hp: 42, speed: 51, radius: 11, reward: 10, color: "#c18ee0" },
    runner: { hp: 29, speed: 88, radius: 9, reward: 12, color: "#f0a96c" },
    brute: { hp: 140, speed: 31, radius: 15, reward: 19, color: "#db8084" },
  };
  const bosses = [
    { name: "VEX-9", category: "CYBERPUNK & SCI-FI", color: "#54ebed", symbol: "⌘", trait: "GRID OVERLOAD", ability: "overload", description: "A sleek rogue AI that hijacks towers and the city grid." },
    { name: "Malakor the Voidborn", category: "CYBERPUNK & SCI-FI", color: "#aa87ff", symbol: "◉", trait: "GRAVITY WELL", ability: "gravity", description: "A cosmic warlord whose gravity bends the battlefield." },
    { name: "Synthia Prime", category: "CYBERPUNK & SCI-FI", color: "#f15dc6", symbol: "✧", trait: "SELF-REPAIR", ability: "regenerate", description: "A cybernetic tyrant with adaptive self-repair." },
    { name: "Zero-Day", category: "CYBERPUNK & SCI-FI", color: "#75f3a2", symbol: "⌁", trait: "PHASE SHIFT", ability: "phase", description: "A digital phantom that vanishes between attacks." },
    { name: "Kestrel", category: "CYBERPUNK & SCI-FI", color: "#e9ae62", symbol: "➶", trait: "GRAVITY TECH", ability: "gravity", description: "A mercenary commander using prototype gravity weapons." },
    { name: "Malakor, The Ash-Weaver", category: "DARK FANTASY & GOTHIC", color: "#ff764d", symbol: "✹", trait: "ASHEN PLAGUE", ability: "ash", description: "A necromancer whose cinder spells burn summoned defenders." },
    { name: "Lady Obsidian", category: "DARK FANTASY & GOTHIC", color: "#c3a3f4", symbol: "⬡", trait: "STARFORGED ARMOR", ability: "armor", description: "An immortal sorceress armored in fallen stars." },
    { name: "Lord Malakor", category: "DARK FANTASY & GOTHIC", color: "#ca565b", symbol: "♜", trait: "BLOOD FRENZY", ability: "frenzy", description: "A brutal warlord who becomes more dangerous as he is wounded." },
    { name: "The Hollow Regent", category: "DARK FANTASY & GOTHIC", color: "#c7d5e0", symbol: "♙", trait: "IMMORTAL AEGIS", ability: "shield", description: "A towering knight protected by a recurring dark-magic shield." },
    { name: "Vespera, Queen of Thorns", category: "DARK FANTASY & GOTHIC", color: "#83d77b", symbol: "❋", trait: "THORN CURSE", ability: "thorns", description: "A fey tyrant whose thorns punish defenders near the road." },
    { name: "Viktor “The Iron Ledger” Vance", category: "MODERN CRIME & SYNDICATE", color: "#dbbe7e", symbol: "♧", trait: "WAR CHEST", ability: "tribute", description: "A syndicate accountant who steals gold to fund his war." },
    { name: "Sasha “Viper” Romanov", category: "MODERN CRIME & SYNDICATE", color: "#7ed487", symbol: "♤", trait: "VENOM STRIKE", ability: "venom", description: "A lethal boss whose poison rapidly wears down skeletons." },
    { name: "The Ghost of Shinjuku", category: "MODERN CRIME & SYNDICATE", color: "#6ce4ed", symbol: "◌", trait: "GHOST STEP", ability: "phase", description: "An elusive cyberpunk boss that blinks through the line." },
    { name: "Donnacha “Blackhand” O’Connor", category: "MODERN CRIME & SYNDICATE", color: "#d78769", symbol: "♜", trait: "BLACKHAND RAMPAGE", ability: "frenzy", description: "An enforcer-king who charges faster when injured." },
    { name: "Ignis, The Living Forge", category: "MYTHICAL & ELEMENTAL", color: "#ff9457", symbol: "♨", trait: "MOLTEN ERUPTION", ability: "eruption", description: "A molten titan whose eruptions temporarily disable nearby towers." },
    { name: "Boreas, The Tempest King", category: "MYTHICAL & ELEMENTAL", color: "#83d8f4", symbol: "❄", trait: "KILLING BLIZZARD", ability: "frost", description: "An elemental lord whose blizzards slow nearby defenders." },
    { name: "Kalypso, The Deep Sovereign", category: "MYTHICAL & ELEMENTAL", color: "#59c7bd", symbol: "♆", trait: "ABYSSAL TIDE", ability: "tidal", description: "A kraken lord who floods the road with extra attackers." },
  ];
  let selectedMode = "easy";
  let currentMode = "easy";
  let currentMapKey = "meadow";
  let selectedMapKey = "meadow";
  let route = maps.meadow.route;
  let segments = route.slice(1).map((end, index) => {
    const start = route[index];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    return { start, dx, dy, length: Math.hypot(dx, dy) };
  });
  let routeLength = segments.reduce((total, segment) => total + segment.length, 0);
  const bossWavesForMode = (modeKey = currentMode) => [...new Set([15, 20, 30, modes[modeKey].waves])].filter((n) => n <= modes[modeKey].waves).sort((a, b) => a - b);
  const bossForWave = (waveNumber) => {
    const index = Math.max(0, bossWavesForMode().indexOf(waveNumber));
    return bosses[index % bosses.length];
  };
  const upcomingBossWave = (currentWave) => bossWavesForMode().find((bossWave) => bossWave > currentWave) ?? null;
  const ui = {
    lives: document.querySelector("#lives"),
    gold: document.querySelector("#gold"),
    wave: document.querySelector("#wave"),
    best: document.querySelector("#best-wave"),
    count: document.querySelector("#build-count"),
    nextWave: document.querySelector("#next-wave"),
    message: document.querySelector("#message"),
    towerList: document.querySelector("#tower-list"),
    inspection: document.querySelector("#inspection"),
    bossName: document.querySelector("#next-boss-name"),
    bossCategory: document.querySelector("#next-boss-category"),
    bossTrait: document.querySelector("#next-boss-trait"),
    bossWave: document.querySelector("#next-boss-wave"),
    bossProgress: document.querySelector("#boss-progress"),
    bossProgressLabel: document.querySelector("#boss-progress-label"),
    bossRoster: document.querySelector("#boss-roster"),
    waveButton: document.querySelector("#wave-button"),
    autoWaveButton: document.querySelector("#auto-wave-button"),
    speedButton: document.querySelector("#speed-button"),
    pauseButton: document.querySelector("#pause-button"),
    soundButton: document.querySelector("#sound-button"),
    menuButton: document.querySelector("#menu-button"),
    shopButton: document.querySelector("#shop-button"),
    gemCount: document.querySelector("#gem-count"),
    shopGems: document.querySelector("#shop-gems"),
    campaignLabel: document.querySelector("#campaign-label"),
    bossCount: document.querySelector("#boss-count"),
    overlay: document.querySelector("#game-overlay"),
    overlayContent: document.querySelector("#overlay-content"),
    bossAlert: document.querySelector("#boss-alert"),
  };
  let seed = 18374;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const distanceToRoute = (x, y) => {
    let closest = Infinity;
    for (const segment of segments) {
      const ratio = Math.max(0, Math.min(1, ((x - segment.start[0]) * segment.dx + (y - segment.start[1]) * segment.dy) / (segment.length ** 2)));
      closest = Math.min(closest, Math.hypot(x - segment.start[0] - ratio * segment.dx, y - segment.start[1] - ratio * segment.dy));
    }
    return closest;
  };
  const positionOnRoute = (progress) => {
    let remaining = Math.max(0, progress);
    for (const segment of segments) {
      if (remaining <= segment.length) {
        const ratio = remaining / segment.length;
        return [segment.start[0] + segment.dx * ratio, segment.start[1] + segment.dy * ratio];
      }
      remaining -= segment.length;
    }
    return route[route.length - 1];
  };
  const world = document.createElement("canvas");
  world.width = W;
  world.height = H;
  const terrain = world.getContext("2d");

  function drawStaticWorld() {
    terrain.clearRect(0, 0, W, H);
    const ground = terrain.createLinearGradient(0, 0, W, H);
    ground.addColorStop(0, maps[currentMapKey].tint);
    ground.addColorStop(.48, "#294b46");
    ground.addColorStop(1, "#203d40");
    terrain.fillStyle = ground;
    terrain.fillRect(0, 0, W, H);

    for (let i = 0; i < 130; i++) {
      const x = random() * W;
      const y = random() * H;
      const radius = 12 + random() * 65;
      if (distanceToRoute(x, y) < 47) continue;
      const patch = terrain.createRadialGradient(x, y, 0, x, y, radius);
      patch.addColorStop(0, i % 3 ? "rgba(105,146,92,.09)" : "rgba(110,133,87,.08)");
      patch.addColorStop(1, "rgba(49,83,67,0)");
      terrain.fillStyle = patch;
      terrain.beginPath();
      terrain.arc(x, y, radius, 0, Math.PI * 2);
      terrain.fill();
    }

    for (let i = 0; i < 2500; i++) {
      const x = random() * W;
      const y = random() * H;
      if (distanceToRoute(x, y) < 39) continue;
      const shade = Math.floor(65 + random() * 50);
      terrain.fillStyle = `rgba(${shade - 12},${shade + 14},${shade - 5},${.08 + random() * .13})`;
      terrain.fillRect(x, y, 1 + random() * 2, 1 + random() * 2);
    }

    for (let i = 0; i < 39; i++) {
      const x = 24 + random() * (W - 48);
      const y = 24 + random() * (H - 48);
      if (distanceToRoute(x, y) < 75) continue;
      const kind = random();
      terrain.fillStyle = "rgba(15,31,30,.26)";
      terrain.beginPath();
      terrain.ellipse(x, y + 6, 17, 7, 0, 0, Math.PI * 2);
      terrain.fill();
      if (kind < .48) {
        for (const [ox, oy, radius, shade] of [[-8, 0, 9, "#355c4c"], [0, -5, 12, "#426b52"], [10, 0, 8, "#315344"]]) {
          terrain.fillStyle = shade;
          terrain.beginPath();
          terrain.arc(x + ox, y + oy, radius, 0, Math.PI * 2);
          terrain.fill();
          terrain.fillStyle = "rgba(168,207,134,.2)";
          terrain.beginPath();
          terrain.arc(x + ox - 3, y + oy - 4, 3, 0, Math.PI * 2);
          terrain.fill();
        }
      } else if (kind < .79) {
        terrain.fillStyle = "#52645c";
        terrain.beginPath();
        terrain.moveTo(x - 13, y + 4);
        terrain.lineTo(x - 10, y - 5);
        terrain.lineTo(x - 2, y - 11);
        terrain.lineTo(x + 10, y - 7);
        terrain.lineTo(x + 14, y + 3);
        terrain.lineTo(x + 6, y + 8);
        terrain.closePath();
        terrain.fill();
        terrain.strokeStyle = "rgba(188,196,158,.46)";
        terrain.beginPath();
        terrain.moveTo(x - 9, y - 4);
        terrain.lineTo(x - 2, y - 10);
        terrain.lineTo(x + 5, y - 7);
        terrain.stroke();
      } else {
        terrain.fillStyle = "#286267";
        terrain.beginPath();
        terrain.moveTo(x, y - 14);
        terrain.lineTo(x + 8, y);
        terrain.lineTo(x, y + 12);
        terrain.lineTo(x - 8, y);
        terrain.closePath();
        terrain.fill();
        terrain.strokeStyle = "#89d5c6";
        terrain.stroke();
        terrain.strokeStyle = "rgba(235,255,223,.75)";
        terrain.beginPath();
        terrain.moveTo(x, y - 9);
        terrain.lineTo(x, y + 5);
        terrain.stroke();
      }
    }

    terrain.lineCap = "round";
    terrain.lineJoin = "round";
    const road = new Path2D();
    road.moveTo(...route[0]);
    route.slice(1).forEach((point) => road.lineTo(...point));
    terrain.save();
    terrain.shadowColor = "rgba(7,19,24,.75)";
    terrain.shadowBlur = 24;
    terrain.strokeStyle = "#172b2c";
    terrain.lineWidth = 84;
    terrain.stroke(road);
    terrain.restore();
    terrain.strokeStyle = "#283b39";
    terrain.lineWidth = 78;
    terrain.stroke(road);
    terrain.strokeStyle = "#655d4d";
    terrain.lineWidth = 68;
    terrain.stroke(road);
    terrain.strokeStyle = "#a28e6c";
    terrain.lineWidth = 56;
    terrain.stroke(road);
    terrain.strokeStyle = "#b29e77";
    terrain.lineWidth = 2;
    terrain.stroke(road);
    terrain.setLineDash([2, 18]);
    terrain.lineWidth = 2;
    terrain.strokeStyle = "rgba(51,42,35,.7)";
    terrain.stroke(road);
    terrain.setLineDash([]);

    for (let progress = 10; progress < routeLength - 15; progress += 24) {
      const [x, y] = positionOnRoute(progress);
      terrain.fillStyle = random() > .5 ? "rgba(55,45,36,.34)" : "rgba(228,200,151,.22)";
      terrain.beginPath();
      terrain.ellipse(x, y, 2 + random() * 2, 1 + random() * 1.5, random() * Math.PI, 0, Math.PI * 2);
      terrain.fill();
    }

    for (let i = 0; i < 320; i++) {
      const x = random() * W;
      const y = random() * H;
      if (distanceToRoute(x, y) < 52) continue;
      terrain.strokeStyle = `rgba(${random() > .5 ? "148,185,123" : "86,139,105"},${.14 + random() * .24})`;
      terrain.lineWidth = 1;
      terrain.beginPath();
      terrain.moveTo(x, y);
      terrain.lineTo(x + (random() - .5) * 7, y - 3 - random() * 6);
      terrain.stroke();
    }

    const shade = terrain.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 650);
    shade.addColorStop(0, "rgba(5,13,18,0)");
    shade.addColorStop(1, "rgba(5,13,18,.4)");
    terrain.fillStyle = shade;
    terrain.fillRect(0, 0, W, H);
  }

  let gold = 260;
  let lives = 20;
  let wave = 0;
  let bestWave = 0;
  let state = "menu";
  let pausedFrom = "build";
  let shopReturnState = "menu";
  let returnToCampaign = false;
  let selectedType = null;
  let selectedTower = null;
  let gems = 0;
  let unlockedTowers = new Set();
  let campaignRewarded = false;
  let settingsReducedMotion = false;
  let placedTowers = [];
  let activeEnemies = [];
  let projectiles = [];
  let damageFields = [];
  let summonedSkeletons = [];
  let particles = [];
  let effects = [];
  let spawnQueue = [];
  let spawnTimer = 0;
  let gameTime = 0;
  let gameSpeed = 1;
  let autoWave = false;
  let autoWaveTimer = 0;
  let nextEntityId = 1;
  let mouse = { x: -100, y: -100 };
  let message = "Choose a defender, then place it on the grass.";
  let lastFrame = performance.now();
  let uiDirty = true;
  let lastBossHud = 0;
  let soundEnabled = true;
  let audioContext = null;
  let masterGain = null;
  let lastSoundAt = Object.create(null);
  const SOUND_COOLDOWNS = { damage: .045, ranger: .12, cannon: .18, frost: .16, tesla: .13, summoner: .18, skeletonAttack: .15, boss: .4 };
  const fireflies = Array.from({ length: 28 }, () => ({ x: random() * W, y: random() * H, phase: random() * Math.PI * 2, drift: .3 + random() * .8 }));

  try {
    bestWave = Math.max(0, Number(localStorage.getItem("last-light-best-wave")) || 0);
    gems = Math.max(0, Number(localStorage.getItem("last-light-gems")) || 0);
    const savedUnlocks = JSON.parse(localStorage.getItem("last-light-unlocked-towers") || "[]");
    if (Array.isArray(savedUnlocks)) {
      savedUnlocks.filter((key) => towers[key]?.premium).forEach((key) => unlockedTowers.add(key));
    }
    soundEnabled = localStorage.getItem("last-light-sound") !== "off";
    settingsReducedMotion = localStorage.getItem("last-light-reduced-effects") === "true";
  } catch (error) {
    console.warn("Could not read saved game progress or settings.", error);
  }

  function setMessage(text) {
    message = text;
    uiDirty = true;
  }

  function initializeAudio() {
    if (audioContext) {
      if (audioContext.state === "suspended") audioContext.resume().catch((error) => console.warn("Could not resume game audio.", error));
      return audioContext.state !== "closed";
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      soundEnabled = false;
      console.warn("Web Audio is not supported in this browser.");
      uiDirty = true;
      return false;
    }
    try {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = .36;
      masterGain.connect(audioContext.destination);
      if (audioContext.state === "suspended") audioContext.resume().catch((error) => console.warn("Could not resume game audio.", error));
      uiDirty = true;
      return true;
    } catch (error) {
      soundEnabled = false;
      console.warn("Could not initialize game audio.", error);
      uiDirty = true;
      return false;
    }
  }

  function canPlaySound(name, cooldown = .08) {
    if (!soundEnabled || !initializeAudio()) return false;
    const now = audioContext.currentTime;
    if (now - (lastSoundAt[name] ?? -Infinity) < cooldown) return false;
    lastSoundAt[name] = now;
    return true;
  }

  function playTone(frequency, endFrequency, duration, type, volume, delay = 0) {
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(30, frequency), start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), start + Math.min(.014, duration * .2));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + .015);
  }

  function playNoise(duration, volume, cutoff) {
    const start = audioContext.currentTime;
    const frameCount = Math.ceil(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, cutoff * .3), start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(start);
    source.stop(start + duration + .01);
  }

  function playSound(name) {
    if (!canPlaySound(name, SOUND_COOLDOWNS[name] ?? .08)) return;
    if (name === "tesla") {
      playNoise(.22, .18, 7200);
      playTone(170, 48, .32, "triangle", .19);
      playTone(1780, 360, .1, "sawtooth", .055);
    } else if (name === "cannon") {
      playNoise(.2, .19, 850);
      playTone(125, 54, .26, "sine", .23);
    } else if (name === "frost") {
      playNoise(.15, .075, 5000);
      playTone(1050, 390, .22, "sine", .075);
      playTone(1560, 780, .19, "triangle", .04, .035);
    } else if (name === "summoner") {
      playTone(460, 920, .3, "sine", .105);
      playTone(690, 1380, .38, "triangle", .06, .045);
      playTone(230, 440, .42, "sine", .04, .02);
    } else if (name === "skeletonAttack") {
      playNoise(.08, .07, 2600);
      playTone(690, 210, .13, "triangle", .075);
    } else if (name === "boss") {
      playNoise(.16, .12, 620);
      playTone(90, 42, .34, "sine", .18);
    } else if (name === "damage") {
      playNoise(.055, .055, 1800);
      playTone(420, 175, .075, "triangle", .06);
    } else {
      playNoise(.08, .065, 3400);
      playTone(820, 390, .095, "triangle", .055);
    }
  }

  function unlockAudio() {
    initializeAudio();
  }

  function showBossAlert(name) {
    ui.bossAlert.textContent = `BOSS APPROACHING · ${name.toUpperCase()}`;
    ui.bossAlert.classList.add("is-visible");
    clearTimeout(showBossAlert.timeout);
    showBossAlert.timeout = setTimeout(() => ui.bossAlert.classList.remove("is-visible"), 3300);
  }

  function updateBest() {
    if (wave <= bestWave) return;
    bestWave = wave;
    try {
      localStorage.setItem("last-light-best-wave", String(bestWave));
    } catch (error) {
      console.warn("Could not save the best wave on this device.", error);
    }
    uiDirty = true;
  }

  function addBurst(x, y, tint, count = 8, speed = 100) {
    if (settingsReducedMotion) count = Math.ceil(count * .35);
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      const velocity = speed * (.35 + random() * .65);
      const life = .24 + random() * .38;
      particles.push({
        x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity,
        life, maxLife: life, size: 1.5 + random() * 3, color: tint,
      });
    }
  }

  function addEffect(type, x, y, tint, radius = 24, duration = .3) {
    if (settingsReducedMotion && ["impact", "pulse", "muzzle"].includes(type)) return;
    effects.push({ type, x, y, color: tint, radius, life: duration, maxLife: duration });
  }

  function makeEnemy(index, boss = false) {
    const id = nextEntityId++;
    const [x, y] = positionOnRoute(0);
    const enemyScale = modes[currentMode].scale * maps[currentMapKey].scale;
    if (boss) {
      const info = bossForWave(wave);
      const armor = (info.ability === "armor" ? .38 : info.ability === "shield" ? .16 : info.ability === "overload" ? .1 : 0) + Math.max(0, modes[currentMode].scale - 1) * .08;
      const hp = Math.round((760 + wave * 40 + wave ** 2 * .55) * enemyScale);
      return {
        id, name: info.name, category: info.category, description: info.description,
        boss: true, ability: info.ability, color: info.color, symbol: info.symbol,
        trait: info.trait, armor, hp, maxHp: hp, progress: 0,
        x, y, speed: 32 + Math.min(wave, 45) * .3, radius: 26,
        reward: 90 + wave * 3, attackTimer: 0, specialTimer: 0, meleeTimer: 0,
        slowUntil: 0, slowFactor: 1, burst: 0, phaseUntil: 0, shieldUntil: 0,
        summonCount: 0,
      };
    }
    const type = wave >= 20 && index % 11 === 8 ? "runner"
      : wave >= 10 && index % 6 === 1 ? "brute"
        : index % 7 === 4 ? "runner"
          : index % 7 === 1 && wave >= 3 ? "brute" : "shade";
    const stats = enemies[type];
    const elapsedWaves = Math.max(0, wave - 1);
    const hp = Math.ceil(stats.hp * (1 + elapsedWaves * .12 + elapsedWaves ** 2 * .0015) * enemyScale);
    const shielded = wave >= 8 && wave % 4 === 0 && (currentMode === "void" || currentMode === "frost");
    const hidden = wave >= 12 && wave % 6 === 0 && (currentMode === "void" || currentMode === "frost");
    return {
      id, type, ...stats, hp, maxHp: hp,
      armor: shielded ? .3 : 0, shielded, hidden,
      speed: stats.speed + Math.min(wave, 15) * (.7 + modes[currentMode].scale * .3) + maps[currentMapKey].stars * .8,
      progress: 0, x, y, slowUntil: 0, slowFactor: 1, attackTimer: 0, meleeTimer: 0,
    };
  }

  function startWave() {
    if (state !== "build" || wave >= modes[currentMode].waves) return;
    autoWaveTimer = 0;
    state = "wave";
    wave++;
    const count = Math.ceil(7 + wave * 1.8);
    const isBossWave = bossWavesForMode().includes(wave);
    spawnQueue = Array.from({ length: count }, (_, index) => ({ index, boss: isBossWave && index === count - 2 }));
    spawnTimer = .25;
    const boss = isBossWave ? bossForWave(wave) : null;
    setMessage(boss ? `${boss.name} approaches. ${boss.trait} — adjust your defenses!` : "Enemies incoming. Watch for faster, shielded, and hidden threats.");
    uiDirty = true;
  }

  function applyDamage(enemy, amount, slow = 0, sourceType = "ranger") {
    if (enemy.dead) return;
    if (enemy.boss && enemy.phaseUntil > gameTime) return;
    const baseArmor = enemy.boss ? enemy.armor + (enemy.shieldUntil > gameTime ? .32 : 0) : (enemy.armor || (enemy.type === "brute" ? .08 : 0));
    const armor = Math.max(0, baseArmor - (enemy.acidUntil > gameTime ? .15 : 0));
    enemy.hp -= amount * (1 - Math.min(.75, armor));
    playSound(sourceType === "tesla" ? "tesla" : sourceType === "frost" ? "frost" : sourceType === "cannon" ? "cannon" : sourceType === "summoner" ? "skeletonAttack" : "damage");
    if (slow > 0) {
      enemy.slowUntil = Math.max(enemy.slowUntil, gameTime + (enemy.boss ? 1.05 : 2.6));
      enemy.slowFactor = Math.min(enemy.slowFactor || 1, slow);
    }
    if (enemy.hp <= 0) {
      enemy.dead = true;
      gold += enemy.reward + (enemy.boss ? 85 : 0);
      addBurst(enemy.x, enemy.y, enemy.color, enemy.boss ? 28 : 12, enemy.boss ? 155 : 115);
      addEffect("impact", enemy.x, enemy.y, enemy.color, enemy.boss ? 48 : 22, .36);
      if (enemy.boss) setMessage(`${enemy.name} defeated · +◈ ${enemy.reward + 85}`);
      uiDirty = true;
    }
  }

  function damageSkeleton(skeleton, amount) {
    if (skeleton.dead) return;
    skeleton.hp = Math.max(0, skeleton.hp - amount);
    playSound("damage");
    addEffect("impact", skeleton.x, skeleton.y, "#d4c4ff", 13, .18);
    addBurst(skeleton.x, skeleton.y, "#d9d0e8", 3, 48);
    if (skeleton.hp <= 0) {
      skeleton.dead = true;
      addEffect("impact", skeleton.x, skeleton.y, "#b9a0ff", 29, .3);
      addBurst(skeleton.x, skeleton.y, "#c6b9dd", 13, 100);
      setMessage("A summoned skeleton has fallen. The Soulweaver will summon another.");
    }
    uiDirty = true;
  }

  function triggerBossAbility(enemy, pendingAdds) {
    if (enemy.ability === "frenzy") {
      if (enemy.hp <= enemy.maxHp * .5 && enemy.burst <= 0 && enemy.specialTimer >= 3.2) {
        enemy.burst = 1.8;
        enemy.specialTimer = 0;
        addEffect("pulse", enemy.x, enemy.y, enemy.color, 72, .55);
        addBurst(enemy.x, enemy.y, enemy.color, 18, 130);
        setMessage(`${enemy.name} enters a blood frenzy!`);
      }
      return;
    }

    const intervals = {
      overload: 4.3, eruption: 4.8, gravity: 3.8, regenerate: 3.2,
      phase: 4.4, ash: 3.5, armor: 5.2, shield: 4.8, thorns: 3.6,
      tribute: 4.6, venom: 3.2, frost: 4.1, tidal: 5.4,
    };
    if (enemy.specialTimer < (intervals[enemy.ability] ?? 5)) return;
    enemy.specialTimer = 0;
    const pulseRadius = enemy.ability === "gravity" ? 144 : 126;
    addEffect("pulse", enemy.x, enemy.y, enemy.color, pulseRadius, .72);
    addBurst(enemy.x, enemy.y, enemy.color, 12, 100);

    if (enemy.ability === "overload" || enemy.ability === "eruption") {
      for (const tower of placedTowers) {
        if (Math.hypot(tower.x - enemy.x, tower.y - enemy.y) < pulseRadius + 25) {
          tower.disabledUntil = Math.max(tower.disabledUntil || 0, gameTime + (enemy.ability === "eruption" ? 1.35 : .95));
        }
      }
      setMessage(`${enemy.name} ${enemy.ability === "eruption" ? "erupts — nearby towers are stunned!" : "overloads the grid — nearby towers are offline!"}`);
    } else if (enemy.ability === "gravity") {
      for (const skeleton of summonedSkeletons) {
        if (Math.hypot(skeleton.x - enemy.x, skeleton.y - enemy.y) < pulseRadius) {
          skeleton.slowUntil = gameTime + 2.2;
          skeleton.slowFactor = .45;
        }
      }
      setMessage(`${enemy.name}'s gravity well drags nearby defenders.`);
    } else if (enemy.ability === "regenerate") {
      const restored = Math.min(enemy.maxHp - enemy.hp, Math.ceil(enemy.maxHp * .045));
      enemy.hp += restored;
      setMessage(`${enemy.name} repairs ${restored} health. Focus fire to overwhelm the regen!`);
    } else if (enemy.ability === "phase") {
      enemy.phaseUntil = gameTime + 1;
      enemy.progress = Math.min(routeLength - 1, enemy.progress + 76);
      [enemy.x, enemy.y] = positionOnRoute(enemy.progress);
      setMessage(`${enemy.name} phases forward. Its shield blocks attacks briefly!`);
    } else if (enemy.ability === "ash" || enemy.ability === "thorns" || enemy.ability === "venom") {
      const target = summonedSkeletons
        .filter((skeleton) => Math.hypot(skeleton.x - enemy.x, skeleton.y - enemy.y) < pulseRadius + 35)
        .sort((a, b) => a.hp - b.hp)[0];
      if (target) {
        const damage = enemy.ability === "venom" ? 23 + wave * .24 : enemy.ability === "ash" ? 17 + wave * .2 : 14 + wave * .18;
        damageSkeleton(target, damage);
      }
      setMessage(enemy.ability === "venom" ? `${enemy.name}'s venom strikes at the weakest defender!`
        : enemy.ability === "ash" ? `${enemy.name} sears nearby skeletons with ash!`
          : `${enemy.name}'s thorn curse tears into nearby defenders!`);
    } else if (enemy.ability === "shield" || enemy.ability === "armor") {
      enemy.shieldUntil = gameTime + 2.5;
      setMessage(`${enemy.name} raises a ${enemy.ability === "armor" ? "starforged" : "dark-magic"} shield!`);
    } else if (enemy.ability === "tribute") {
      const stolen = Math.min(gold, 12 + Math.floor(wave * .35));
      gold -= stolen;
      uiDirty = true;
      setMessage(`${enemy.name} steals ◈ ${stolen} to fund the syndicate.`);
    } else if (enemy.ability === "frost") {
      for (const tower of placedTowers) {
        if (Math.hypot(tower.x - enemy.x, tower.y - enemy.y) < pulseRadius) {
          tower.disabledUntil = Math.max(tower.disabledUntil || 0, gameTime + .8);
        }
      }
      for (const skeleton of summonedSkeletons) {
        if (Math.hypot(skeleton.x - enemy.x, skeleton.y - enemy.y) < pulseRadius) {
          skeleton.slowUntil = gameTime + 2.4;
          skeleton.slowFactor = .4;
        }
      }
      setMessage(`${enemy.name} unleashes a blizzard — towers and skeletons slow down!`);
    } else if (enemy.ability === "tidal") {
      const minionLimit = Math.min(8, 2 + Math.floor(wave / 20));
      if (enemy.summonCount < minionLimit) {
        for (let i = 0; i < 2 && enemy.summonCount < minionLimit; i++) {
          const minion = makeEnemy(nextEntityId + i, false);
          minion.hp = Math.ceil(minion.hp * .6);
          minion.maxHp = minion.hp;
          minion.reward = Math.ceil(minion.reward * .65);
          minion.speed *= 1.12;
          pendingAdds.push(minion);
          enemy.summonCount++;
        }
        setMessage(`${enemy.name} calls reinforcements from the abyss!`);
      }
    }
    uiDirty = true;
  }

  function fireTower(tower, target) {
    const stats = towers[tower.type];
    const tier = tower.level + 1;
    const damage = stats.damage * (1 + tower.level * .15);
    const angle = Math.atan2(target.y - tower.y, target.x - tower.x);
    tower.aim = angle;
    addEffect("muzzle", tower.x + Math.cos(angle) * 21, tower.y + Math.sin(angle) * 21, stats.color, 17, .12);
    addBurst(tower.x + Math.cos(angle) * 21, tower.y + Math.sin(angle) * 21, stats.color, 3, 60);
    if (tower.type === "summoner") {
      const skeletonLimit = 3 + Math.floor(tower.level / 5);
      if (summonedSkeletons.filter((skeleton) => skeleton.towerId === tower.id && !skeleton.dead).length >= skeletonLimit) return;
      playSound("summoner");
      const [x, y] = positionOnRoute(routeLength - 42);
      summonedSkeletons.push({
        id: nextEntityId++, towerId: tower.id, x, y, progress: routeLength - 42,
        hp: 44 + tower.level * 12, maxHp: 44 + tower.level * 12,
        speed: 104, damage: stats.damage * (1 + tower.level * .15),
        attackCooldown: .8, meleeTimer: 0, life: 35, direction: -1, slowUntil: 0, slowFactor: 1,
      });
      setMessage("A skeleton rises from the gate and joins the fight!");
      uiDirty = true;
      return;
    }
    if (tower.type === "tesla" || tower.type === "laser" && tier >= 2 || tower.type === "overcharge") {
      playSound("tesla");
      if (tower.type === "overcharge" && tower.branch === "static" && tier >= 2) {
        const struck = activeEnemies.filter((enemy) => !enemy.dead && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= stats.range + tower.level * 4);
        struck.forEach((enemy) => applyDamage(enemy, damage * .72, 0, "tesla"));
        addEffect("static", tower.x, tower.y, stats.color, stats.range + tower.level * 4, .42);
        effects.push({ type: "lightning", points: [[tower.x, tower.y], ...struck.map((enemy) => [enemy.x, enemy.y])], color: stats.color, life: .3, maxLife: .3 });
        return;
      }
      const struck = [target];
      applyDamage(target, damage, 0, tower.type);
      const chainLimit = tower.type === "laser" ? (tier >= 6 ? 5 : tier >= 3 ? 3 : 1)
        : tower.type === "overcharge" ? (tier >= 2 ? 5 : 1)
          : stats.chains + Math.floor(tower.level / 3);
      for (let chain = 1; chain < chainLimit; chain++) {
        const origin = struck[struck.length - 1];
        const next = activeEnemies
          .filter((enemy) => !enemy.dead && !struck.includes(enemy) && Math.hypot(enemy.x - origin.x, enemy.y - origin.y) < 91)
          .sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))[0];
        if (!next) break;
        struck.push(next);
        applyDamage(next, damage * .72, 0, tower.type);
      }
      effects.push({
        type: tower.type === "laser" ? "beam" : "lightning",
        points: [[tower.x, tower.y - 8], ...struck.map((enemy) => [enemy.x, enemy.y])],
        color: tower.type === "laser" && tier >= 3 ? "#d79cff" : tower.type === "overcharge" && tier >= 2 ? "#ffb85d" : tower.type === "tesla" && tier >= 6 ? "#ffcc68" : stats.color,
        life: tower.type === "laser" ? .38 : .24, maxLife: tower.type === "laser" ? .38 : .24,
      });
      struck.forEach((enemy) => addBurst(enemy.x, enemy.y, stats.color, 5, 100));
      return;
    }
    if (tower.type === "void" && tier >= 3) {
      playSound("tesla");
      const radius = 55 + tier * 5;
      for (const enemy of activeEnemies) {
        if (!enemy.dead && Math.hypot(enemy.x - target.x, enemy.y - target.y) <= radius) applyDamage(enemy, damage * .85, 0, tower.type);
      }
      addEffect("portal", target.x, target.y, stats.color, radius, .65);
      for (let strike = 0; strike < 5; strike++) {
        const nearby = activeEnemies.filter((enemy) => !enemy.dead && Math.hypot(enemy.x - target.x, enemy.y - target.y) <= radius);
        if (nearby[strike]) effects.push({ type: "lightning", points: [[target.x, target.y - 85], [nearby[strike].x, nearby[strike].y]], color: "#d69cff", life: .3, maxLife: .3 });
      }
      return;
    }
    if (tower.type === "tesla" || tower.type === "frost" || tower.type === "elementalist" && tower.branch === "ice" && tier >= 2) playSound("frost");
    else if (tower.type === "cannon" || tower.type === "alchemist") playSound("cannon");
    else playSound("ranger");
    let shotType = stats.shot;
    let shotColor = stats.color;
    let slow = stats.slow ? Math.max(.2, stats.slow - tower.level * .025) : 0;
    let splash = stats.splash ? stats.splash + Math.floor(tower.level / 2) * 3 : 0;
    let field = null;
    if (tower.type === "elementalist" && tier >= 2) {
      if (tower.branch === "ice") {
        shotType = "iceShard";
        shotColor = "#8aeaff";
        slow = .48;
        splash = 34 + tier * 2;
        field = { color: "#7ddff5", dps: damage * .2, slow: .58, duration: 2.1 };
      } else {
        shotType = "fireball";
        shotColor = "#ff7548";
        splash = 35 + tier * 2;
        field = { color: "#ff7042", dps: damage * .32, duration: 3.1 };
      }
    } else if (tower.type === "alchemist" && tier >= 2) {
      shotType = tower.branch === "acid" ? "slime" : "flask";
      shotColor = tower.branch === "acid" ? "#c76aff" : "#83f37e";
      splash = 22;
      field = { color: shotColor, dps: damage * (tower.branch === "acid" ? .45 : .36), duration: 4.4, armorBreak: tower.branch === "acid" ? .15 : 0 };
    } else if (tower.type === "void" && tier >= 2) {
      shotType = "blackHole";
      shotColor = "#b783ff";
      splash = 30 + tier * 2;
      field = { color: "#a56bff", dps: damage * .24, duration: 2.8, slow: .72 };
    } else if (tower.type === "laser") {
      shotType = tier >= 2 ? "beam" : "pulse";
      shotColor = tier >= 5 ? "#bb79ff" : "#ff6478";
    } else if (tower.type === "elementalist") {
      shotType = "energyBolt";
      shotColor = "#f8f8ff";
    } else if (tower.type === "alchemist") {
      shotType = "shell";
      shotColor = "#292326";
      splash = 22;
    } else if (tower.type === "cannon" && tier >= 5) {
      shotColor = "#ff7444";
      field = { color: "#ff7042", dps: damage * .2, duration: 2.1 };
    } else if (tower.type === "frost" && tier >= 5) {
      field = { color: "#78e5ff", dps: damage * .16, slow: .52, duration: 2.5 };
    }
    projectiles.push({
      type: shotType, target, x: tower.x, y: tower.y - 8, damage,
      speed: tower.type === "cannon" || tower.type === "alchemist" ? 295 : shotType === "blackHole" ? 205 : 405,
      color: shotColor, slow, splash, field, towerType: tower.type,
      trail: [], branch: tower.branch,
    });
    if (tower.type === "ranger" && tier >= 5) {
      const extraTargets = activeEnemies
        .filter((enemy) => !enemy.dead && enemy !== target && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= stats.range + tower.level * 4)
        .sort((a, b) => Math.hypot(a.x - tower.x, a.y - tower.y) - Math.hypot(b.x - tower.x, b.y - tower.y))
        .slice(0, tier >= 8 ? 2 : 1);
      for (const extraTarget of extraTargets) {
        projectiles.push({ ...projectiles.at(-1), target: extraTarget, x: tower.x, y: tower.y - 8, trail: [] });
      }
    }
  }

  function hitProjectile(shot) {
    if (shot.field) {
      damageFields.push({
        x: shot.x, y: shot.y, radius: shot.splash || 32, color: shot.field.color,
        dps: shot.field.dps, duration: shot.field.duration, tick: 0,
        slow: shot.field.slow || 0, armorBreak: shot.field.armorBreak || 0, towerType: shot.towerType,
        progress: shot.target.progress, pull: shot.towerType === "void",
      });
      addEffect(shot.towerType === "void" ? "portal" : "blast", shot.x, shot.y, shot.field.color, shot.splash || 32, .55);
      addBurst(shot.x, shot.y, shot.field.color, shot.towerType === "alchemist" ? 16 : 12, 100);
    }
    if (shot.splash) {
      addEffect("blast", shot.x, shot.y, shot.color, shot.splash, .38);
      addBurst(shot.x, shot.y, shot.color, 18, 145);
      for (const enemy of activeEnemies) {
        if (!enemy.dead && Math.hypot(enemy.x - shot.x, enemy.y - shot.y) <= shot.splash) {
          applyDamage(enemy, shot.damage * (enemy === shot.target ? 1 : .68), shot.slow, shot.towerType);
        }
      }
    } else {
      applyDamage(shot.target, shot.damage, shot.slow, shot.towerType);
      addEffect("impact", shot.x, shot.y, shot.color, 18, .2);
      addBurst(shot.x, shot.y, shot.color, 5, 105);
    }
  }

  function endGame() {
    lives = 0;
    state = "gameover";
    selectedType = null;
    selectedTower = null;
    updateBest();
    setMessage(`The gate has fallen. You reached wave ${wave}.`);
    uiDirty = true;
  }

  function update(dt) {
    if (state !== "build" && state !== "wave") return;
    dt *= gameSpeed;
    gameTime += dt;

    if (state === "build" && autoWave && autoWaveTimer > 0) {
      autoWaveTimer -= dt;
      if (autoWaveTimer <= 0) startWave();
    }

    if (state === "wave") {
      spawnTimer -= dt;
      while (spawnQueue.length && spawnTimer <= 0) {
        const entry = spawnQueue.shift();
        const enemy = makeEnemy(entry.index, entry.boss);
        activeEnemies.push(enemy);
        if (enemy.boss) {
          playSound("boss");
          setMessage(`BOSS APPROACHING · ${enemy.name.toUpperCase()}`);
          showBossAlert(enemy.name);
        }
        spawnTimer += Math.max(.31, .78 - wave * .012);
      }
    }

    const pendingBossAdds = [];
    for (const enemy of activeEnemies) {
      if (enemy.dead) continue;
      if (enemy.slowUntil <= gameTime) enemy.slowFactor = 1;
      enemy.attackTimer += dt;
      if (enemy.boss) {
        enemy.specialTimer += dt;
        triggerBossAbility(enemy, pendingBossAdds);
      }
      const defender = summonedSkeletons
        .filter((skeleton) => !skeleton.dead && Math.abs(skeleton.progress - enemy.progress) <= 26)
        .sort((a, b) => Math.abs(a.progress - enemy.progress) - Math.abs(b.progress - enemy.progress))[0];
      if (defender) {
        enemy.meleeTimer += dt;
        const attackSpeed = enemy.boss ? .8 : enemy.type === "brute" ? .95 : .72;
        if (enemy.meleeTimer >= attackSpeed) {
          enemy.meleeTimer = 0;
          const attackDamage = enemy.boss ? 22 + wave * .7 : enemy.type === "brute" ? 18 : enemy.type === "runner" ? 9 : 12;
          damageSkeleton(defender, attackDamage);
        }
        continue;
      }
      let speedFactor = enemy.slowUntil > gameTime ? enemy.slowFactor : 1;
      if (enemy.boss && enemy.ability === "frenzy" && enemy.burst > 0) {
        enemy.burst -= dt;
        speedFactor *= 1.75;
      }
      enemy.progress += enemy.speed * speedFactor * dt;
      [enemy.x, enemy.y] = positionOnRoute(enemy.progress);
      if (enemy.progress >= routeLength) {
        enemy.dead = true;
        lives = Math.max(0, lives - (enemy.boss ? 5 : enemy.type === "brute" ? 3 : 1));
        addEffect("leak", 942, 455, enemy.color, 30, .65);
        addBurst(942, 455, enemy.color, 12, 90);
        uiDirty = true;
        if (lives <= 0) endGame();
      }
    }
    activeEnemies = activeEnemies.filter((enemy) => !enemy.dead);
    activeEnemies.push(...pendingBossAdds);

    for (const skeleton of summonedSkeletons) {
      if (skeleton.dead) continue;
      skeleton.life -= dt;
      const target = activeEnemies
        .filter((enemy) => !enemy.dead)
        .reduce((nearest, enemy) => !nearest || Math.abs(enemy.progress - skeleton.progress) < Math.abs(nearest.progress - skeleton.progress) ? enemy : nearest, null);
      if (target && Math.abs(target.progress - skeleton.progress) <= 26) {
        skeleton.meleeTimer += dt;
        if (skeleton.meleeTimer >= skeleton.attackCooldown) {
          skeleton.meleeTimer = 0;
          applyDamage(target, skeleton.damage, 0, "summoner");
          addEffect("impact", target.x, target.y, "#cbb3ff", 20, .2);
          addBurst(target.x, target.y, "#dcd1f1", 5, 72);
        }
      } else if (target) {
        skeleton.direction = target.progress > skeleton.progress ? 1 : -1;
        const speedFactor = skeleton.slowUntil > gameTime ? skeleton.slowFactor : 1;
        skeleton.progress += skeleton.direction * skeleton.speed * speedFactor * dt;
      } else {
        skeleton.direction = -1;
        skeleton.progress = Math.max(0, skeleton.progress - skeleton.speed * dt);
      }
      [skeleton.x, skeleton.y] = positionOnRoute(skeleton.progress);
      if (skeleton.hp <= 0 || skeleton.life <= 0 || (!target && skeleton.progress <= 0)) {
        skeleton.dead = true;
        if (skeleton.life <= 0) {
          addBurst(skeleton.x, skeleton.y, "#c6b9dd", 7, 56);
        }
        uiDirty = true;
      }
    }
    summonedSkeletons = summonedSkeletons.filter((skeleton) => !skeleton.dead);

    if (state === "wave" && !spawnQueue.length && !activeEnemies.length) {
      if (wave === modes[currentMode].waves) {
        state = "victory";
        setMessage(`Campaign complete · ${modes[currentMode].name} survived.`);
        updateBest();
        if (!campaignRewarded) {
          gems += modes[currentMode].reward;
          campaignRewarded = true;
          saveAccountProgress();
        }
      } else {
        state = "build";
        const reward = 30 + wave * 4;
        gold += reward;
        autoWaveTimer = autoWave ? 2 : 0;
        setMessage(`Wave ${wave} cleared · +◈ ${reward} bonus${autoWave ? " · next wave starts automatically" : ""}`);
        updateBest();
      }
      uiDirty = true;
    }

    for (const tower of placedTowers) {
      tower.cooldown -= dt;
      if (tower.cooldown > 0) continue;
      const stats = towers[tower.type];
      const range = stats.range + tower.level * 4;
      if (tower.disabledUntil > gameTime) {
        tower.cooldown = Math.max(tower.cooldown, .12);
        continue;
      }
      const chilled = activeEnemies.some((enemy) => enemy.boss && enemy.ability === "frost" && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) < 112);
      const targets = activeEnemies.filter((enemy) => {
        const distance = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
        return distance <= range && (!enemy.hidden || distance <= 72);
      });
      if (!targets.length) continue;
      const target = targets.reduce((furthest, enemy) => enemy.progress > furthest.progress ? enemy : furthest);
      fireTower(tower, target);
      tower.cooldown = stats.cooldown * Math.max(.48, 1 - tower.level * .045) * (chilled ? 1.55 : 1);
    }

    for (const shot of projectiles) {
      const target = shot.target;
      if (target.dead) {
        shot.dead = true;
        continue;
      }
      const dx = target.x - shot.x;
      const dy = target.y - shot.y;
      const distance = Math.hypot(dx, dy);
      const step = shot.speed * dt;
      shot.trail.push([shot.x, shot.y]);
      shot.trail = shot.trail.slice(-6);
      if (distance <= step + target.radius) {
        shot.x = target.x;
        shot.y = target.y;
        hitProjectile(shot);
        shot.dead = true;
      } else {
        shot.x += dx / distance * step;
        shot.y += dy / distance * step;
      }
    }
    projectiles = projectiles.filter((shot) => !shot.dead);
    for (const field of damageFields) {
      field.duration -= dt;
      field.tick -= dt;
      if (field.pull) {
        for (const enemy of activeEnemies) {
          if (enemy.dead || Math.hypot(enemy.x - field.x, enemy.y - field.y) > field.radius) continue;
          const delta = field.progress - enemy.progress;
          enemy.progress += Math.sign(delta) * Math.min(Math.abs(delta), 24 * dt);
          [enemy.x, enemy.y] = positionOnRoute(enemy.progress);
          enemy.slowUntil = Math.max(enemy.slowUntil, gameTime + .15);
          enemy.slowFactor = Math.min(enemy.slowFactor || 1, .72);
        }
      }
      if (field.tick > 0) continue;
      field.tick = .4;
      for (const enemy of activeEnemies) {
        if (enemy.dead || Math.hypot(enemy.x - field.x, enemy.y - field.y) > field.radius) continue;
        applyDamage(enemy, field.dps * .4, field.slow, field.towerType);
        if (field.armorBreak) enemy.acidUntil = gameTime + 3;
      }
    }
    damageFields = damageFields.filter((field) => field.duration > 0);
    for (const particle of particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= .12 ** dt;
      particle.vy *= .12 ** dt;
    }
    particles = particles.filter((particle) => particle.life > 0);
    for (const effect of effects) effect.life -= dt;
    effects = effects.filter((effect) => effect.life > 0);
  }

  function validPlacement(x, y, type) {
    if (x < 28 || x > 932 || y < 28 || y > 572 || distanceToRoute(x, y) < 49) return false;
    if (placedTowers.some((tower) => Math.hypot(tower.x - x, tower.y - y) < 47)) return false;
    const stats = towers[type];
    return gold >= stats.cost && state === "build" && placedTowers.filter((tower) => tower.type === type).length < stats.limit;
  }

  function placeTower(x, y) {
    if (!selectedType) return;
    const stats = towers[selectedType];
    if (placedTowers.filter((tower) => tower.type === selectedType).length >= stats.limit) {
      setMessage(`${stats.name} limit reached · maximum ${stats.limit}.`);
      return;
    }
    if (validPlacement(x, y, selectedType)) {
      const tower = {
        id: nextEntityId++, type: selectedType, x, y, level: 0, cooldown: 0, aim: -Math.PI / 2,
        branch: selectedType === "elementalist" ? "fire" : selectedType === "overcharge" ? "plasma" : "toxin",
      };
      placedTowers.push(tower);
      gold -= stats.cost;
      selectedTower = tower;
      selectedType = null;
      setMessage(`${stats.name} deployed. Add defenders or begin the next wave.`);
    } else if (gold < stats.cost) {
      setMessage(`Not enough gold for ${stats.name} · need ◈ ${stats.cost}`);
    } else {
      setMessage("Find an open patch of grass beside the road.");
    }
    uiDirty = true;
  }

  function selectTower(type) {
    if (state !== "build" && state !== "wave") return;
    if (towers[type].premium && !unlockedTowers.has(type)) {
      setMessage(`${towers[type].name} is locked. Unlock it in the tower shop with gems.`);
      return;
    }
    if (placedTowers.filter((tower) => tower.type === type).length >= towers[type].limit) {
      setMessage(`${towers[type].name} limit reached · maximum ${towers[type].limit}.`);
      return;
    }
    if (gold < towers[type].cost && selectedType !== type) {
      setMessage(`Not enough gold for ${towers[type].name} · need ◈ ${towers[type].cost}`);
      return;
    }
    selectedType = selectedType === type ? null : type;
    selectedTower = null;
    uiDirty = true;
  }

  function upgradeTower() {
    if (!selectedTower || selectedTower.level >= 9) return;
    const stats = towers[selectedTower.type];
    const cost = Math.round(stats.cost * (.55 + (selectedTower.level + 1) * .38));
    if (gold < cost) return;
    gold -= cost;
    selectedTower.level++;
    selectedTower.cooldown = Math.min(selectedTower.cooldown, .15);
    setMessage(`${stats.name} upgraded to level ${selectedTower.level + 1}${selectedTower.level === 1 ? " · new attack effect unlocked" : ""}.`);
    uiDirty = true;
  }

  function chooseTowerBranch(branch) {
    if (!selectedTower || !["elementalist", "alchemist", "overcharge"].includes(selectedTower.type)) return;
    if (selectedTower.type === "elementalist" && !["fire", "ice"].includes(branch)) return;
    if (selectedTower.type === "alchemist" && !["toxin", "acid"].includes(branch)) return;
    if (selectedTower.type === "overcharge" && !["plasma", "static"].includes(branch)) return;
    selectedTower.branch = branch;
    setMessage(`${towers[selectedTower.type].name} path changed to ${branch === "fire" ? "Pyromancer" : branch === "ice" ? "Glacier" : branch === "acid" ? "Corrosive Acid" : "Toxic Gas"}.`);
    uiDirty = true;
  }

  function sellTower() {
    if (!selectedTower) return;
    const stats = towers[selectedTower.type];
    gold += Math.floor(stats.cost * (.72 + selectedTower.level * .25));
    placedTowers = placedTowers.filter((tower) => tower !== selectedTower);
    selectedTower = null;
    setMessage(`${stats.name} sold. Gold returned to your treasury.`);
    uiDirty = true;
  }

  function pauseToggle() {
    if (state === "build" || state === "wave") {
      pausedFrom = state;
      returnToCampaign = true;
      state = "paused";
    } else if (state === "paused") {
      state = pausedFrom;
      returnToCampaign = false;
    }
    uiDirty = true;
  }

  function saveAccountProgress() {
    try {
      localStorage.setItem("last-light-gems", String(gems));
      localStorage.setItem("last-light-unlocked-towers", JSON.stringify([...unlockedTowers]));
      localStorage.setItem("last-light-sound", soundEnabled ? "on" : "off");
    } catch (error) {
      console.warn("Could not save gems, tower unlocks, or settings on this device.", error);
    }
  }

  function applyMap(mapKey) {
    currentMapKey = mapKey;
    route = maps[mapKey].route;
    segments = route.slice(1).map((end, index) => {
      const start = route[index];
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      return { start, dx, dy, length: Math.hypot(dx, dy) };
    });
    routeLength = segments.reduce((total, segment) => total + segment.length, 0);
    drawStaticWorld();
  }

  function buyTower(type) {
    const stats = towers[type];
    if (!stats?.premium || unlockedTowers.has(type)) return;
    if (gems < stats.gemCost) {
      setMessage(`You need ${stats.gemCost - gems} more gems to unlock ${stats.name}.`);
      return;
    }
    gems -= stats.gemCost;
    unlockedTowers.add(type);
    saveAccountProgress();
    setMessage(`${stats.name} unlocked! It is ready in your arsenal.`);
    uiDirty = true;
  }

  function openShop() {
    shopReturnState = state;
    state = "shop";
    selectedType = null;
    uiDirty = true;
  }

  function resetGame() {
    gold = 260;
    lives = 20;
    wave = 0;
    selectedType = null;
    selectedTower = null;
    placedTowers = [];
    activeEnemies = [];
    projectiles = [];
    damageFields = [];
    summonedSkeletons = [];
    particles = [];
    effects = [];
    spawnQueue = [];
    spawnTimer = 0;
    gameSpeed = 1;
    autoWave = false;
    autoWaveTimer = 0;
    campaignRewarded = false;
    returnToCampaign = false;
    nextEntityId = 1;
    state = "build";
    setMessage("Choose a defender, then place it on the grass.");
    uiDirty = true;
  }

  function showOverlay() {
    const screens = ["menu", "mode-select", "map-select", "shop", "settings", "about", "paused", "gameover", "victory"];
    const visible = screens.includes(state);
    ui.overlay.classList.toggle("is-hidden", !visible);
    ui.overlay.classList.toggle("is-menu", ["menu", "mode-select", "map-select", "shop", "settings", "about"].includes(state));
    if (!visible) return;
    if (state === "menu") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">A DEFENSE GAME ABOUT HOLDING ON</p><h1>Last Light</h1>
        <p class="overlay-copy">Choose your challenge, build a defense, and keep the gate alive.</p>
        <div class="menu-actions">${returnToCampaign ? `<button class="primary-button" data-action="resume">RESUME CAMPAIGN</button>` : ""}
        <button class="primary-button" data-action="play">PLAY</button>
        <button class="secondary-button" data-action="shop">TOWER SHOP · ✦ ${gems}</button>
        <button class="secondary-button" data-action="settings">SETTINGS</button>
        <button class="secondary-button" data-action="about">ABOUT THE GAME</button></div>`;
    } else if (state === "mode-select") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">STEP 1 · ENEMY DIFFICULTY</p><h1>Choose a mode</h1>
        <p class="overlay-copy">Mode changes enemy strength and campaign length. Map stars are a separate challenge.</p>
        <div class="choice-grid mode-grid">${modeOrder.map((key) => {
          const mode = modes[key];
          return `<button class="choice-card${selectedMode === key ? " is-selected" : ""}" data-mode="${key}" aria-pressed="${selectedMode === key}">
            <strong>${mode.name}</strong><span>${mode.waves} waves</span><small>${mode.description}</small></button>`;
        }).join("")}</div>
        <div class="overlay-actions"><button class="secondary-button" data-action="home">MAIN MENU</button><button class="primary-button" data-action="maps">CHOOSE MAP →</button></div>`;
    } else if (state === "map-select") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">STEP 2 · MAP CHALLENGE</p><h1>Choose a map</h1>
        <p class="overlay-copy"><strong>${modes[selectedMode].name} · ${modes[selectedMode].waves} waves</strong> sets enemy difficulty. Map stars rate terrain challenge only.</p>
        <div class="choice-grid map-grid">${Object.entries(maps).map(([key, map]) => `
          <button class="choice-card map-choice${selectedMapKey === key ? " is-selected" : ""}" data-map="${key}" aria-pressed="${selectedMapKey === key}">
            <strong>${map.name}</strong><span class="map-stars" aria-label="${map.stars} star map">${"★".repeat(map.stars)}${"☆".repeat(5 - map.stars)}</span>
            <small>Map difficulty · ${map.stars}/5 stars</small></button>`).join("")}</div>
        <p class="map-rules">Enemy mode: ${modes[selectedMode].name} · Map difficulty: ${maps[selectedMapKey].stars}/5 stars. These are separate settings.</p>
        <div class="overlay-actions"><button class="secondary-button" data-action="modes">← CHANGE MODE</button><button class="primary-button" data-action="launch">START CAMPAIGN</button></div>`;
    } else if (state === "shop") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">PERMANENT UNLOCKS · BATTLE GOLD IS SEPARATE</p><h1>Tower shop</h1>
        <p class="overlay-copy">Complete campaigns to earn gems. Spend them here to unlock towers for battles.</p>
        <p class="gem-balance">YOUR GEMS <strong>✦ ${gems}</strong></p>
        <div class="shop-grid">${Object.entries(towers).filter(([, stats]) => stats.premium).map(([key, stats]) => `
          <article class="shop-card"><span class="shop-icon" style="color:${stats.color}">${stats.icon}</span>
            <div><strong>${stats.name}</strong><small>${stats.role}</small></div>
            <button class="shop-buy" data-buy="${key}" ${unlockedTowers.has(key) || gems < stats.gemCost ? "disabled" : ""}>
              ${unlockedTowers.has(key) ? "UNLOCKED" : `✦ ${stats.gemCost}`}</button></article>`).join("")}</div>
        <div class="overlay-actions"><button class="secondary-button" data-action="shop-back">BACK</button></div>`;
    } else if (state === "settings") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">TUNE YOUR DEFENSE</p><h1>Settings</h1>
        <p class="overlay-copy">Your preferences are saved on this device.</p>
        <div class="setting-row"><span><strong>Game sounds</strong><small>Music and tower sound effects</small></span><button class="secondary-button" data-action="toggle-sound">${soundEnabled ? "ON" : "OFF"}</button></div>
        <div class="setting-row"><span><strong>Reduced visual effects</strong><small>Reduce ambient particles and flashes</small></span><button class="secondary-button" data-action="toggle-effects">${settingsReducedMotion ? "ON" : "OFF"}</button></div>
        <div class="overlay-actions"><button class="secondary-button" data-action="home">MAIN MENU</button></div>`;
    } else if (state === "about") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">ABOUT LAST LIGHT</p><h1>Hold the line.</h1>
        <p class="about-copy">Last Light is a strategy tower-defense game about protecting the last gate from an ever-changing night. Choose one of five enemy modes, then pick one of five maps with its own separate terrain challenge. Build and upgrade ten distinct towers, survive escalating waves and boss encounters, and earn gems by completing a campaign to unlock five specialist towers.</p>
        <p class="about-copy">Battle gold is temporary and only buys defenses during a campaign. Gems are separate, saved between campaigns on this device, and used only in the tower shop.</p>
        <div class="overlay-actions"><button class="secondary-button" data-action="home">MAIN MENU</button></div>`;
    } else if (state === "paused") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">TAKE A BREATH</p><h1>Battle paused</h1>
        <p class="overlay-copy">Your defenders are waiting. Pick up where you left off.</p>
        <div class="overlay-actions"><button class="primary-button" data-action="resume">RESUME DEFENSE</button><button class="secondary-button" data-action="home">MAIN MENU</button></div>`;
    } else if (state === "gameover") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">THE GATE HAS FALLEN</p><h1>The night wins.</h1>
        <p class="overlay-copy">You reached wave ${wave} of ${modes[currentMode].waves} in ${modes[currentMode].name}.</p>
        <div class="overlay-actions"><button class="primary-button" data-action="retry">TRY AGAIN</button><button class="secondary-button" data-action="home">MAIN MENU</button></div>`;
    } else if (state === "victory") {
      ui.overlayContent.innerHTML = `
        <p class="overlay-eyebrow">CAMPAIGN COMPLETE · ${modes[currentMode].waves} WAVES</p><h1>The light endures.</h1>
        <p class="overlay-copy">${modes[currentMode].name} conquered on ${maps[currentMapKey].name}. You earned ✦ ${modes[currentMode].reward} gems for the tower shop.</p>
        <div class="overlay-actions"><button class="primary-button" data-action="retry">PLAY AGAIN</button><button class="secondary-button" data-action="home">MAIN MENU</button></div>`;
    }
  }

  function renderTowerList() {
    ui.towerList.innerHTML = Object.entries(towers).map(([key, stats], index) => {
      const count = placedTowers.filter((tower) => tower.type === key).length;
      const locked = stats.premium && !unlockedTowers.has(key);
      return `<button class="tower-card${selectedType === key ? " is-selected" : ""}" type="button" data-tower="${key}" aria-pressed="${selectedType === key}" ${!locked && (gold < stats.cost || count >= stats.limit) ? "disabled" : ""}>
        <span class="tower-icon" style="color:${stats.color}">${stats.icon}</span>
        <span class="tower-copy"><strong>${stats.name}</strong><small>${locked ? `LOCKED · ✦ ${stats.gemCost}` : `${stats.role} · ${count}/${stats.limit}`}</small></span>
        <span class="tower-cost">${locked ? "SHOP" : `◈ ${stats.cost}`}</span>
      </button>`;
    }).join("");
    ui.towerList.querySelectorAll("[data-tower]").forEach((button) => {
      button.addEventListener("click", () => {
        const stats = towers[button.dataset.tower];
        if (stats.premium && !unlockedTowers.has(button.dataset.tower)) {
          setMessage(`Unlock ${stats.name} in the tower shop for ✦ ${stats.gemCost}.`);
          return;
        }
        selectTower(button.dataset.tower);
      });
    });
  }

  function renderBossRoster() {
    const scheduledWaves = bossWavesForMode();
    ui.bossRoster.innerHTML = scheduledWaves.map((bossWave, index) => {
      const boss = bosses[index % bosses.length];
      return `
      <div class="boss-row" style="--boss-tint:${boss.color}" title="${boss.description}">
        <span class="boss-symbol">${boss.symbol}</span>
        <span><strong>${boss.name}</strong><small>WAVE ${bossWave} · ${boss.trait}</small></span>
      </div>`;
    }).join("");
  }

  function updateBossIntel() {
    const isCurrentBoss = bossWavesForMode().includes(wave) && (state === "wave" || state === "gameover");
    const bossWave = isCurrentBoss ? wave : upcomingBossWave(wave);
    ui.bossCount.textContent = `${bossWavesForMode().length} BOSSES`;
    if (!bossWave) {
      ui.bossCategory.textContent = `${modes[currentMode].name.toUpperCase()} COMPLETE`;
      ui.bossName.textContent = "The gate is secure";
      ui.bossTrait.textContent = "ALL CAMPAIGN BOSSES DEFEATED";
      ui.bossWave.textContent = `WAVE ${modes[currentMode].waves}`;
      ui.bossProgress.style.width = "100%";
      ui.bossProgressLabel.textContent = "You held the Last Light.";
      return;
    }
    const boss = bossForWave(bossWave);
    const bossActive = state === "wave" && wave === bossWave;
    ui.bossCategory.textContent = boss.category;
    ui.bossName.textContent = boss.name;
    ui.bossName.style.color = boss.color;
    ui.bossTrait.textContent = boss.trait;
    ui.bossWave.textContent = `WAVE ${bossWave}`;
    const previousBossWave = [...bossWavesForMode()].reverse().find((value) => value < bossWave) || 0;
    ui.bossProgress.style.width = `${bossActive ? 100 : Math.max(0, (wave - previousBossWave) / (bossWave - previousBossWave) * 100)}%`;
    ui.bossProgressLabel.textContent = bossActive
      ? `${boss.description} · BOSS ON THE FIELD`
      : `${bossWave - wave} ${bossWave - wave === 1 ? "wave" : "waves"} until this encounter`;
  }

  function renderInspection() {
    if (!selectedTower) {
      ui.inspection.innerHTML = `<h2>Hold the line</h2><p>${selectedType ? `Click the grass to deploy your ${towers[selectedType].name}. Press Esc to cancel.` : "Place defenders beside the road. They'll target the closest threat automatically."}</p><div class="intel-tags"><span>✦ AUTO-TARGET</span><span>⌁ UPGRADE</span></div>`;
      return;
    }
    const stats = towers[selectedTower.type];
    const damage = Math.round(stats.damage * (1 + .15 * selectedTower.level));
    const range = stats.range + selectedTower.level * 4;
    const cost = Math.round(stats.cost * (.55 + (selectedTower.level + 1) * .38));
    const refund = Math.floor(stats.cost * (.72 + selectedTower.level * .25));
    const summonStatus = selectedTower.type === "summoner"
      ? `<div class="tower-details"><span>💀 ${summonedSkeletons.filter((skeleton) => skeleton.towerId === selectedTower.id).length}/${3 + Math.floor(selectedTower.level / 5)} SKELETONS</span><span>♥ ${summonedSkeletons.filter((skeleton) => skeleton.towerId === selectedTower.id).reduce((total, skeleton) => total + skeleton.hp, 0)} TOTAL HP</span></div>`
      : "";
    const pathChoices = selectedTower.level >= 1 && selectedTower.type === "elementalist"
      ? `<div class="path-choices"><button type="button" data-path="fire" class="${selectedTower.branch === "fire" ? "is-selected" : ""}">PYROMANCER</button><button type="button" data-path="ice" class="${selectedTower.branch === "ice" ? "is-selected" : ""}">GLACIER</button></div>`
      : selectedTower.level >= 1 && selectedTower.type === "alchemist"
        ? `<div class="path-choices"><button type="button" data-path="toxin" class="${selectedTower.branch === "toxin" ? "is-selected" : ""}">TOXIC GAS</button><button type="button" data-path="acid" class="${selectedTower.branch === "acid" ? "is-selected" : ""}">CORROSIVE ACID</button></div>`
        : selectedTower.level >= 1 && selectedTower.type === "overcharge"
          ? `<div class="path-choices"><button type="button" data-path="plasma" class="${selectedTower.branch === "plasma" ? "is-selected" : ""}">PLASMA CHAINS</button><button type="button" data-path="static" class="${selectedTower.branch === "static" ? "is-selected" : ""}">STATIC FIELD</button></div>`
        : "";
    const attackStyle = selectedTower.type === "elementalist"
      ? selectedTower.level === 0 ? "Standard Arc" : selectedTower.branch === "ice" ? "Glacier · slowing ice field" : "Pyromancer · lingering magma"
      : selectedTower.type === "laser" ? selectedTower.level === 0 ? "Pulse laser" : selectedTower.level < 2 ? "Beam Lock" : "Orbital Prism · refracted beams"
        : selectedTower.type === "alchemist" ? selectedTower.level === 0 ? "Mortar bomb" : selectedTower.branch === "acid" ? "Corrosive acid puddle" : "Toxic gas cloud"
          : selectedTower.type === "void" ? selectedTower.level < 1 ? "Graviton spark" : selectedTower.level < 2 ? "Singularity burst" : "Event Horizon · portal strikes"
            : selectedTower.type === "overcharge" ? selectedTower.level < 1 ? "Spark Coil" : selectedTower.branch === "static" ? "Static Field · area pulses" : "Overcharged plasma · 5 chains"
              : `Level ${selectedTower.level + 1} attack`;
    ui.inspection.innerHTML = `
      <h2 style="color:${stats.color}">${stats.name} <span style="color:#95a09e">· LV ${selectedTower.level + 1}</span></h2>
      <p>${selectedTower.type === "summoner" ? "Raises skeleton defenders at the gate. Enemies stop to attack them; skeletons fight back until one side falls." : `Deals ${damage} damage · ${range} range · ${attackStyle}.`}</p>
      <div class="tower-details"><span>✦ ${damage} DMG</span><span>◎ ${range} RANGE</span></div>
      ${summonStatus}
      ${pathChoices}
      <div class="inspect-actions">${selectedTower.level < 9 ? `<button type="button" data-action="upgrade" ${gold < cost ? "disabled" : ""}>✦ UPGRADE · ◈ ${cost} · LV ${selectedTower.level + 2}</button>` : `<span class="max-level">MAX LEVEL · 10</span>`}<button class="sell-button" type="button" data-action="sell">SELL · ◈ ${refund}</button></div>`;
    const upgrade = ui.inspection.querySelector('[data-action="upgrade"]');
    const sell = ui.inspection.querySelector('[data-action="sell"]');
    if (upgrade) upgrade.addEventListener("click", upgradeTower);
    sell.addEventListener("click", sellTower);
    ui.inspection.querySelectorAll("[data-path]").forEach((button) => button.addEventListener("click", () => chooseTowerBranch(button.dataset.path)));
  }

  function updateUI() {
    ui.lives.textContent = lives;
    ui.gold.textContent = gold;
    ui.wave.textContent = wave === 0 ? "PREPARE" : String(wave);
    ui.best.textContent = bestWave || "—";
    ui.gemCount.textContent = gems;
    ui.shopGems.textContent = gems;
    ui.count.textContent = `${placedTowers.length} BUILT`;
    ui.nextWave.textContent = wave >= modes[currentMode].waves ? "—" : wave + 1;
    ui.message.textContent = message;
    ui.campaignLabel.textContent = `${modes[currentMode].name} · ${maps[currentMapKey].name} · ${wave}/${modes[currentMode].waves}`;
    ui.waveButton.disabled = state !== "build";
    ui.autoWaveButton.disabled = ["menu", "mode-select", "map-select", "shop", "settings", "about", "gameover", "victory"].includes(state);
    ui.autoWaveButton.textContent = autoWave ? "AUTO: ON" : "AUTO: OFF";
    ui.autoWaveButton.classList.toggle("is-active", autoWave);
    ui.autoWaveButton.setAttribute("aria-pressed", String(autoWave));
    ui.speedButton.textContent = `▶ ${gameSpeed}×`;
    ui.speedButton.classList.toggle("is-active", gameSpeed === 2);
    ui.pauseButton.classList.toggle("is-active", state === "paused");
    ui.pauseButton.textContent = state === "paused" ? "▶" : "Ⅱ";
    ui.menuButton.disabled = ["menu", "mode-select", "map-select", "settings", "about"].includes(state);
    ui.soundButton.classList.toggle("is-active", !soundEnabled);
    ui.soundButton.textContent = soundEnabled ? "♫" : "♪̸";
    ui.soundButton.setAttribute("aria-label", soundEnabled ? "Mute game sounds" : "Enable game sounds");
    ui.soundButton.title = soundEnabled ? "Mute game sounds" : "Enable game sounds";
    renderTowerList();
    renderInspection();
    renderBossRoster();
    updateBossIntel();
    showOverlay();
    uiDirty = false;
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function glow(x, y, tint, radius, strength = 1) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, tint);
    gradient.addColorStop(.23, tint);
    gradient.addColorStop(1, "transparent");
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, strength));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGate() {
    const pulse = .5 + .5 * Math.sin(gameTime * 2.4);
    glow(912, 455, "#d77368", 78, .17 + pulse * .1);
    glow(942, 455, "#ffd394", 45, .26 + pulse * .18);
    ctx.save();
    ctx.shadowColor = "#f0a06f";
    ctx.shadowBlur = 24 + pulse * 14;
    roundedRect(884, 407, 50, 96, 10);
    ctx.fillStyle = "#242a31";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#d28a72";
    ctx.lineWidth = 2;
    ctx.stroke();
    roundedRect(892, 418, 34, 79, 18);
    const portal = ctx.createLinearGradient(892, 418, 926, 497);
    portal.addColorStop(0, "#5c3943");
    portal.addColorStop(.5, "#d07b6a");
    portal.addColorStop(1, "#3d3442");
    ctx.fillStyle = portal;
    ctx.fill();
    ctx.fillStyle = "#ffe2ab";
    ctx.shadowColor = "#ffcb8b";
    ctx.shadowBlur = 14;
    ctx.font = "bold 22px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("✦", 909, 462);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f4c58a";
    ctx.font = "800 8px system-ui";
    ctx.letterSpacing = "1px";
    ctx.fillText("THE GATE", 909, 486);
    ctx.restore();
    const [breachX, breachY] = positionOnRoute(12);
    glow(breachX, breachY, "#fb8d76", 27, .5 + pulse * .2);
    ctx.fillStyle = "#ffe0ad";
    ctx.beginPath();
    ctx.arc(breachX, breachY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4a087";
    ctx.font = "800 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("BREACH", breachX, breachY - 28);
  }

  function drawFireflies(now) {
    if (settingsReducedMotion) return;
    for (const fly of fireflies) {
      const flicker = .18 + .52 * (.5 + .5 * Math.sin(now * .0015 * fly.drift + fly.phase));
      const x = fly.x + Math.sin(now * .0003 + fly.phase) * 4;
      const y = fly.y + Math.cos(now * .0004 + fly.phase) * 3;
      glow(x, y, "#ffefad", 12, flicker);
      ctx.fillStyle = `rgba(255,241,190,${flicker})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTower(tower, selected = false) {
    const stats = towers[tower.type];
    const pulse = .8 + .2 * Math.sin(gameTime * 4 + tower.id);
    const angle = tower.aim || -Math.PI / 2;
    ctx.save();
    ctx.translate(tower.x, tower.y);
    if (selected) {
      ctx.strokeStyle = "rgba(242,239,215,.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 25 + Math.sin(gameTime * 3) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    glow(0, 0, stats.color, 39, .32 * pulse);
    ctx.fillStyle = "rgba(9,19,21,.58)";
    ctx.beginPath();
    ctx.ellipse(0, 9, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#293b3b";
    ctx.strokeStyle = "#849487";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + i * Math.PI / 4;
      const x = Math.cos(a) * 19;
      const y = 4 + Math.sin(a) * 16;
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#405650";
    ctx.beginPath();
    ctx.arc(0, 4, 11, 0, Math.PI * 2);
    ctx.fill();

    if (tower.type === "elementalist") {
      const hue = tower.branch === "ice" && tower.level >= 1 ? "#8cecff" : tower.level >= 1 ? "#ff7548" : "#f8f8ff";
      const count = Math.min(5, 1 + Math.floor(tower.level / 2));
      const orbit = gameTime * (1 + tower.level * .08) + tower.id;
      for (let shard = 0; shard < count; shard++) {
        const phase = orbit + shard * Math.PI * 2 / count;
        const radius = 8 + (tower.level >= 4 ? 5 : 0);
        const sx = Math.cos(phase) * radius;
        const sy = -7 + Math.sin(phase) * radius;
        glow(sx, sy, hue, 12, .72 * pulse);
        ctx.fillStyle = shard % 2 ? hue : "#fff6dc";
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 + tower.level * .08, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = hue;
      ctx.lineWidth = 2 + Math.min(3, tower.level * .25);
      ctx.beginPath();
      ctx.arc(0, 1, 11 + Math.sin(gameTime * 3) * 1.2, gameTime, gameTime + Math.PI * 1.6);
      ctx.stroke();
    } else if (tower.type === "laser") {
      ctx.rotate(angle);
      const laserColor = tower.level >= 4 ? "#c784ff" : "#ff687e";
      ctx.shadowColor = laserColor;
      ctx.shadowBlur = 13 + tower.level * 2;
      ctx.strokeStyle = "#392a3a";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(22, 0);
      ctx.stroke();
      ctx.strokeStyle = laserColor;
      ctx.lineWidth = 3 + Math.min(4, tower.level * .35);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff1f6";
      ctx.beginPath();
      ctx.arc(22, 0, 4 + tower.level * .18, 0, Math.PI * 2);
      ctx.fill();
      if (tower.level >= 2) {
        ctx.strokeStyle = "#ffd9e3";
        ctx.lineWidth = 1;
        for (const ray of [-.45, 0, .45]) {
          ctx.beginPath();
          ctx.moveTo(4, 0);
          ctx.lineTo(21, Math.sin(ray) * 9);
          ctx.stroke();
        }
      }
    } else if (tower.type === "alchemist") {
      const acid = tower.branch === "acid" && tower.level >= 1;
      const potion = acid ? "#ce79ff" : tower.level >= 1 ? "#8ef58b" : "#d3d9cf";
      glow(0, -5, potion, 25 + tower.level, .66 * pulse);
      ctx.fillStyle = "#313b3a";
      ctx.strokeStyle = potion;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -13); ctx.lineTo(8, -13); ctx.lineTo(6, -4);
      ctx.lineTo(10, 7); ctx.lineTo(6, 13); ctx.lineTo(-6, 13);
      ctx.lineTo(-10, 7); ctx.lineTo(-6, -4); ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = potion;
      ctx.globalAlpha = .85;
      roundedRect(-6, 2, 12, 8, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#efffe7";
      ctx.beginPath();
      ctx.arc(-2, 1, 1.5, 0, Math.PI * 2);
      ctx.arc(3, 5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tower.type === "void") {
      const phase = gameTime * 1.6 + tower.id;
      ctx.strokeStyle = "#7754a8";
      ctx.lineWidth = 2 + tower.level * .16;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 + Math.sin(phase) * 2, 6, phase, 0, Math.PI * 2);
      ctx.stroke();
      glow(0, -5, "#a85cff", 25 + tower.level * 2, .8 * pulse);
      const orb = ctx.createRadialGradient(-3, -7, 1, 0, -5, 12);
      orb.addColorStop(0, "#fff4ff");
      orb.addColorStop(.2, "#d1a4ff");
      orb.addColorStop(.56, "#682baa");
      orb.addColorStop(1, "#160d25");
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(0, -5, 7 + Math.min(4, tower.level * .35), 0, Math.PI * 2);
      ctx.fill();
      for (let mote = 0; mote < Math.min(5, 2 + Math.floor(tower.level / 2)); mote++) {
        const a = phase + mote * Math.PI * 2 / 5;
        ctx.fillStyle = "#e2c5ff";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 17, -5 + Math.sin(a) * 11, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (tower.type === "overcharge") {
      const staticMode = tower.branch === "static" && tower.level >= 1;
      const levelColor = staticMode ? "#64cfff" : tower.level >= 5 ? "#ffc968" : "#64cfff";
      ctx.strokeStyle = levelColor;
      ctx.lineWidth = 2 + tower.level * .22;
      ctx.beginPath();
      ctx.moveTo(-9, 8); ctx.lineTo(-5, -7); ctx.lineTo(1, -14);
      ctx.lineTo(8, -6); ctx.lineTo(14, -15 + Math.sin(gameTime * 6 + tower.id) * 3);
      ctx.stroke();
      glow(14, -15, levelColor, 22 + tower.level * 2, .9 * pulse);
      ctx.fillStyle = "#f7fbff";
      ctx.beginPath();
      ctx.arc(14, -15, 4 + tower.level * .15, 0, Math.PI * 2);
      ctx.fill();
      if (staticMode) {
        ctx.strokeStyle = `${levelColor}bb`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + Math.sin(gameTime * 4) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (tower.type === "summoner") {
      const orbit = gameTime * 1.8 + tower.id;
      const moteCount = Math.min(6, 3 + Math.floor(tower.level / 3));
      for (let mote = 0; mote < moteCount; mote++) {
        const phase = orbit + mote * Math.PI * 2 / moteCount;
        const mx = Math.cos(phase) * (9 + mote);
        const my = -11 + Math.sin(phase) * 7;
        glow(mx, my, stats.color, 13, .6 * pulse);
        ctx.fillStyle = mote === 0 ? "#fff4ff" : stats.color;
        ctx.beginPath();
        ctx.arc(mx, my, mote === 0 ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#d8caff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 1, 10, gameTime * .8, gameTime * .8 + Math.PI * 1.6);
      ctx.stroke();
      ctx.fillStyle = "#4a3d6c";
      ctx.beginPath();
      ctx.moveTo(-8, 11); ctx.lineTo(-5, -8); ctx.lineTo(0, -13);
      ctx.lineTo(5, -8); ctx.lineTo(8, 11); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = stats.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      glow(0, -4, stats.color, 22, .8 * pulse);
      ctx.fillStyle = "#f4eaff";
      ctx.beginPath();
      ctx.arc(0, -4, 4.5 + Math.sin(gameTime * 5 + tower.id) * .8, 0, Math.PI * 2);
      ctx.fill();
    } else if (tower.type === "tesla") {
      const arcColor = tower.level >= 5 ? "#ffd06a" : stats.color;
      const sway = Math.sin(gameTime * 5 + tower.id) * 2;
      ctx.strokeStyle = "#8a78b2";
      ctx.lineWidth = 5 + tower.level * .35;
      ctx.beginPath();
      ctx.moveTo(-8, 7); ctx.lineTo(-5, -9); ctx.lineTo(2, -15); ctx.lineTo(9, -8); ctx.lineTo(15, -16 + sway);
      ctx.stroke();
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 2 + tower.level * .22;
      ctx.stroke();
      glow(15, -16 + sway, arcColor, 22 + tower.level * 1.4, .9);
      ctx.fillStyle = "#fff1ff";
      ctx.beginPath();
      ctx.arc(15, -16 + sway, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (tower.type === "frost") {
      ctx.rotate(angle + Math.PI / 2);
      ctx.scale(1 + tower.level * .035, 1 + tower.level * .035);
      glow(0, -3, stats.color, 24 + tower.level * 1.5, .75 * pulse);
      const crystal = new Path2D();
      crystal.moveTo(0, -19); crystal.lineTo(10, -3); crystal.lineTo(6, 9);
      crystal.lineTo(0, 14); crystal.lineTo(-6, 9); crystal.lineTo(-10, -3); crystal.closePath();
      const ice = ctx.createLinearGradient(-9, -12, 8, 10);
      ice.addColorStop(0, "#dcfbfa");
      ice.addColorStop(.42, "#62b8ca");
      ice.addColorStop(1, "#315766");
      ctx.fillStyle = ice;
      ctx.strokeStyle = "#b9f6f2";
      ctx.lineWidth = 1.5;
      ctx.fill(crystal);
      ctx.stroke(crystal);
      ctx.strokeStyle = "rgba(240,255,250,.8)";
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(0, 8); ctx.moveTo(0, -1); ctx.lineTo(7, -7); ctx.moveTo(0, 2); ctx.lineTo(-7, -5);
      ctx.stroke();
    } else {
      const isCannon = tower.type === "cannon";
      ctx.rotate(angle);
      ctx.fillStyle = isCannon ? "#67544c" : "#aa7949";
      ctx.strokeStyle = "#18201f";
      ctx.lineWidth = isCannon ? 14 + tower.level * .45 : 11;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-2, 4);
      ctx.lineTo(isCannon ? 23 : 25, 0);
      ctx.stroke();
      ctx.strokeStyle = stats.color;
      ctx.lineWidth = isCannon ? 6 + tower.level * .28 : 3 + tower.level * .15;
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.lineTo(isCannon ? 23 : 25, 0);
      ctx.stroke();
      ctx.fillStyle = stats.color;
      ctx.beginPath();
      ctx.arc(isCannon ? 23 : 25, 0, isCannon ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      if (tower.type === "ranger") {
        ctx.strokeStyle = "#f0cd8c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(12, 0, 8, -1.12, 1.12);
        ctx.stroke();
        ctx.strokeStyle = "#f8e8c5";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, -7); ctx.lineTo(8, 7);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#332d2c";
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(5, side * 11, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#b17c5a";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#fff3d1";
      ctx.beginPath();
      ctx.arc(0, 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tower.level) {
      ctx.rotate(-angle);
      ctx.fillStyle = "#31352f";
      ctx.strokeStyle = "#d0ae65";
      ctx.lineWidth = 1;
      roundedRect(-13, -34, 26, 15, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffe09b";
      ctx.font = "bold 9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("★".repeat(tower.level), 0, -23);
    }
    ctx.restore();
  }

  function drawSkeleton(skeleton) {
    const [aheadX, aheadY] = positionOnRoute(Math.max(0, Math.min(routeLength, skeleton.progress + skeleton.direction * 3)));
    const angle = Math.atan2(aheadY - skeleton.y, aheadX - skeleton.x) + Math.PI / 2;
    const walking = skeleton.meleeTimer < skeleton.attackCooldown ? Math.sin(gameTime * 14 + skeleton.id) * 2 : 0;
    const x = skeleton.x;
    const y = skeleton.y - 17;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    glow(0, 0, "#c1adff", 25, .38);

    ctx.strokeStyle = "#342c42";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-1, -3);
    ctx.lineTo(-1, 10);
    ctx.stroke();

    ctx.strokeStyle = "#e5d9b7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(0, 8);
    ctx.moveTo(-8, 1);
    ctx.lineTo(8, 1);
    ctx.moveTo(-7, 4);
    ctx.lineTo(7, 4);
    ctx.moveTo(-6, 7);
    ctx.lineTo(6, 7);
    ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 2, 1);
      ctx.lineTo(side * (9 + walking), 6);
      ctx.moveTo(side * 9, 2);
      ctx.lineTo(side * (13 + walking), 10);
      ctx.moveTo(side * 2, 9);
      ctx.lineTo(side * 6, 14 + walking);
      ctx.lineTo(side * 10, 17 - walking);
      ctx.stroke();
    }

    ctx.fillStyle = "#f0e5ca";
    ctx.strokeStyle = "#b9a3e5";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -8, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#493752";
    ctx.beginPath();
    ctx.arc(-2, -8, 1.3, 0, Math.PI * 2);
    ctx.arc(2, -8, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8e7ca8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -3);
    ctx.lineTo(0, -1);
    ctx.lineTo(2, -3);
    ctx.stroke();

    const swing = skeleton.meleeTimer < .13 ? 1 : 0;
    ctx.save();
    ctx.translate(10 + swing * 3, 6);
    ctx.rotate(-.65 + swing * 1.5);
    ctx.strokeStyle = "#bbaad7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -9);
    ctx.stroke();
    ctx.fillStyle = "#e8e0f1";
    ctx.beginPath();
    ctx.moveTo(-2, -9);
    ctx.lineTo(0, -15);
    ctx.lineTo(2, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();

    const barX = x - 12;
    const barY = y - 23;
    roundedRect(barX, barY, 24, 4, 2);
    ctx.fillStyle = "rgba(9,14,20,.88)";
    ctx.fill();
    roundedRect(barX, barY, Math.max(2, 24 * skeleton.hp / skeleton.maxHp), 4, 2);
    const health = ctx.createLinearGradient(barX, barY, barX + 24, barY);
    health.addColorStop(0, "#a8e1a5");
    health.addColorStop(1, "#d6c1ff");
    ctx.fillStyle = health;
    ctx.fill();
  }

  function drawHealthBar(enemy, x, y, width, height) {
    const fraction = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
    roundedRect(x, y, width, height, height / 2);
    ctx.fillStyle = "rgba(12,17,21,.86)";
    ctx.fill();
    if (!fraction) return;
    roundedRect(x, y, Math.max(height, width * fraction), height, height / 2);
    const health = ctx.createLinearGradient(x, y, x + width, y);
    health.addColorStop(0, enemy.boss ? "#ffbf79" : "#f2d68b");
    health.addColorStop(1, enemy.color);
    ctx.fillStyle = health;
    ctx.fill();
  }

  function drawEnemy(enemy, now) {
    const bob = Math.sin(gameTime * 7 + enemy.id) * 1.7;
    const x = enemy.x;
    const y = enemy.y + bob;
    const r = enemy.radius;
    if (enemy.progress > 12) {
      ctx.beginPath();
      for (let step = 5; step >= 1; step--) {
        const [tx, ty] = positionOnRoute(Math.max(0, enemy.progress - step * 8));
        if (step === 5) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
      }
      ctx.strokeStyle = `${enemy.color}80`;
      ctx.lineWidth = enemy.boss ? 3 : 1.5;
      ctx.stroke();
    }
    glow(x, y, enemy.color, r * (enemy.boss ? 2.5 : 1.7), enemy.boss ? .64 : .5);
    ctx.fillStyle = "rgba(12,22,24,.55)";
    ctx.beginPath();
    ctx.ellipse(x, y + r, r * 1.1, r * .45, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.boss) {
      ctx.strokeStyle = `${enemy.color}99`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r + 10 + Math.sin(gameTime * 3) * 2, 0, Math.PI * 2);
      ctx.stroke();
      const spikes = new Path2D();
      for (let i = 0; i < 12; i++) {
        const angle = i / 12 * Math.PI * 2;
        const radius = i % 2 ? r * .78 : r + 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (!i) spikes.moveTo(px, py); else spikes.lineTo(px, py);
      }
      spikes.closePath();
      ctx.fillStyle = "#201f2b";
      ctx.strokeStyle = enemy.color;
      ctx.lineWidth = 2;
      ctx.fill(spikes);
      ctx.stroke(spikes);
      for (let mote = 0; mote < 3; mote++) {
        const angle = now * .0018 + mote * Math.PI * 2 / 3;
        const mx = x + Math.cos(angle) * (r + 11);
        const my = y + Math.sin(angle) * (r + 11);
        glow(mx, my, enemy.color, 10, .8);
        ctx.fillStyle = "#fff0c7";
        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#fff4da";
      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = 10;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(x + side * 7, y - 3, 2.4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff4da";
      ctx.font = "bold 13px Georgia";
      ctx.textAlign = "center";
      ctx.fillText(enemy.symbol, x, y + 19);
      ctx.shadowBlur = 0;
      const labelX = Math.max(92, Math.min(W - 92, x));
      ctx.font = "800 9px system-ui";
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(12,17,21,.9)";
      ctx.strokeText(enemy.name, labelX, y - r - 32, 180);
      ctx.fillStyle = "#fff2d9";
      ctx.fillText(enemy.name, labelX, y - r - 32, 180);
      ctx.font = "800 7px system-ui";
      ctx.letterSpacing = "1px";
      ctx.fillStyle = enemy.color;
      ctx.fillText(enemy.trait, labelX, y - r - 21, 150);
      drawHealthBar(enemy, labelX - 42, y - r - 13, 84, 7);
      if (enemy.shieldUntil > gameTime || enemy.armor >= .3) {
        ctx.strokeStyle = `${enemy.color}cc`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r + 13 + Math.sin(gameTime * 5) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (enemy.type === "runner") {
      const ahead = positionOnRoute(Math.min(routeLength, enemy.progress + 4));
      const here = positionOnRoute(enemy.progress);
      const angle = Math.atan2(ahead[1] - here[1], ahead[0] - here[0]);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(r + 5, 0);
      ctx.lineTo(-r, -r * .8);
      ctx.lineTo(-r * .65, 0);
      ctx.lineTo(-r, r * .8);
      ctx.closePath();
      const runnerFill = ctx.createLinearGradient(-r, -r, r, r);
      runnerFill.addColorStop(0, "#fff0b8");
      runnerFill.addColorStop(.3, enemy.color);
      runnerFill.addColorStop(1, "#b96359");
      ctx.fillStyle = runnerFill;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffdfad";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    } else if (enemy.type === "brute") {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4 - Math.PI / 2;
        const radius = i % 2 ? r * .86 : r * 1.12;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const armor = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
      armor.addColorStop(0, "#f4b3a0");
      armor.addColorStop(.4, enemy.color);
      armor.addColorStop(1, "#753e4c");
      ctx.fillStyle = armor;
      ctx.fill();
      ctx.strokeStyle = "#f2c2a0";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ffe7c3";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x + side * 4, y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#663e4a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 7, y + 4);
      ctx.lineTo(x + 7, y + 4);
      ctx.stroke();
    } else {
      const wobble = Math.sin(gameTime * 5 + enemy.id) * 2;
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.ellipse(x, y + wobble, r + 1, r, Math.sin(gameTime * 2 + enemy.id) * .08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8c5f0";
      ctx.beginPath();
      ctx.arc(x - 3, y - 4 + wobble, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a1b33";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x + side * 3, y - 2 + wobble, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (!enemy.boss && enemy.hp < enemy.maxHp) drawHealthBar(enemy, x - r, y - r - 8, r * 2, 3);
    if (enemy.slowUntil > gameTime) {
      ctx.strokeStyle = "rgba(151,235,246,.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r + 4 + Math.sin(now * .01) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.shielded || enemy.boss && enemy.shieldUntil > gameTime) {
      ctx.strokeStyle = "rgba(155,196,255,.88)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 8 + Math.sin(now * .008) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#b9d7ff";
      ctx.font = "800 7px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("SHIELD", x, y + r + 17);
    }
    if (enemy.hidden) {
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(195,157,255,.7)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#d4bdff";
      ctx.font = "800 7px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("HIDDEN", x, y - r - 11);
    }
  }

  function drawEffects() {
    for (const effect of effects) {
      const progress = 1 - effect.life / effect.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - progress);
      if (effect.type === "lightning" || effect.type === "beam") {
        if (effect.points.length > 1) {
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.beginPath();
          effect.points.forEach(([x, y], index) => {
            if (!index) ctx.moveTo(x, y);
            else {
              const midX = (effect.points[index - 1][0] + x) / 2 + (random() - .5) * 15;
              const midY = (effect.points[index - 1][1] + y) / 2 + (random() - .5) * 15;
              ctx.lineTo(midX, midY);
              ctx.lineTo(x, y);
            }
          });
          ctx.shadowColor = effect.color;
          ctx.shadowBlur = 18;
          ctx.strokeStyle = "#fff5ff";
          ctx.lineWidth = effect.type === "beam" ? 9 : 5;
          ctx.stroke();
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = effect.type === "beam" ? 5 : 2;
          ctx.stroke();
        }
      } else {
        const radius = effect.radius * (effect.type === "blast" ? progress : .4 + progress);
        const ring = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, radius - 7), effect.x, effect.y, Math.max(1, radius));
        ring.addColorStop(0, "transparent");
        ring.addColorStop(.75, `${effect.color}20`);
        ring.addColorStop(1, effect.color);
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, Math.max(2, radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = effect.type === "pulse" ? 2 : 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, Math.max(2, radius), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (const particle of particles) {
      const opacity = Math.max(0, particle.life / particle.maxLife);
      ctx.globalAlpha = opacity;
      glow(particle.x, particle.y, particle.color, particle.size * 4, opacity * .7);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(.7, particle.size * opacity), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawDamageFields() {
    for (const field of damageFields) {
      const alpha = Math.min(.28, .12 + field.duration * .025);
      ctx.save();
      ctx.globalAlpha = alpha;
      const haze = ctx.createRadialGradient(field.x, field.y, 1, field.x, field.y, field.radius);
      haze.addColorStop(0, field.color);
      haze.addColorStop(.62, `${field.color}78`);
      haze.addColorStop(1, "transparent");
      ctx.fillStyle = haze;
      ctx.beginPath();
      ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `${field.color}bb`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(field.towerType === "void" ? [3, 5] : []);
      ctx.beginPath();
      ctx.arc(field.x, field.y, field.radius * (.9 + Math.sin(gameTime * 3) * .035), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function render(now) {
    ctx.drawImage(world, 0, 0);
    drawFireflies(now);
    drawGate();
    drawDamageFields();
    if (selectedTower) {
      const range = towers[selectedTower.type].range + selectedTower.level * 4;
      ctx.fillStyle = `${towers[selectedTower.type].color}12`;
      ctx.beginPath();
      ctx.arc(selectedTower.x, selectedTower.y, range, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(196,238,208,.32)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.arc(selectedTower.x, selectedTower.y, range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    placedTowers.forEach((tower) => drawTower(tower, tower === selectedTower));
    activeEnemies.forEach((enemy) => drawEnemy(enemy, now));

    for (const shot of projectiles) {
      ctx.save();
      ctx.lineCap = "round";
      if (shot.trail.length > 1) {
        ctx.beginPath();
        shot.trail.forEach(([x, y], index) => {
          if (!index) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = `${shot.color}80`;
        ctx.lineWidth = shot.type === "shell" ? 4 : 2;
        ctx.stroke();
      }
      const size = shot.type === "shell" || shot.type === "fireball" || shot.type === "blackHole" ? 5.5 : 3;
      glow(shot.x, shot.y, shot.color, size * (shot.type === "blackHole" ? 4 : 3), .95);
      ctx.fillStyle = shot.type === "energyBolt" ? "#ffffff" : shot.color;
      if (shot.type === "iceShard") {
        ctx.beginPath();
        ctx.moveTo(shot.x, shot.y - 7); ctx.lineTo(shot.x + 4, shot.y);
        ctx.lineTo(shot.x, shot.y + 7); ctx.lineTo(shot.x - 4, shot.y);
        ctx.closePath(); ctx.fill();
      } else if (shot.type === "flask") {
        ctx.fillRect(shot.x - 3, shot.y - 4, 6, 8);
        ctx.fillStyle = "#dfffe0"; ctx.fillRect(shot.x - 2, shot.y - 6, 4, 2);
      } else if (shot.type === "slime") {
        ctx.beginPath(); ctx.ellipse(shot.x, shot.y, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, size, 0, Math.PI * 2);
        ctx.fill();
        if (shot.type === "blackHole") {
          ctx.fillStyle = "#0d0717";
          ctx.beginPath();
          ctx.arc(shot.x, shot.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    for (const skeleton of summonedSkeletons) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, skeleton.life / .8);
      drawSkeleton(skeleton);
      ctx.restore();
    }
    drawEffects();
    if (selectedType && mouse.x >= 0 && mouse.x <= W && mouse.y >= 0 && mouse.y <= H) {
      const valid = validPlacement(mouse.x, mouse.y, selectedType);
      const tint = valid ? "#9be8b5" : "#f49b8c";
      ctx.fillStyle = `${tint}12`;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, towers[selectedType].range, 0, Math.PI * 2);
      ctx.fill();
      ctx.setLineDash([5, 8]);
      ctx.strokeStyle = `${tint}99`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, towers[selectedType].range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      drawTower({ id: 0, type: selectedType, x: mouse.x, y: mouse.y, level: 0, aim: -Math.PI / 2 });
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 220, W / 2, H / 2, 700);
    vignette.addColorStop(0, "rgba(5,11,16,0)");
    vignette.addColorStop(1, "rgba(5,11,16,.22)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  function frame(now) {
    const dt = Math.min((now - lastFrame) / 1000, .045);
    lastFrame = now;
    update(dt);
    render(now);
    if (uiDirty) updateUI();
    if (now - lastBossHud >= 250) {
      updateBossIntel();
      lastBossHud = now;
    }
    requestAnimationFrame(frame);
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * W / rect.width,
      y: (event.clientY - rect.top) * H / rect.height,
    };
  }

  canvas.addEventListener("pointermove", (event) => {
    mouse = pointFromEvent(event);
  });
  canvas.addEventListener("pointerleave", () => {
    mouse = { x: -100, y: -100 };
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || state !== "build" && state !== "wave") return;
    const point = pointFromEvent(event);
    if (selectedType) {
      placeTower(point.x, point.y);
      return;
    }
    selectedTower = [...placedTowers].reverse().find((tower) => Math.hypot(tower.x - point.x, tower.y - point.y) <= 23) || null;
    uiDirty = true;
  });
  ui.waveButton.addEventListener("click", startWave);
  ui.autoWaveButton.addEventListener("click", () => {
    autoWave = !autoWave;
    if (!autoWave) autoWaveTimer = 0;
    uiDirty = true;
  });
  ui.speedButton.addEventListener("click", () => {
    gameSpeed = gameSpeed === 1 ? 2 : 1;
    uiDirty = true;
  });
  ui.pauseButton.addEventListener("click", pauseToggle);
  ui.menuButton.addEventListener("click", () => {
    if (state === "build" || state === "wave") {
      pausedFrom = state;
      returnToCampaign = true;
    }
    state = "menu";
    selectedType = null;
    selectedTower = null;
    uiDirty = true;
  });
  ui.shopButton.addEventListener("click", openShop);
  ui.soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) initializeAudio();
    if (soundEnabled) playSound("summoner");
    saveAccountProgress();
    uiDirty = true;
  });
  ui.overlayContent.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.mode) {
      selectedMode = button.dataset.mode;
    } else if (button.dataset.map) {
      selectedMapKey = button.dataset.map;
    } else if (button.dataset.buy) {
      buyTower(button.dataset.buy);
    } else if (button.dataset.action === "play") {
      state = "mode-select";
    } else if (button.dataset.action === "maps") {
      state = "map-select";
    } else if (button.dataset.action === "modes") {
      state = "mode-select";
    } else if (button.dataset.action === "launch") {
      currentMode = selectedMode;
      applyMap(selectedMapKey);
      resetGame();
    } else if (button.dataset.action === "home") {
      state = "menu";
      selectedType = null;
    } else if (button.dataset.action === "shop") {
      openShop();
    } else if (button.dataset.action === "shop-back") {
      state = shopReturnState;
    } else if (button.dataset.action === "settings") {
      state = "settings";
    } else if (button.dataset.action === "about") {
      state = "about";
    } else if (button.dataset.action === "toggle-sound") {
      soundEnabled = !soundEnabled;
      if (soundEnabled) initializeAudio();
      saveAccountProgress();
    } else if (button.dataset.action === "toggle-effects") {
      settingsReducedMotion = !settingsReducedMotion;
      try {
        localStorage.setItem("last-light-reduced-effects", String(settingsReducedMotion));
      } catch (error) {
        console.warn("Could not save visual-effects preference.", error);
      }
    } else if (button.dataset.action === "resume") {
      state = pausedFrom;
      returnToCampaign = false;
    } else if (button.dataset.action === "retry") {
      resetGame();
    }
    uiDirty = true;
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && selectedType) {
      selectedType = null;
      uiDirty = true;
    } else if (event.code === "Escape" && state === "map-select") {
      state = "mode-select";
      uiDirty = true;
    } else if (event.code === "Escape" && state !== "menu") {
      if (state === "build" || state === "wave") {
        pausedFrom = state;
        returnToCampaign = true;
      }
      state = "menu";
      uiDirty = true;
    } else if (event.code === "Space" && state === "build") {
      event.preventDefault();
      startWave();
    } else if (event.key.toLowerCase() === "p") {
      pauseToggle();
    } else if (/^[1-9]$/.test(event.key) && (state === "build" || state === "wave")) {
      selectTower(Object.keys(towers)[Number(event.key) - 1]);
    } else if (event.key === "0" && (state === "build" || state === "wave")) {
      selectTower(Object.keys(towers)[9]);
    }
  });
  window.addEventListener("pointerdown", unlockAudio, { once: true, capture: true });
  window.addEventListener("keydown", unlockAudio, { once: true });

  drawStaticWorld();
  renderBossRoster();
  updateUI();
  requestAnimationFrame(frame);
})();
