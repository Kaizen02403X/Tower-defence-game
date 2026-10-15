(() => {
  "use strict";

  const canvas = document.querySelector("#battlefield");
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = 960;
  const H = 600;
  const route = [
    [-24, 145], [205, 145], [205, 365], [455, 365],
    [455, 173], [705, 173], [705, 455], [984, 455],
  ];
  const towers = {
    ranger: { name: "Sunshot", role: "QUICK · PRECISE", icon: "➶", cost: 65, range: 142, cooldown: .58, damage: 14, color: "#f3cf7b", shot: "arrow" },
    cannon: { name: "Blastforge", role: "HEAVY · SPLASH", icon: "✹", cost: 115, range: 128, cooldown: 1.4, damage: 37, color: "#ff946e", shot: "shell", splash: 61 },
    frost: { name: "Rimecaller", role: "CHILL · SLOW", icon: "❄", cost: 85, range: 136, cooldown: 1.08, damage: 8, color: "#81daeb", shot: "frost", slow: .43, splash: 33 },
    tesla: { name: "Stormcoil", role: "CHAIN · LIGHTNING", icon: "ϟ", cost: 145, range: 118, cooldown: 1.3, damage: 22, color: "#c7a4ff", shot: "lightning", chains: 3 },
    summoner: { name: "Soulweaver", role: "SUMMON · SKELETONS", icon: "💀", cost: 155, range: 172, cooldown: 2.1, damage: 7, color: "#b9a0ff", shot: "summon" },
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
  const segments = route.slice(1).map((end, index) => {
    const start = route[index];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    return { start, dx, dy, length: Math.hypot(dx, dy) };
  });
  const routeLength = segments.reduce((total, segment) => total + segment.length, 0);
  const bossForWave = (waveNumber) => {
    if (waveNumber >= 100) return bosses[0];
    if (waveNumber >= 95) return bosses[1];
    if (waveNumber >= 90) return bosses[2];
    return bosses[Math.floor(waveNumber / 5) - 1];
  };
  const upcomingBossWave = (currentWave) => currentWave >= 100 ? null : Math.min(100, Math.floor(currentWave / 5) * 5 + 5);
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
    overlay: document.querySelector("#game-overlay"),
    overlayEyebrow: document.querySelector("#overlay-eyebrow"),
    overlayTitle: document.querySelector("#overlay-title"),
    overlayCopy: document.querySelector("#overlay-copy"),
    overlayButton: document.querySelector("#overlay-button"),
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
    const ground = terrain.createLinearGradient(0, 0, W, H);
    ground.addColorStop(0, "#33584c");
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
  let state = "intro";
  let pausedFrom = "build";
  let selectedType = null;
  let selectedTower = null;
  let placedTowers = [];
  let activeEnemies = [];
  let projectiles = [];
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
  } catch (error) {
    console.warn("Could not read the saved best wave.", error);
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
    effects.push({ type, x, y, color: tint, radius, life: duration, maxLife: duration });
  }

  function makeEnemy(index, boss = false) {
    const id = nextEntityId++;
    const [x, y] = positionOnRoute(0);
    if (boss) {
      const info = bossForWave(wave);
      const armor = info.ability === "armor" ? .38 : info.ability === "shield" ? .16 : info.ability === "overload" ? .1 : 0;
      const hp = Math.round(760 + wave * 40 + wave ** 2 * .55);
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
    const hp = Math.ceil(stats.hp * (1 + elapsedWaves * .12 + elapsedWaves ** 2 * .0015));
    return {
      id, type, ...stats, hp, maxHp: hp, speed: stats.speed + Math.min(wave, 15),
      progress: 0, x, y, slowUntil: 0, slowFactor: 1, attackTimer: 0, meleeTimer: 0,
    };
  }

  function startWave() {
    if (state !== "build" || wave >= 100) return;
    autoWaveTimer = 0;
    state = "wave";
    wave++;
    const count = 7 + wave * 2;
    spawnQueue = Array.from({ length: count }, (_, index) => ({ index, boss: wave % 5 === 0 && index === count - 2 }));
    spawnTimer = .25;
    const boss = wave % 5 === 0 ? bossForWave(wave) : null;
    setMessage(boss ? `${boss.name} approaches. ${boss.trait} — adjust your defenses!` : "Enemies incoming. Watch enemy types and cover the road.");
    uiDirty = true;
  }

  function applyDamage(enemy, amount, slow = 0, sourceType = "ranger") {
    if (enemy.dead) return;
    if (enemy.boss && enemy.phaseUntil > gameTime) return;
    const armor = enemy.boss ? enemy.armor + (enemy.shieldUntil > gameTime ? .32 : 0) : enemy.type === "brute" ? .08 : 0;
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
    const damage = stats.damage * (1 + tower.level * .42);
    const angle = Math.atan2(target.y - tower.y, target.x - tower.x);
    tower.aim = angle;
    addEffect("muzzle", tower.x + Math.cos(angle) * 21, tower.y + Math.sin(angle) * 21, stats.color, 17, .12);
    addBurst(tower.x + Math.cos(angle) * 21, tower.y + Math.sin(angle) * 21, stats.color, 3, 60);
    if (tower.type === "summoner") {
      const skeletonLimit = 3;
      if (summonedSkeletons.filter((skeleton) => skeleton.towerId === tower.id && !skeleton.dead).length >= skeletonLimit) return;
      playSound("summoner");
      const [x, y] = positionOnRoute(routeLength - 42);
      summonedSkeletons.push({
        id: nextEntityId++, towerId: tower.id, x, y, progress: routeLength - 42,
        hp: 44 + tower.level * 12, maxHp: 44 + tower.level * 12,
        speed: 104, damage: stats.damage * (1 + tower.level * .42),
        attackCooldown: .8, meleeTimer: 0, life: 35, direction: -1, slowUntil: 0, slowFactor: 1,
      });
      setMessage("A skeleton rises from the gate and joins the fight!");
      uiDirty = true;
      return;
    }
    if (tower.type === "tesla") playSound("tesla");
    else if (tower.type === "frost") playSound("frost");
    else if (tower.type === "cannon") playSound("cannon");
    else playSound("ranger");
    if (tower.type === "tesla") {
      const struck = [target];
      applyDamage(target, damage, 0, tower.type);
      for (let chain = 1; chain < stats.chains; chain++) {
        const origin = struck[struck.length - 1];
        const next = activeEnemies
          .filter((enemy) => !enemy.dead && !struck.includes(enemy) && Math.hypot(enemy.x - origin.x, enemy.y - origin.y) < 91)
          .sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))[0];
        if (!next) break;
        struck.push(next);
        applyDamage(next, damage * .72, 0, tower.type);
      }
      effects.push({ type: "lightning", points: [[tower.x, tower.y - 8], ...struck.map((enemy) => [enemy.x, enemy.y])], color: stats.color, life: .24, maxLife: .24 });
      struck.forEach((enemy) => addBurst(enemy.x, enemy.y, stats.color, 5, 100));
      return;
    }
    projectiles.push({
      type: stats.shot, target, x: tower.x, y: tower.y - 8, damage,
      speed: tower.type === "cannon" ? 295 : 405, color: stats.color,
      slow: stats.slow || 0, splash: stats.splash || 0, towerType: tower.type, trail: [],
    });
  }

  function hitProjectile(shot) {
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
      if (wave === 100) {
        state = "victory";
        setMessage("Every boss defeated. You held the Last Light through wave 100!");
        updateBest();
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
      const range = stats.range + tower.level * 10;
      if (tower.disabledUntil > gameTime) {
        tower.cooldown = Math.max(tower.cooldown, .12);
        continue;
      }
      const chilled = activeEnemies.some((enemy) => enemy.boss && enemy.ability === "frost" && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) < 112);
      const targets = activeEnemies.filter((enemy) => Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range);
      if (!targets.length) continue;
      const target = targets.reduce((furthest, enemy) => enemy.progress > furthest.progress ? enemy : furthest);
      fireTower(tower, target);
      tower.cooldown = stats.cooldown * (tower.type === "ranger" ? 1 - tower.level * .12 : 1) * (chilled ? 1.55 : 1);
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
    return gold >= towers[type].cost && state !== "gameover";
  }

  function placeTower(x, y) {
    if (!selectedType) return;
    const stats = towers[selectedType];
    if (validPlacement(x, y, selectedType)) {
      const tower = { id: nextEntityId++, type: selectedType, x, y, level: 0, cooldown: 0, aim: -Math.PI / 2 };
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
    if (state === "intro" || state === "gameover" || state === "paused") return;
    if (gold < towers[type].cost && selectedType !== type) {
      setMessage(`Not enough gold for ${towers[type].name} · need ◈ ${towers[type].cost}`);
      return;
    }
    selectedType = selectedType === type ? null : type;
    selectedTower = null;
    uiDirty = true;
  }

  function upgradeTower() {
    if (!selectedTower || selectedTower.level >= 2) return;
    const stats = towers[selectedTower.type];
    const cost = Math.round(stats.cost * (.85 + selectedTower.level * .5));
    if (gold < cost) return;
    gold -= cost;
    selectedTower.level++;
    selectedTower.cooldown = Math.min(selectedTower.cooldown, .15);
    setMessage(`${stats.name} upgraded to level ${selectedTower.level + 1}.`);
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
      state = "paused";
    } else if (state === "paused") {
      state = pausedFrom;
    }
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
    summonedSkeletons = [];
    particles = [];
    effects = [];
    spawnQueue = [];
    spawnTimer = 0;
    gameSpeed = 1;
    autoWave = false;
    autoWaveTimer = 0;
    nextEntityId = 1;
    state = "build";
    setMessage("Choose a defender, then place it on the grass.");
    uiDirty = true;
  }

  function showOverlay() {
    const visible = state === "intro" || state === "paused" || state === "gameover" || state === "victory";
    ui.overlay.classList.toggle("is-hidden", !visible);
    if (state === "intro") {
      ui.overlayEyebrow.textContent = "A DEFENSE GAME ABOUT HOLDING ON";
      ui.overlayTitle.textContent = "Last Light";
      ui.overlayCopy.textContent = "Five towers. One winding road. Legendary bosses in the dark.";
      ui.overlayButton.textContent = "ENTER THE FIELD";
    } else if (state === "paused") {
      ui.overlayEyebrow.textContent = "TAKE A BREATH";
      ui.overlayTitle.textContent = "Battle paused";
      ui.overlayCopy.textContent = "Your defenders are waiting. Pick up where you left off.";
      ui.overlayButton.textContent = "RESUME DEFENSE";
    } else if (state === "gameover") {
      ui.overlayEyebrow.textContent = "THE GATE HAS FALLEN";
      ui.overlayTitle.textContent = "The night wins.";
      ui.overlayCopy.textContent = `You reached wave ${wave}. Will you defend the gate again?`;
      ui.overlayButton.textContent = "DEFEND AGAIN";
    } else if (state === "victory") {
      ui.overlayEyebrow.textContent = "A CENTURY OF WAVES · 20 BOSSES DEFEATED";
      ui.overlayTitle.textContent = "The night is over.";
      ui.overlayCopy.textContent = "You held the gate through wave 100 and saved the Last Light.";
      ui.overlayButton.textContent = "DEFEND AGAIN";
    }
  }

  function renderTowerList() {
    ui.towerList.innerHTML = Object.entries(towers).map(([key, stats], index) => `
      <button class="tower-card${selectedType === key ? " is-selected" : ""}" type="button" data-tower="${key}" aria-pressed="${selectedType === key}" ${gold < stats.cost && selectedType !== key ? "disabled" : ""}>
        <span class="tower-icon" style="color:${stats.color}">${stats.icon}</span>
        <span class="tower-copy"><strong>${stats.name}</strong><small>${stats.role} · ${index + 1}</small></span>
        <span class="tower-cost">◈ ${stats.cost}</span>
      </button>`).join("");
    ui.towerList.querySelectorAll("[data-tower]").forEach((button) => {
      button.addEventListener("click", () => selectTower(button.dataset.tower));
    });
  }

  function renderBossRoster() {
    ui.bossRoster.innerHTML = bosses.map((boss, index) => `
      <div class="boss-row" style="--boss-tint:${boss.color}" title="${boss.description}">
        <span class="boss-symbol">${boss.symbol}</span>
        <span><strong>${boss.name}</strong><small>WAVE ${(index + 1) * 5} · ${boss.trait}</small></span>
      </div>`).join("");
  }

  function updateBossIntel() {
    const bossWave = (state === "wave" || state === "gameover") && wave % 5 === 0 ? wave : upcomingBossWave(wave);
    if (!bossWave) {
      ui.bossCategory.textContent = "THE FINAL BATTLE";
      ui.bossName.textContent = "The gate is secure";
      ui.bossTrait.textContent = "ALL 20 BOSS ENCOUNTERS DEFEATED";
      ui.bossWave.textContent = "WAVE 100";
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
    ui.bossProgress.style.width = `${bossActive ? 100 : (wave % 5) * 20}%`;
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
    const damage = Math.round(stats.damage * (1 + .42 * selectedTower.level));
    const range = stats.range + selectedTower.level * 10;
    const cost = Math.round(stats.cost * (.85 + selectedTower.level * .5));
    const refund = Math.floor(stats.cost * (.72 + selectedTower.level * .25));
    const summonStatus = selectedTower.type === "summoner"
      ? `<div class="tower-details"><span>💀 ${summonedSkeletons.filter((skeleton) => skeleton.towerId === selectedTower.id).length}/3 SKELETONS</span><span>♥ ${summonedSkeletons.filter((skeleton) => skeleton.towerId === selectedTower.id).reduce((total, skeleton) => total + skeleton.hp, 0)} TOTAL HP</span></div>`
      : "";
    ui.inspection.innerHTML = `
      <h2 style="color:${stats.color}">${stats.name} <span style="color:#95a09e">· LV ${selectedTower.level + 1}</span></h2>
      <p>${selectedTower.type === "summoner" ? "Raises skeleton defenders at the gate. Enemies stop to attack them; skeletons fight back until one side falls." : `Deals ${damage} damage · ${range} range · targets the furthest enemy in reach.`}</p>
      <div class="tower-details"><span>✦ ${damage} DMG</span><span>◎ ${range} RANGE</span></div>
      ${summonStatus}
      <div class="inspect-actions">${selectedTower.level < 2 ? `<button type="button" data-action="upgrade" ${gold < cost ? "disabled" : ""}>✦ UPGRADE · ◈ ${cost}</button>` : ""}<button class="sell-button" type="button" data-action="sell">SELL · ◈ ${refund}</button></div>`;
    const upgrade = ui.inspection.querySelector('[data-action="upgrade"]');
    const sell = ui.inspection.querySelector('[data-action="sell"]');
    if (upgrade) upgrade.addEventListener("click", upgradeTower);
    sell.addEventListener("click", sellTower);
  }

  function updateUI() {
    ui.lives.textContent = lives;
    ui.gold.textContent = gold;
    ui.wave.textContent = wave === 0 ? "PREPARE" : String(wave);
    ui.best.textContent = bestWave || "—";
    ui.count.textContent = `${placedTowers.length} BUILT`;
    ui.nextWave.textContent = wave >= 100 ? "—" : wave + 1;
    ui.message.textContent = message;
    ui.waveButton.disabled = state !== "build";
    ui.autoWaveButton.disabled = state === "intro" || state === "gameover" || state === "victory";
    ui.autoWaveButton.textContent = autoWave ? "AUTO: ON" : "AUTO: OFF";
    ui.autoWaveButton.classList.toggle("is-active", autoWave);
    ui.autoWaveButton.setAttribute("aria-pressed", String(autoWave));
    ui.speedButton.textContent = `▶ ${gameSpeed}×`;
    ui.speedButton.classList.toggle("is-active", gameSpeed === 2);
    ui.pauseButton.classList.toggle("is-active", state === "paused");
    ui.pauseButton.textContent = state === "paused" ? "▶" : "Ⅱ";
    ui.soundButton.classList.toggle("is-active", !soundEnabled);
    ui.soundButton.textContent = soundEnabled ? "♫" : "♪̸";
    ui.soundButton.setAttribute("aria-label", soundEnabled ? "Mute game sounds" : "Enable game sounds");
    ui.soundButton.title = soundEnabled ? "Mute game sounds" : "Enable game sounds";
    renderTowerList();
    renderInspection();
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
    glow(16, 145, "#fb8d76", 27, .5 + pulse * .2);
    ctx.fillStyle = "#ffe0ad";
    ctx.beginPath();
    ctx.arc(16, 145, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4a087";
    ctx.font = "800 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("BREACH", 16, 117);
  }

  function drawFireflies(now) {
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

    if (tower.type === "summoner") {
      const orbit = gameTime * 1.8 + tower.id;
      for (let mote = 0; mote < 3; mote++) {
        const phase = orbit + mote * Math.PI * 2 / 3;
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
      const sway = Math.sin(gameTime * 5 + tower.id) * 2;
      ctx.strokeStyle = "#8a78b2";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-8, 7); ctx.lineTo(-5, -9); ctx.lineTo(2, -15); ctx.lineTo(9, -8); ctx.lineTo(15, -16 + sway);
      ctx.stroke();
      ctx.strokeStyle = stats.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      glow(15, -16 + sway, stats.color, 22, .9);
      ctx.fillStyle = "#fff1ff";
      ctx.beginPath();
      ctx.arc(15, -16 + sway, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (tower.type === "frost") {
      ctx.rotate(angle + Math.PI / 2);
      glow(0, -3, stats.color, 24, .75 * pulse);
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
      ctx.lineWidth = isCannon ? 14 : 11;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-2, 4);
      ctx.lineTo(isCannon ? 23 : 25, 0);
      ctx.stroke();
      ctx.strokeStyle = stats.color;
      ctx.lineWidth = isCannon ? 6 : 3;
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
  }

  function drawEffects() {
    for (const effect of effects) {
      const progress = 1 - effect.life / effect.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - progress);
      if (effect.type === "lightning") {
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
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 2;
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

  function render(now) {
    ctx.drawImage(world, 0, 0);
    drawFireflies(now);
    drawGate();
    if (selectedTower) {
      const range = towers[selectedTower.type].range + selectedTower.level * 10;
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
      glow(shot.x, shot.y, shot.color, shot.type === "shell" ? 18 : 13, .95);
      ctx.fillStyle = "#fff4d6";
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.type === "shell" ? 4 : 2.7, 0, Math.PI * 2);
      ctx.fill();
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
    if (event.button !== 0 || state === "intro" || state === "paused" || state === "gameover") return;
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
  ui.soundButton.addEventListener("click", () => {
    initializeAudio();
    if (!audioContext) return;
    soundEnabled = !soundEnabled;
    if (soundEnabled) playSound("summoner");
    uiDirty = true;
  });
  ui.overlayButton.addEventListener("click", () => {
    if (state === "intro") state = "build";
    else if (state === "paused") state = pausedFrom;
    else if (state === "gameover" || state === "victory") resetGame();
    uiDirty = true;
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && selectedType) {
      selectedType = null;
      uiDirty = true;
    } else if (event.code === "Space" && state === "build") {
      event.preventDefault();
      startWave();
    } else if (event.key.toLowerCase() === "p") {
      pauseToggle();
    } else if ("12345".includes(event.key) && state !== "intro" && state !== "gameover") {
      selectTower(Object.keys(towers)[Number(event.key) - 1]);
    }
  });
  window.addEventListener("pointerdown", unlockAudio, { once: true, capture: true });
  window.addEventListener("keydown", unlockAudio, { once: true });

  drawStaticWorld();
  renderBossRoster();
  updateUI();
  requestAnimationFrame(frame);
})();
