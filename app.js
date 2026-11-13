// ORBITAL FORGE: NASA Space Mission Designer (Zero-Build GitHub Pages Edition)
// Combines Figma Make's clean student UI with NASA JPL CML & Goddard MDL coupled physics

const MISSIONS = [
  {
    id: 'wildfire',
    title: 'Mission 1: Wildfire & Coast Watch (Beginner)',
    badge: 'Earth CubeSat',
    targetScience: 180,
    budgetCap: 9.0,
    minLifetimeMonths: 18,
    requiredDomain: 'Earth',
    summary: 'Build a compact CubeSat to spot wildfires and coastal algae blooms from Low Earth Orbit.',
    nasaTwin: {
      name: 'NASA TROPICS & FireSense (6U CubeSat Class)',
      fact: 'Uses a shoebox-sized 6U satellite in polar Earth orbit to send rapid weather and fire alerts.'
    }
  },
  {
    id: 'lunar_ice',
    title: 'Mission 2: Moon South Pole Ice Scout (Intermediate)',
    badge: 'Lunar Explorer',
    targetScience: 250,
    budgetCap: 25.0,
    minLifetimeMonths: 12,
    requiredDomain: 'Moon',
    summary: 'Orbit the Moon’s dark polar craters to search for water ice for future Artemis astronauts.',
    nasaTwin: {
      name: 'NASA Lunar Flashlight & CAPSTONE',
      fact: 'Small cislunar spacecraft that use green propulsion and infrared lasers to hunt for lunar ice.'
    }
  },
  {
    id: 'exoplanet',
    title: 'Mission 3: Exoplanet Star-Flare Telescope (Advanced)',
    badge: 'Deep Space L2',
    targetScience: 320,
    budgetCap: 65.0,
    minLifetimeMonths: 36,
    requiredDomain: 'L2',
    summary: 'Fly 1.5 million km to Sun-Earth L2 to study distant exoplanets and stellar flares.',
    nasaTwin: {
      name: 'NASA Pandora SmallSat & TESS',
      fact: 'Uses ultra-steady star trackers in deep space to measure starlight passing through exoplanet atmospheres.'
    }
  }
];

const OBJECTIVES = [
  { id: 'fire_ir', name: 'Wildfire Heat & Smoke Tracking', domain: 'Earth', band: 'Infrared (IR)', baseScience: 110, tip: 'Detects heat hotspots through smoke day and night.' },
  { id: 'ocean_vis', name: 'Ocean Algae & Coastline Health', domain: 'Earth', band: 'Visible / Near-IR', baseScience: 95, tip: 'Maps water color changes and coastal ecosystems.' },
  { id: 'moon_ice', name: 'Lunar Crater Water-Ice Search', domain: 'Moon', band: 'SWIR Laser + Neutrons', baseScience: 160, tip: 'Probes permanently shadowed craters at the Lunar South Pole.' },
  { id: 'exo_transit', name: 'Exoplanet Atmosphere Transit Scan', domain: 'L2', band: 'Visible + UV Optics', baseScience: 195, tip: 'Measures tiny dips in starlight when an exoplanet crosses its star.' }
];

const INSTRUMENTS = [
  { id: 'ir_cam', name: 'Thermal Infrared Camera', compatibleWith: ['fire_ir'], massKg: 1.8, powerW: 11, costM: 1.4, dataGB: 1.2, sciencePts: 115, needsFinePointing: false, tip: 'Lightweight heat camera ideal for 6U wildfire CubeSats.' },
  { id: 'hyper_cam', name: 'Hyperspectral Ocean Imager', compatibleWith: ['ocean_vis', 'fire_ir'], massKg: 3.2, powerW: 18, costM: 2.3, dataGB: 3.4, sciencePts: 130, needsFinePointing: true, tip: 'High-detail 120-color camera; creates large daily data files.' },
  { id: 'laser_ice', name: '4-Laser Moon Ice Reflectometer', compatibleWith: ['moon_ice'], massKg: 4.5, powerW: 34, costM: 4.8, dataGB: 1.8, sciencePts: 175, needsFinePointing: true, tip: 'Shines infrared lasers into dark lunar craters to detect surface frost.' },
  { id: 'neutron_det', name: 'Lunar Neutron Detector', compatibleWith: ['moon_ice'], massKg: 2.4, powerW: 9, costM: 2.6, dataGB: 0.4, sciencePts: 115, needsFinePointing: false, tip: 'Low-power sensor that detects hydrogen buried below lunar dust.' },
  { id: 'exo_scope', name: '20cm Exoplanet Transit Telescope', compatibleWith: ['exo_transit'], massKg: 26.0, powerW: 48, costM: 14.5, dataGB: 4.5, sciencePts: 220, needsFinePointing: true, tip: 'Precision space telescope requiring steady pointing and deep-space orbit.' }
];

const BUSES = [
  { id: '3u', name: '3U Mini CubeSat (Shoebox)', maxMassKg: 5.5, dryMassKg: 1.6, basePowerW: 4, costM: 0.8, tip: 'Very affordable student-class satellite with a tight 5.5 kg weight limit.' },
  { id: '6u', name: '6U Standard CubeSat (Briefcase)', maxMassKg: 13.5, dryMassKg: 3.4, basePowerW: 8, costM: 1.6, tip: 'NASA’s most popular science CubeSat size (up to 13.5 kg).' },
  { id: '12u', name: '12U Deep-Space CubeSat', maxMassKg: 26.0, dryMassKg: 6.2, basePowerW: 14, costM: 3.2, tip: 'Extra room for lunar propulsion tanks and dual science instruments.' },
  { id: 'smallsat', name: '180 kg SmallSat Observatory', maxMassKg: 185.0, dryMassKg: 58.0, basePowerW: 38, costM: 12.0, tip: 'Heavy-duty spacecraft frame built for deep-space telescopes.' }
];

const POWER_SYSTEMS = [
  { id: 'body', name: 'Body Solar Cells + Small Battery', solarW: 18, batteryWh: 40, massKg: 0.7, costM: 0.35, wings: 0, tip: 'Simple panels glued to the body; low power during orbital night.' },
  { id: '2wing', name: '2 Deployable Solar Wings + 110 Wh Battery', solarW: 58, batteryWh: 110, massKg: 1.9, costM: 0.9, wings: 2, tip: 'Fold-out solar wings that power cameras and survive Earth’s shadow.' },
  { id: '4wing', name: '4 Articulated Solar Wings + 240 Wh Battery', solarW: 125, batteryWh: 240, massKg: 4.2, costM: 2.1, wings: 4, tip: 'High-power sun-tracking wings for lasers and lunar orbiters.' },
  { id: 'deep_array', name: '420 W Deep-Space Array + 850 Wh Battery', solarW: 420, batteryWh: 850, massKg: 16.5, costM: 5.4, wings: 4, tip: 'Large observatory power system for L2 space telescopes.' }
];

const ADCS_OPTIONS = [
  { id: 'basic', name: 'Basic Magnetic Pointing', finePointing: false, massKg: 0.6, powerW: 3, costM: 0.3, tip: 'Uses Earth’s magnetic field; good enough for wide-angle sensors.' },
  { id: 'wheels', name: 'Reaction Wheels + Star Tracker', finePointing: true, massKg: 1.8, powerW: 10, costM: 1.2, tip: 'Spinning flywheels hold the camera rock-steady on targets.' }
];

const ORBITS = [
  { id: 'leo_400', name: 'Low Earth Orbit (400 km — ISS Altitude)', domain: 'Earth', reqDeltaV: 40, eclipseFrac: 0.38, baseLifeMonths: 14, tip: 'Cheapest orbit to reach, but thin air slows the satellite down over time.' },
  { id: 'sso_550', name: 'Sun-Synchronous Polar Orbit (550 km)', domain: 'Earth', reqDeltaV: 90, eclipseFrac: 0.32, baseLifeMonths: 48, tip: 'Passes over every part of Earth at the same sunlight angle.' },
  { id: 'lunar_polar', name: 'Lunar Polar Orbit (100 km above Moon)', domain: 'Moon', reqDeltaV: 1150, eclipseFrac: 0.41, baseLifeMonths: 36, tip: 'Flies over both Moon poles every 2 hours; requires big braking thrusters.' },
  { id: 'l2', name: 'Sun-Earth L2 Deep Space (1.5M km)', domain: 'L2', reqDeltaV: 420, eclipseFrac: 0.02, baseLifeMonths: 72, tip: 'Constant sunlight and ultra-cold stable space far from Earth.' }
];

const PROPULSION = [
  { id: 'none', name: 'No Thrusters (Drift Orbit)', deltaV: 0, massKg: 0, powerW: 0, costM: 0, tip: 'Saves weight and money, but cannot change orbits or reach the Moon.' },
  { id: 'cold_gas', name: 'Micro Cold-Gas Thruster', deltaV: 85, massKg: 1.5, powerW: 4, costM: 0.55, tip: 'Safe, gentle thruster for small orbit tweaks in LEO.' },
  { id: 'green_mono', name: 'Green Monopropellant Rocket Engine', deltaV: 620, massKg: 4.4, powerW: 14, costM: 1.9, tip: 'High-thrust chemical engine for L2 station-keeping and orbit raising.' },
  { id: 'biprop', name: 'Lunar / Deep-Space Bipropellant Stage', deltaV: 2200, massKg: 14.5, powerW: 22, costM: 6.8, tip: 'Powerful rocket stage needed to brake into Lunar orbit or carry heavy telescopes.' }
];

const LAUNCHERS = [
  { id: 'iss', name: 'ISS Cargo Rideshare Deployer', maxLEO: 14, maxMoon: 0, maxL2: 0, costM: 0.6, tip: 'Launched aboard a space station resupply rocket; LEO only.' },
  { id: 'rideshare', name: 'Polar Rideshare Rocket Slot', maxLEO: 35, maxMoon: 0, maxL2: 0, costM: 1.4, tip: 'Shares a Falcon-class rocket to Sun-Synchronous Earth orbit.' },
  { id: 'small_lunar', name: 'Dedicated Small Rocket + Lunar Kick Stage', maxLEO: 220, maxMoon: 32, maxL2: 24, costM: 7.5, tip: 'Sends CubeSats all the way to the Moon or L2.' },
  { id: 'medium_lift', name: 'Medium-Lift Deep Space Rocket', maxLEO: 500, maxMoon: 210, maxL2: 195, costM: 16.5, tip: 'Carries full SmallSat observatories to Lunar or L2 orbits.' }
];

const COMMS = [
  { id: 'uhf', name: 'Basic UHF Radio (2 Ground Passes/Day)', band: 'UHF', capLEO: 0.4, capDeep: 0.0, massKg: 0.4, powerW: 6, costM: 0.3, hasDish: false, tip: 'Simple antenna; too slow for large camera images or Moon missions.' },
  { id: 'sband', name: 'S-Band Radio + NASA/CSA Polar Dishes', band: 'S-Band', capLEO: 3.0, capDeep: 0.15, massKg: 1.1, powerW: 14, costM: 1.2, hasDish: false, tip: 'Fast Earth downlink using high-latitude NASA and Canadian Space Agency stations.' },
  { id: 'xband', name: 'X-Band High-Gain Dish + Deep Space Network', band: 'X-Band', capLEO: 9.0, capDeep: 2.6, massKg: 2.8, powerW: 26, costM: 3.4, hasDish: true, tip: 'High-speed dish antenna required for Moon and L2 science data.' },
  { id: 'laser', name: 'Optical Laser Communications', band: 'Laser', capLEO: 24.0, capDeep: 6.5, massKg: 3.4, powerW: 32, costM: 5.2, hasDish: true, tip: 'Ultra-fast laser beam; requires Reaction Wheels + Star Tracker pointing.' }
];

const TEAM_ROLES = [
  { id: 0, title: 'Science Lead', step: 1, color: 'bg-purple-500' },
  { id: 1, title: 'Satellite Builder', step: 2, color: 'bg-sky-500' },
  { id: 2, title: 'Rocket & Orbit', step: 3, color: 'bg-amber-500' },
  { id: 3, title: 'Ground & Comms', step: 4, color: 'bg-emerald-500' }
];

const state = {
  missionId: 'wildfire',
  step: 1,
  teamMode: false,
  approvals: [false, false, false, false],
  viewMode: 'satellite',
  simPlaying: false,
  orbitProgress: 18,
  showHelp: false,
  showLaunchModal: false,
  objectiveId: 'fire_ir',
  instrumentIds: ['ir_cam'],
  busId: '6u',
  powerId: '2wing',
  adcsId: 'wheels',
  orbitId: 'sso_550',
  propId: 'cold_gas',
  launcherId: 'rideshare',
  commsId: 'sband',
  dutyCycle: 70
};

let simTimer = null;

function setSimPlaying(play) {
  state.simPlaying = play;
  if (simTimer) clearInterval(simTimer);
  if (play) {
    simTimer = setInterval(() => {
      state.orbitProgress = (state.orbitProgress + 1.4) % 100;
      const dot = document.getElementById('orbit-sat-group');
      const label = document.getElementById('orbit-phase-label');
      if (dot && label) {
        const angle = (state.orbitProgress / 100) * Math.PI * 2;
        const sx = 180 + Math.cos(angle) * 130;
        const sy = 100 + Math.sin(angle) * 64;
        const inShadow = sx > 185;
        dot.innerHTML = `${!inShadow ? `<line x1="${sx}" y1="${sy}" x2="180" y2="100" stroke="#10B981" stroke-width="2" opacity="0.55" />` : ''}<circle cx="${sx}" cy="${sy}" r="7" fill="${inShadow ? '#F59E0B' : '#10B981'}" stroke="#FFFFFF" stroke-width="2" />`;
        label.textContent = inShadow ? '🌙 Orbit Night (Using Battery)' : '☀️ Sunlight (Charging + Sending Data)';
      } else {
        render();
      }
    }, 50);
  }
  render();
}

function selectMission(id) {
  state.missionId = id;
  state.step = 1;
  state.approvals = [false, false, false, false];
  if (id === 'wildfire') {
    Object.assign(state, { objectiveId: 'fire_ir', instrumentIds: ['ir_cam'], busId: '6u', powerId: '2wing', adcsId: 'wheels', orbitId: 'sso_550', propId: 'cold_gas', launcherId: 'rideshare', commsId: 'sband', dutyCycle: 70 });
  } else if (id === 'lunar_ice') {
    Object.assign(state, { objectiveId: 'moon_ice', instrumentIds: ['laser_ice'], busId: '12u', powerId: '4wing', adcsId: 'wheels', orbitId: 'lunar_polar', propId: 'biprop', launcherId: 'small_lunar', commsId: 'xband', dutyCycle: 60 });
  } else {
    Object.assign(state, { objectiveId: 'exo_transit', instrumentIds: ['exo_scope'], busId: 'smallsat', powerId: 'deep_array', adcsId: 'wheels', orbitId: 'l2', propId: 'green_mono', launcherId: 'medium_lift', commsId: 'xband', dutyCycle: 80 });
  }
  render();
}

function computeAnalysis() {
  const mission = MISSIONS.find(m => m.id === state.missionId);
  const objective = OBJECTIVES.find(o => o.id === state.objectiveId);
  const instruments = INSTRUMENTS.filter(i => state.instrumentIds.includes(i.id));
  const bus = BUSES.find(b => b.id === state.busId);
  const power = POWER_SYSTEMS.find(p => p.id === state.powerId);
  const adcs = ADCS_OPTIONS.find(a => a.id === state.adcsId);
  const orbit = ORBITS.find(o => o.id === state.orbitId);
  const prop = PROPULSION.find(p => p.id === state.propId);
  const launcher = LAUNCHERS.find(l => l.id === state.launcherId);
  const comms = COMMS.find(c => c.id === state.commsId);

  const totalMass = +(bus.dryMassKg + instruments.reduce((s, i) => s + i.massKg, 0) + power.massKg + adcs.massKg + prop.massKg + comms.massKg).toFixed(1);
  const launcherLimit = orbit.domain === 'Moon' ? launcher.maxMoon : orbit.domain === 'L2' ? launcher.maxL2 : launcher.maxLEO;
  const massLimit = Math.min(bus.maxMassKg, launcherLimit);

  const avgSolarGen = +(power.solarW * (1 - orbit.eclipseFrac) * 0.85).toFixed(1);
  const duty = state.dutyCycle / 100;
  const avgPowerUsed = +(bus.basePowerW + instruments.reduce((s, i) => s + i.powerW * duty, 0) + adcs.powerW + comms.powerW * 0.35).toFixed(1);
  const powerReservePct = Math.round(((avgSolarGen - avgPowerUsed) / Math.max(1, avgPowerUsed)) * 100);
  const eclipseHours = orbit.domain === 'L2' ? 0.2 : orbit.eclipseFrac * 1.6;
  const batteryDrainPct = Math.round(((bus.basePowerW + adcs.powerW + 6) * eclipseHours / power.batteryWh) * 100);

  const massScale = Math.max(0.75, Math.min(1.15, bus.maxMassKg / Math.max(1, totalMass)));
  const availDeltaV = Math.round(prop.deltaV * massScale);
  const deltaVOk = availDeltaV >= orbit.reqDeltaV;

  const dataGenGB = +(instruments.reduce((s, i) => s + i.dataGB, 0) * duty).toFixed(2);
  const dataCapGB = orbit.domain === 'Earth' ? comms.capLEO : comms.capDeep;

  const needsFine = instruments.some(i => i.needsFinePointing) || comms.band === 'Laser';
  const pointingOk = !needsFine || adcs.finePointing;
  const compatInstruments = instruments.filter(i => i.compatibleWith.includes(objective.id));

  const extraMonths = deltaVOk ? Math.min(30, Math.round((availDeltaV - orbit.reqDeltaV) / 15)) : 0;
  const lifetimeMonths = orbit.baseLifeMonths + extraMonths;
  const totalCost = +(bus.costM + instruments.reduce((s, i) => s + i.costM, 0) + power.costM + adcs.costM + prop.costM + comms.costM + launcher.costM).toFixed(1);

  const downlinkRatio = dataGenGB > 0 ? Math.min(1, dataCapGB / dataGenGB) : 0;
  const rawSci = compatInstruments.reduce((s, i) => s + i.sciencePts, 0);
  const scienceScore = pointingOk ? Math.round((objective.baseScience * 0.4 + rawSci) * duty * (0.4 + 0.6 * downlinkRatio)) : Math.round(rawSci * 0.2);

  const issues = [];
  if (compatInstruments.length === 0) issues.push('Pick an instrument that matches your Science Goal wavelength.');
  if (orbit.domain !== mission.requiredDomain) issues.push(`This mission requires a ${mission.requiredDomain} orbit.`);
  if (launcherLimit === 0) issues.push(`${launcher.name} cannot reach ${orbit.domain}. Upgrade your rocket!`);
  else if (totalMass > massLimit) issues.push(`Too heavy (${totalMass} kg > ${massLimit} kg limit). Use a bigger bus or rocket.`);
  if (powerReservePct < 0) issues.push('Not enough solar power! Add bigger solar wings or lower camera on-time.');
  if (batteryDrainPct > 45) issues.push(`Battery drains ${batteryDrainPct}% in shadow (Safe limit: 45%). Upgrade battery!`);
  if (!deltaVOk) issues.push(`Need ${orbit.reqDeltaV} m/s thruster push to reach this orbit (you have ${availDeltaV} m/s).`);
  if (!pointingOk) issues.push('Your camera or laser needs Reaction Wheels + Star Tracker to stay steady.');
  if (totalCost > mission.budgetCap) issues.push(`Over budget ($${totalCost}M > $${mission.budgetCap}M cap). Pick leaner parts.`);
  if (state.teamMode && !state.approvals.every(Boolean)) issues.push('Team Mode: All 4 student leads must click Sign Off before launch.');

  const coachTip = issues[0] || (dataGenGB > dataCapGB
    ? `Tip: Your camera creates ${dataGenGB} GB/day, but your radio only sends ${dataCapGB} GB/day. Upgrade your radio or lower camera on-time!`
    : 'Awesome engineering! All spacecraft systems are balanced and ready for launch.');

  const passed = issues.length === 0 && scienceScore >= mission.targetScience;
  const stars = !passed ? 0 : (totalCost <= mission.budgetCap * 0.85 && dataGenGB <= dataCapGB ? 3 : 2);

  return { mission, objective, instruments, bus, power, adcs, orbit, prop, launcher, comms, totalMass, massLimit, powerReservePct, batteryDrainPct, availDeltaV, deltaVOk, dataGenGB, dataCapGB, pointingOk, lifetimeMonths, totalCost, scienceScore, issues, coachTip, passed, stars };
}

function render() {
  const a = computeAnalysis();
  const root = document.getElementById('app');

  const stepsMeta = [
    { num: 1, label: 'Step 1: Science Goal', done: a.instruments.some(i => i.compatibleWith.includes(state.objectiveId)) },
    { num: 2, label: 'Step 2: Build Satellite', done: a.powerReservePct >= 0 && a.pointingOk },
    { num: 3, label: 'Step 3: Rocket & Orbit', done: a.totalMass <= a.massLimit && a.deltaVOk },
    { num: 4, label: 'Step 4: Ground & Test', done: a.passed }
  ];

  const angle = (state.orbitProgress / 100) * Math.PI * 2;
  const sx = 180 + Math.cos(angle) * 130;
  const sy = 100 + Math.sin(angle) * 64;
  const inShadow = sx > 185;

  root.innerHTML = `
    <!-- TOP BAR -->
    <header class="bg-slate-900/95 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-sky-500/20">OF</div>
        <div>
          <h1 class="font-extrabold text-base tracking-tight text-white">ORBITAL FORGE</h1>
          <p class="text-xs text-sky-400 font-medium">NASA Space Mission Designer</p>
        </div>
        <select onchange="selectMission(this.value)" class="ml-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-sky-400">
          ${MISSIONS.map(m => `<option value="${m.id}" ${m.id === state.missionId ? 'selected' : ''}>${m.title}</option>`).join('')}
        </select>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <div class="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs font-semibold">
          <button onclick="state.teamMode=false;render()" class="px-3 py-1.5 rounded-lg transition ${!state.teamMode ? 'bg-sky-500 text-slate-950' : 'text-slate-300'}">Solo Mode</button>
          <button onclick="state.teamMode=true;render()" class="px-3 py-1.5 rounded-lg transition ${state.teamMode ? 'bg-purple-500 text-white' : 'text-slate-300'}">Team Mode (1–4)</button>
        </div>
        <button onclick="state.showHelp=true;render()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold">How to Play</button>
        <button onclick="state.showLaunchModal=true;render()" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition">Launch Mission 🚀</button>
      </div>
    </header>

    <!-- 4-STEP PROGRESS BAR -->
    <div class="bg-slate-900/60 border-b border-slate-800 px-5 py-3">
      <div class="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
        ${stepsMeta.map(s => `
          <button onclick="state.step=${s.num};render()" class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition ${
            state.step === s.num ? 'bg-sky-500/15 border-sky-400 text-white' : s.done ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
          }">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs ${s.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'}">${s.done ? '✓' : s.num}</span>
            <span>${s.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- MAIN 2-COLUMN WORKSPACE -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- LEFT COLUMN (7 cols) -->
      <section class="lg:col-span-7 flex flex-col gap-4">
        <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-xs font-bold uppercase tracking-wider text-sky-400">${a.mission.badge}</span>
            <span class="text-xs text-slate-400">Goal: <strong class="text-white">${a.mission.targetScience} Science Pts</strong> · Budget: <strong class="text-white">$${a.mission.budgetCap}M</strong></span>
          </div>
          <p class="text-sm text-slate-200">${a.mission.summary}</p>
        </div>

        ${state.teamMode ? `
          <div class="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-purple-300">Team Co-Op Sign-Off (All 4 Students Must Approve)</span>
              <span class="text-xs text-purple-200">${state.approvals.filter(Boolean).length} / 4 Ready</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${TEAM_ROLES.map((r, idx) => `
                <button onclick="state.step=${r.step};state.approvals[${idx}]=!state.approvals[${idx}];render()" class="p-2.5 rounded-xl border text-left transition ${state.approvals[idx] ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-slate-900/70 border-slate-700 text-slate-300'}">
                  <div class="flex items-center gap-1.5 mb-1"><span class="w-2.5 h-2.5 rounded-full ${r.color}"></span><span class="text-xs font-bold">${r.title}</span></div>
                  <span class="text-[11px] font-semibold text-emerald-300">${state.approvals[idx] ? '✓ Approved' : 'Click to Sign Off'}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${state.step === 1 ? `
          <div class="space-y-4">
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">1. Choose Your Science Mission Objective</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${OBJECTIVES.map(obj => `
                  <button onclick="state.objectiveId='${obj.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${obj.id === state.objectiveId ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="flex justify-between items-start gap-2">
                      <span class="font-bold text-sm text-white">${obj.name}</span>
                      <span class="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold">${obj.domain}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1.5">${obj.tip}</p>
                    <div class="mt-2 text-[11px] font-semibold text-slate-400">Sensor Band: ${obj.band}</div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">2. Pick Scientific Instruments (Select 1 or More)</h2>
              <div class="grid grid-cols-1 gap-3">
                ${INSTRUMENTS.map(inst => {
                  const sel = state.instrumentIds.includes(inst.id);
                  const matches = inst.compatibleWith.includes(state.objectiveId);
                  return `
                    <button onclick="toggleInst('${inst.id}')" class="p-4 rounded-2xl border text-left transition ${sel ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400' : !matches ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                      <div class="flex justify-between items-center gap-2">
                        <span class="font-bold text-sm text-white">${inst.name}</span>
                        <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold ${matches ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${matches ? '✓ Matches Goal' : 'Wrong Wavelength'}</span>
                      </div>
                      <p class="text-xs text-slate-300 mt-1">${inst.tip}</p>
                      <div class="flex flex-wrap gap-3 mt-2.5 text-xs font-semibold text-slate-200">
                        <span class="bg-slate-900/80 px-2.5 py-1 rounded-lg">⚖️ ${inst.massKg} kg</span>
                        <span class="bg-slate-900/80 px-2.5 py-1 rounded-lg">⚡ ${inst.powerW} W</span>
                        <span class="bg-slate-900/80 px-2.5 py-1 rounded-lg">💰 $${inst.costM}M</span>
                        <span class="bg-slate-900/80 px-2.5 py-1 rounded-lg">⭐ +${inst.sciencePts} Sci</span>
                      </div>
                    </button>`;
                }).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        ${state.step === 2 ? `
          <div class="space-y-4">
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">1. Satellite Frame (CubeSat or SmallSat)</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${BUSES.map(b => `
                  <button onclick="state.busId='${b.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${state.busId === b.id ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="font-bold text-sm text-white">${b.name}</div>
                    <p class="text-xs text-slate-300 mt-1">${b.tip}</p>
                    <div class="mt-2 text-xs font-semibold text-sky-300">Max: ${b.maxMassKg} kg · Cost: $${b.costM}M</div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">2. Solar Panels & Night Battery</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${POWER_SYSTEMS.map(p => `
                  <button onclick="state.powerId='${p.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${state.powerId === p.id ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="font-bold text-sm text-white">${p.name}</div>
                    <p class="text-xs text-slate-300 mt-1">${p.tip}</p>
                    <div class="mt-2 text-xs font-semibold text-amber-300">⚡ ${p.solarW} W · 🔋 ${p.batteryWh} Wh · $${p.costM}M</div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">3. Aiming & Stability System</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${ADCS_OPTIONS.map(ad => `
                  <button onclick="state.adcsId='${ad.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${state.adcsId === ad.id ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="font-bold text-sm text-white">${ad.name}</div>
                    <p class="text-xs text-slate-300 mt-1">${ad.tip}</p>
                    <div class="mt-2 text-xs font-semibold text-slate-300">⚖️ ${ad.massKg} kg · 💰 $${ad.costM}M</div>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        ${state.step === 3 ? `
          <div class="space-y-4">
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">1. Destination Orbit</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${ORBITS.map(o => `
                  <button onclick="state.orbitId='${o.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${state.orbitId === o.id ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="font-bold text-sm text-white">${o.name}</div>
                    <p class="text-xs text-slate-300 mt-1">${o.tip}</p>
                    <div class="mt-2 text-xs font-semibold text-sky-300">Push Needed: ${o.reqDeltaV} m/s</div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">2. Onboard Thrusters</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${PROPULSION.map(p => `
                  <button onclick="state.propId='${p.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${state.propId === p.id ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="font-bold text-sm text-white">${p.name}</div>
                    <p class="text-xs text-slate-300 mt-1">${p.tip}</p>
                    <div class="mt-2 text-xs font-semibold text-amber-300">Push: ${p.deltaV} m/s · ⚖️ ${p.massKg} kg · $${p.costM}M</div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">3. Launch Rocket</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${LAUNCHERS.map(l => `
                  <button onclick="state.launcherId='${l.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${state.launcherId === l.id ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="font-bold text-sm text-white">${l.name}</div>
                    <p class="text-xs text-slate-300 mt-1">${l.tip}</p>
                    <div class="mt-2 text-xs font-semibold text-emerald-300">LEO: ${l.maxLEO}kg · Moon: ${l.maxMoon}kg · $${l.costM}M</div>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        ${state.step === 4 ? `
          <div class="space-y-4">
            <div>
              <h2 class="text-sm font-bold text-slate-300 mb-2">1. Radio & Ground Dish Network</h2>
              <div class="grid grid-cols-1 gap-3">
                ${COMMS.map(c => `
                  <button onclick="state.commsId='${c.id}';state.approvals=[false,false,false,false];render()" class="p-4 rounded-2xl border text-left transition ${state.commsId === c.id ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700 hover:border-sky-400'}">
                    <div class="flex justify-between items-center">
                      <span class="font-bold text-sm text-white">${c.name}</span>
                      <span class="text-xs font-bold text-sky-300">${c.band}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1">${c.tip}</p>
                    <div class="mt-2 text-xs font-semibold text-slate-200">Earth Speed: ${c.capLEO} GB/day · Deep Space: ${c.capDeep} GB/day · 💰 $${c.costM}M</div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-sm text-white">2. Camera On-Time per Orbit (${state.dutyCycle}%)</span>
                <span class="text-xs text-sky-300 font-semibold">Creates ${a.dataGenGB} GB/day · Radio Sends ${a.dataCapGB} GB/day</span>
              </div>
              <input type="range" min="25" max="100" step="5" value="${state.dutyCycle}" oninput="state.dutyCycle=Number(this.value);state.approvals=[false,false,false,false];render()" class="w-full accent-sky-400 cursor-pointer" />
              <p class="text-xs text-slate-400 mt-1">Lowering camera on-time saves battery power and prevents photo storage overflow.</p>
            </div>
          </div>
        ` : ''}

        <div class="flex justify-between pt-2">
          <button ${state.step === 1 ? 'disabled' : ''} onclick="state.step=Math.max(1,state.step-1);render()" class="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-xs font-bold">← Previous Step</button>
          ${state.step < 4
            ? `<button onclick="state.step=Math.min(4,state.step+1);render()" class="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold">Next Step →</button>`
            : `<button onclick="state.showLaunchModal=true;render()" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold">Finish & Launch 🚀</button>`}
        </div>
      </section>

      <!-- RIGHT COLUMN (5 cols) -->
      <aside class="lg:col-span-5 flex flex-col gap-4">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div class="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <div class="flex gap-1.5">
              <button onclick="state.viewMode='satellite';render()" class="px-3 py-1 rounded-lg text-xs font-bold ${state.viewMode === 'satellite' ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-300'}">🛰️ Satellite View</button>
              <button onclick="state.viewMode='orbit';setSimPlaying(true)" class="px-3 py-1 rounded-lg text-xs font-bold ${state.viewMode === 'orbit' ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-300'}">🌍 Orbit View</button>
            </div>
            <button onclick="state.viewMode='orbit';setSimPlaying(!state.simPlaying)" class="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold">
              ${state.simPlaying ? '⏸ Pause' : '▶ Test Orbit'}
            </button>
          </div>

          <div class="h-64 bg-gradient-to-b from-[#081021] to-[#0F172A] relative flex items-center justify-center p-4">
            ${state.viewMode === 'satellite' ? `
              <svg viewBox="0 0 360 200" class="w-full h-full max-h-56">
                <circle cx="40" cy="30" r="1.5" fill="#94A3B8" />
                <circle cx="310" cy="45" r="2" fill="#38BDF8" />
                <circle cx="280" cy="165" r="1.5" fill="#94A3B8" />
                <circle cx="70" cy="155" r="1.5" fill="#94A3B8" />
                ${a.power.wings >= 2 ? `
                  <rect x="35" y="78" width="95" height="44" rx="4" fill="#1D4ED8" stroke="#60A5FA" stroke-width="2" />
                  <line x1="65" y1="78" x2="65" y2="122" stroke="#93C5FD" stroke-width="1" />
                  <line x1="95" y1="78" x2="95" y2="122" stroke="#93C5FD" stroke-width="1" />
                  <rect x="230" y="78" width="95" height="44" rx="4" fill="#1D4ED8" stroke="#60A5FA" stroke-width="2" />
                  <line x1="260" y1="78" x2="260" y2="122" stroke="#93C5FD" stroke-width="1" />
                  <line x1="290" y1="78" x2="290" y2="122" stroke="#93C5FD" stroke-width="1" />
                ` : ''}
                ${a.power.wings === 4 ? `
                  <g opacity="0.85">
                    <rect x="55" y="42" width="75" height="28" rx="4" fill="#2563EB" stroke="#38BDF8" stroke-width="1.5" />
                    <rect x="230" y="42" width="75" height="28" rx="4" fill="#2563EB" stroke="#38BDF8" stroke-width="1.5" />
                  </g>
                ` : ''}
                <rect x="${state.busId === 'smallsat' ? 132 : 145}" y="${state.busId === '3u' ? 68 : 56}" width="${state.busId === 'smallsat' ? 96 : 70}" height="${state.busId === '3u' ? 64 : 88}" rx="8" fill="${state.busId === 'smallsat' ? '#D97706' : '#CBD5E1'}" stroke="#38BDF8" stroke-width="2.5" />
                <circle cx="180" cy="95" r="16" fill="#1E293B" stroke="#A78BFA" stroke-width="3" />
                <circle cx="180" cy="95" r="7" fill="#38BDF8" />
                ${a.comms.hasDish
                  ? `<path d="M 155 56 Q 180 30 205 56" fill="none" stroke="#10B981" stroke-width="4" />`
                  : `<line x1="180" y1="56" x2="180" y2="28" stroke="#10B981" stroke-width="3" />`}
                ${state.propId !== 'none'
                  ? `<polygon points="168,144 192,144 198,162 162,162" fill="#475569" stroke="#F59E0B" stroke-width="1.5" />`
                  : ''}
              </svg>
            ` : `
              <svg viewBox="0 0 360 200" class="w-full h-full max-h-56">
                <ellipse cx="180" cy="100" rx="130" ry="64" fill="none" stroke="#38BDF8" stroke-dasharray="4 4" stroke-width="2" />
                <rect x="180" y="36" width="140" height="128" fill="#020617" opacity="0.55" />
                <circle cx="180" cy="100" r="${state.orbitId === 'l2' ? 18 : 34}" fill="${state.orbitId === 'lunar_polar' ? '#94A3B8' : state.orbitId === 'l2' ? '#F59E0B' : '#0284C7'}" />
                <g id="orbit-sat-group">
                  ${!inShadow ? `<line x1="${sx}" y1="${sy}" x2="180" y2="100" stroke="#10B981" stroke-width="2" opacity="0.55" />` : ''}
                  <circle cx="${sx}" cy="${sy}" r="7" fill="${inShadow ? '#F59E0B' : '#10B981'}" stroke="#FFFFFF" stroke-width="2" />
                </g>
                <text id="orbit-phase-label" x="14" y="22" fill="#94A3B8" font-size="11" font-weight="bold">
                  ${inShadow ? '🌙 Orbit Night (Using Battery)' : '☀️ Sunlight (Charging + Sending Data)'}
                </text>
              </svg>
            `}
          </div>
        </div>

        <!-- 4 SIMPLE RESOURCE METERS -->
        <div class="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3.5">
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>⚖️ Weight</span>
              <span class="${a.totalMass > a.massLimit ? 'text-rose-400' : 'text-emerald-400'}">${a.totalMass} / ${a.massLimit} kg — ${a.totalMass > a.massLimit ? 'Too Heavy!' : 'Good!'}</span>
            </div>
            <div class="h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div class="h-full transition-all ${a.totalMass > a.massLimit ? 'bg-rose-500' : 'bg-emerald-500'}" style="width:${Math.min(100, (a.totalMass / Math.max(1, a.massLimit)) * 100)}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>⚡ Battery & Solar Power</span>
              <span class="${a.powerReservePct < 0 || a.batteryDrainPct > 45 ? 'text-rose-400' : 'text-emerald-400'}">${a.powerReservePct >= 0 ? `+${a.powerReservePct}% Extra` : 'Low Power!'} · Night Drain ${a.batteryDrainPct}%</span>
            </div>
            <div class="h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div class="h-full transition-all ${a.powerReservePct < 0 || a.batteryDrainPct > 45 ? 'bg-rose-500' : 'bg-sky-400'}" style="width:${Math.min(100, Math.max(10, 50 + a.powerReservePct))}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>💰 Mission Budget</span>
              <span class="${a.totalCost > a.mission.budgetCap ? 'text-rose-400' : 'text-emerald-400'}">$${a.totalCost}M / $${a.mission.budgetCap}M — ${a.totalCost > a.mission.budgetCap ? 'Over Budget!' : 'On Budget'}</span>
            </div>
            <div class="h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div class="h-full transition-all ${a.totalCost > a.mission.budgetCap ? 'bg-rose-500' : 'bg-emerald-500'}" style="width:${Math.min(100, (a.totalCost / a.mission.budgetCap) * 100)}%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>📡 Science & Data Return</span>
              <span class="${a.scienceScore >= a.mission.targetScience ? 'text-emerald-400' : 'text-amber-300'}">${a.scienceScore} / ${a.mission.targetScience} pts · ${a.lifetimeMonths} mo life</span>
            </div>
            <div class="h-2.5 bg-slate-900 rounded-full overflow-hidden">
              <div class="h-full bg-purple-400 transition-all" style="width:${Math.min(100, (a.scienceScore / a.mission.targetScience) * 100)}%"></div>
            </div>
          </div>
        </div>

        <!-- FRIENDLY COACH TIP -->
        <div class="p-4 rounded-2xl border text-xs leading-relaxed ${a.issues.length > 0 ? 'bg-amber-500/10 border-amber-400/50 text-amber-100' : 'bg-emerald-500/10 border-emerald-400/50 text-emerald-100'}">
          <strong class="block text-sm mb-1">${a.issues.length > 0 ? '💡 Mission Coach Tip' : '✅ Ready for Launch!'}</strong>
          ${a.coachTip}
        </div>
      </aside>
    </main>

    ${state.showHelp ? `
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
          <h2 class="text-lg font-extrabold text-white">How to Design a NASA Space Mission</h2>
          <p class="text-sm text-slate-300 leading-relaxed">
            Every decision on a real spacecraft affects everything else! Adding a powerful camera increases science points,
            but also adds <strong>weight</strong>, drains <strong>battery power</strong> during orbital night, and requires a faster <strong>radio dish</strong>.
          </p>
          <ul class="text-xs text-slate-300 space-y-2 list-disc pl-5">
            <li><strong>Step 1–4:</strong> Pick your science goal, build your satellite, choose a rocket & orbit, and set up your ground radio.</li>
            <li><strong>Team Mode (1–4 Students):</strong> Assign each student a role and negotiate trade-offs before signing off!</li>
            <li><strong>Goal:</strong> Turn all 4 resource meters green and hit your Science Target within budget.</li>
          </ul>
          <button onclick="state.showHelp=false;render()" class="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-sm">Got It — Back to Mission Control</button>
        </div>
      </div>
    ` : ''}

    ${state.showLaunchModal ? `
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4">
          <div class="text-center">
            <div class="text-3xl mb-2">${a.stars === 3 ? '⭐⭐⭐' : a.stars === 2 ? '⭐⭐☆' : '⚠️'}</div>
            <h2 class="text-xl font-extrabold text-white">${a.passed ? 'Mission Launch Successful!' : 'Launch Hold — Fix Engineering Issues'}</h2>
            <p class="text-xs text-slate-400 mt-1">Science: ${a.scienceScore}/${a.mission.targetScience} pts · Cost: $${a.totalCost}M · Weight: ${a.totalMass} kg</p>
          </div>
          ${a.issues.length > 0 ? `
            <div class="bg-rose-500/10 border border-rose-500/40 rounded-xl p-3.5 space-y-1.5">
              <div class="text-xs font-bold text-rose-300">What Needs Adjustment:</div>
              ${a.issues.map(iss => `<div class="text-xs text-rose-100">• ${iss}</div>`).join('')}
            </div>
          ` : ''}
          <div class="bg-purple-500/10 border border-purple-400/40 rounded-xl p-4">
            <div class="text-xs font-bold text-purple-300 uppercase">🛰️ Real NASA Mission Comparison</div>
            <div class="font-bold text-sm text-white mt-1">${a.mission.nasaTwin.name}</div>
            <p class="text-xs text-slate-300 mt-1">${a.mission.nasaTwin.fact}</p>
          </div>
          <button onclick="state.showLaunchModal=false;render()" class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm">
            ${a.passed ? 'Experiment With Another Design' : 'Improve Satellite Design'}
          </button>
        </div>
      </div>
    ` : ''}
  `;
}

function toggleInst(id) {
  state.approvals = [false, false, false, false];
  if (state.instrumentIds.includes(id)) {
    if (state.instrumentIds.length > 1) {
      state.instrumentIds = state.instrumentIds.filter(x => x !== id);
    }
  } else {
    state.instrumentIds = [...state.instrumentIds, id];
  }
  render();
}

render();
