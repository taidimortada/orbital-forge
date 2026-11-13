// ORBITAL FORGE: CML 1-4 — Main Interactive Application & 1-4 Player Co-Op Engine
import {
  MISSIONS, OBJECTIVES, INSTRUMENTS, BUS_OPTIONS, POWER_OPTIONS,
  PROPULSION_OPTIONS, ADCS_THERMAL_OPTIONS, ORBITS, LAUNCH_VEHICLES, COMMS_GROUND_OPTIONS
} from './nasaData.js';
import { evaluateMissionDesign } from './physicsEngine.js';
import { MissionViewport3D } from './scene3d.js';

const TEAM_SEATS = [
  { id: 0, role: "Seat 1: Principal Investigator", focus: "Science Objectives, Instruments & Budget", seg: "science" },
  { id: 1, role: "Seat 2: Spacecraft Bus Lead", focus: "Chassis, Solar/Battery & ADCS/Thermal", seg: "spacecraft" },
  { id: 2, role: "Seat 3: Flight Dynamics & Launch", focus: "Orbit Selection, Δv & Launch Vehicle", seg: "orbit" },
  { id: 3, role: "Seat 4: Ground & Comms Ops", focus: "Radio Band, Ground Network & Duty Cycle", seg: "ground" }
];

const state = {
  missionId: "fire_cubesat",
  activeCml: 1, // 1..4
  activeSegment: "science", // science | spacecraft | orbit | ground
  teamMode: false,
  activeSeat: 0,
  signedSeats: [false, false, false, false],
  activeAnomaly: "none",

  // Spacecraft & Mission Selections
  objectiveId: "wildfire_ir",
  instrumentIds: ["mwir_microbolometer"],
  busId: "cubesat_6u",
  powerId: "deploy_2wing",
  propId: "cold_gas",
  adcsId: "wheel_adcs",
  orbitId: "sso_550",
  launcherId: "rideshare_sso",
  commsId: "sband_nsn",
  dutyCycle: 0.65
};

let viewport3d = null;

function init() {
  populateMissionSelector();
  viewport3d = new MissionViewport3D(document.getElementById("three-canvas"));
  viewport3d.onTimeTick = (t) => {
    document.getElementById("sim-scrubber").value = Math.round(t);
    updateSimTelemetryReadout(t);
  };
  bindGlobalEvents();
  renderAll();
}

function populateMissionSelector() {
  const sel = document.getElementById("mission-select");
  sel.innerHTML = MISSIONS.map(m => `<option value="${m.id}">${m.title}</option>`).join("");
  sel.value = state.missionId;
}

function loadMissionDefaults(missionId) {
  state.missionId = missionId;
  state.signedSeats = [false, false, false, false];
  state.activeCml = 1;
  if (missionId === "fire_cubesat") {
    Object.assign(state, {
      objectiveId: "wildfire_ir", instrumentIds: ["mwir_microbolometer"],
      busId: "cubesat_6u", powerId: "deploy_2wing", propId: "cold_gas",
      adcsId: "wheel_adcs", orbitId: "sso_550", launcherId: "rideshare_sso",
      commsId: "sband_nsn", dutyCycle: 0.65
    });
  } else if (missionId === "lunar_ice") {
    Object.assign(state, {
      objectiveId: "lunar_water_ice", instrumentIds: ["swir_laser_reflectometer"],
      busId: "cubesat_12u", powerId: "deploy_4wing", propId: "green_monoprop",
      adcsId: "wheel_adcs", orbitId: "lunar_polar", launcherId: "electron_lunar",
      commsId: "xband_dish", dutyCycle: 0.55
    });
  } else if (missionId === "exoplanet_l2") {
    Object.assign(state, {
      objectiveId: "exoplanet_transit", instrumentIds: ["precision_photometer"],
      busId: "smallsat_180", powerId: "smallsat_array", propId: "biprop_deep",
      adcsId: "star_cryo", orbitId: "sun_earth_l2", launcherId: "falcon_dedicated",
      commsId: "xband_dish", dutyCycle: 0.80
    });
  }
}

function bindGlobalEvents() {
  document.getElementById("mission-select").addEventListener("change", (e) => {
    loadMissionDefaults(e.target.value);
    renderAll();
  });

  document.getElementById("mode-select").addEventListener("change", (e) => {
    state.teamMode = e.target.value === "team";
    state.signedSeats = [false, false, false, false];
    renderAll();
  });

  document.getElementById("anomaly-select").addEventListener("change", (e) => {
    state.activeAnomaly = e.target.value;
    renderAll();
  });

  document.querySelectorAll(".cml-step").forEach(btn => {
    btn.addEventListener("click", () => {
      const cml = Number(btn.dataset.cml);
      state.activeCml = cml;
      if (cml === 1) state.activeSegment = "science";
      if (cml === 2) state.activeSegment = "orbit";
      if (cml === 3) state.activeSegment = "spacecraft";
      if (cml === 4) state.activeSegment = "ground";
      renderAll();
    });
  });

  document.querySelectorAll(".seg-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      state.activeSegment = tab.dataset.seg;
      renderAll();
    });
  });

  document.getElementById("btn-view-cad").addEventListener("click", () => {
    viewport3d.setMode("cad");
    document.getElementById("viewport-label").textContent = "3D SPACECRAFT CAD INSPECTOR (DRAG TO ROTATE)";
  });

  document.getElementById("btn-view-orbit").addEventListener("click", () => {
    viewport3d.setMode("orbit");
    viewport3d.playing = true;
    document.getElementById("btn-sim-play").textContent = "⏸ Pause Sim";
    document.getElementById("viewport-label").textContent = "3D MISSION VIZ ORBITAL CONOPS SIMULATOR";
  });

  document.getElementById("btn-sim-play").addEventListener("click", () => {
    viewport3d.setMode("orbit");
    viewport3d.playing = !viewport3d.playing;
    document.getElementById("btn-sim-play").textContent = viewport3d.playing ? "⏸ Pause Sim" : "▶ Run 3D Sim";
  });

  document.getElementById("sim-scrubber").addEventListener("input", (e) => {
    viewport3d.setMode("orbit");
    viewport3d.playing = false;
    document.getElementById("btn-sim-play").textContent = "▶ Run 3D Sim";
    const t = Number(e.target.value);
    viewport3d.simTime = t;
    updateSimTelemetryReadout(t);
  });

  document.getElementById("btn-debrief").addEventListener("click", () => openDebriefModal());
  document.getElementById("btn-guide").addEventListener("click", () => {
    document.getElementById("guide-modal").classList.remove("hidden");
  });
  document.getElementById("btn-export").addEventListener("click", () => exportMissionShareCode());

  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-backdrop").classList.add("hidden");
    });
  });
}

function renderAll() {
  const res = evaluateMissionDesign(state);
  renderTopResources(res);
  renderCmlStepper(res);
  renderSegmentEditor(res);
  renderAdvisorPanel(res);
  viewport3d.updateFromDesign(res);
  updateSimTelemetryReadout(viewport3d.simTime, res);
  drawTelemetryWaveform(res);
}

function renderTopResources(res) {
  const strip = document.getElementById("resource-strip");
  const cards = [
    {
      label: "1. Wet Mass",
      val: `${res.wetMass} / ${res.effectiveMassLimit} kg`,
      pct: Math.min(100, (res.wetMass / Math.max(1, res.effectiveMassLimit)) * 100),
      status: res.wetMass > res.effectiveMassLimit ? "critical" : res.wetMass > res.effectiveMassLimit * 0.9 ? "caution" : "nominal"
    },
    {
      label: "2. Orbit Power",
      val: `${res.avgSolarGenW}W / ${res.avgLoadW}W (${res.powerMarginPct}%)`,
      pct: Math.min(100, Math.max(5, 50 + res.powerMarginPct)),
      status: res.powerMarginPct < 0 ? "critical" : res.powerMarginPct < 10 ? "caution" : "nominal"
    },
    {
      label: "3. Mission Budget",
      val: `$${res.totalCost}M / $${res.mission.budgetCap}M`,
      pct: Math.min(100, (res.totalCost / res.mission.budgetCap) * 100),
      status: res.totalCost > res.mission.budgetCap && res.mission.id !== "sandbox" ? "critical" : res.totalCost > res.mission.budgetCap * 0.9 ? "caution" : "nominal"
    },
    {
      label: "4. Propulsion Δv",
      val: `${res.availableDeltaV} / ${res.requiredDeltaV} m/s`,
      pct: Math.min(100, res.requiredDeltaV > 0 ? (res.availableDeltaV / res.requiredDeltaV) * 80 : 100),
      status: res.deltaVMargin < 0 ? "critical" : res.deltaVMargin < 50 ? "caution" : "nominal"
    },
    {
      label: "5. Data Downlink",
      val: `${res.effectiveDownlinkGB} / ${res.rawDataGB} GB/d`,
      pct: res.rawDataGB > 0 ? Math.min(100, (res.downlinkCapGB / res.rawDataGB) * 100) : 100,
      status: res.dataOverflowGB > 0.05 ? "caution" : "nominal"
    },
    {
      label: "6. Science & Life",
      val: `${res.achievedScience}/${res.mission.targetScience} sci · ${res.estLifetimeMonths}m`,
      pct: Math.min(100, (res.achievedScience / res.mission.targetScience) * 100),
      status: res.achievedScience < res.mission.targetScience ? "caution" : "nominal"
    }
  ];

  strip.innerHTML = cards.map(c => {
    const barColor = c.status === "critical" ? "var(--crimson)" : c.status === "caution" ? "var(--amber)" : "var(--emerald)";
    return `
      <div class="res-card ${c.status}">
        <div class="res-head"><span>${c.label}</span></div>
        <div class="res-val">${c.val}</div>
        <div class="res-bar-bg"><div class="res-bar-fill" style="width:${c.pct}%;background:${barColor}"></div></div>
      </div>`;
  }).join("");
}

function renderCmlStepper(res) {
  document.querySelectorAll(".cml-step").forEach(btn => {
    const idx = Number(btn.dataset.cml) - 1;
    btn.classList.toggle("active", state.activeCml === idx + 1);
    btn.classList.toggle("passed", res.cmlGates[idx]);
  });
  const readyCount = res.cmlGates.filter(Boolean).length;
  document.getElementById("cml-status-text").textContent =
    readyCount === 4 ? "CML 4 POINT DESIGN CLOSED — READY FOR MISSION SIMULATION" : `MATURITY GATES PASSED: ${readyCount} / 4`;
}

function renderSegmentEditor(res) {
  document.querySelectorAll(".seg-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.seg === state.activeSegment);
  });

  const body = document.getElementById("segment-editor-body");
  let html = "";

  // Team Mode Seat Banner
  if (state.teamMode) {
    const seatIdx = ["science", "spacecraft", "orbit", "ground"].indexOf(state.activeSegment);
    const seat = TEAM_SEATS[seatIdx];
    const isSigned = state.signedSeats[seatIdx];
    html += `
      <div class="seat-banner">
        <div>
          <strong>${seat.role}</strong><br/>
          <span style="color:var(--text-muted)">${seat.focus}</span>
        </div>
        <button class="btn ${isSigned ? 'btn-success' : 'btn-amber'}" id="btn-seat-sign">
          ${isSigned ? "✓ Signed Off" : "Sign Off Gate"}
        </button>
      </div>`;
  }

  if (state.activeSegment === "science") {
    html += `<div class="section-label"><span>Mission Brief (${res.mission.difficulty})</span></div>
      <p style="font-size:0.79rem;color:#CBD5E1;margin-bottom:0.75rem;line-height:1.45">${res.mission.brief}</p>
      <div class="section-label"><span>1. Primary Science Objective (CML 1)</span></div>
      <div class="option-grid">
        ${OBJECTIVES.map(o => `
          <div class="opt-card ${state.objectiveId === o.id ? 'selected' : ''}" data-pick="objective" data-id="${o.id}">
            <div class="opt-top">
              <span class="opt-name">${o.name}</span>
              <span class="opt-tag">${o.domain} · +${o.scienceBase} Sci</span>
            </div>
            <div class="opt-desc">${o.desc}</div>
            <div class="opt-specs"><span>Band: ${o.wavelength}</span></div>
          </div>`).join("")}
      </div>
      <div class="section-label"><span>2. Scientific Payload Instruments (Multi-Select)</span></div>
      <div class="option-grid">
        ${INSTRUMENTS.map(inst => {
          const selected = state.instrumentIds.includes(inst.id);
          const compat = inst.compatibleObjectives.includes(state.objectiveId);
          return `
            <div class="opt-card ${selected ? 'selected' : ''} ${!compat ? 'incompatible' : ''}" data-pick="instrument" data-id="${inst.id}">
              <div class="opt-top">
                <span class="opt-name">${inst.name}</span>
                <span class="opt-tag ${!compat ? 'warn' : ''}">${compat ? 'Compatible' : 'Band Mismatch'}</span>
              </div>
              <div class="opt-desc">${inst.desc}</div>
              <div class="opt-specs">
                <span>${inst.mass} kg</span><span>${inst.power} W</span><span>$${inst.cost}M</span>
                <span>${inst.dataGBPerDay} GB/d</span><span>+${inst.scienceValue} Sci</span>
              </div>
            </div>`;
        }).join("")}
      </div>`;
  } else if (state.activeSegment === "spacecraft") {
    html += `
      <div class="section-label"><span>Spacecraft Bus Chassis (CubeSat 101 / SmallSat)</span></div>
      <div class="option-grid">
        ${BUS_OPTIONS.map(b => `
          <div class="opt-card ${state.busId === b.id ? 'selected' : ''}" data-pick="bus" data-id="${b.id}">
            <div class="opt-top"><span class="opt-name">${b.name}</span><span class="opt-tag">Max ${b.maxTotalMass} kg</span></div>
            <div class="opt-desc">${b.desc}</div>
            <div class="opt-specs"><span>Dry: ${b.dryMass} kg</span><span>Base: ${b.basePower} W</span><span>$${b.cost}M</span></div>
          </div>`).join("")}
      </div>
      <div class="section-label"><span>Electrical Power System (Solar + Battery)</span></div>
      <div class="option-grid">
        ${POWER_OPTIONS.map(p => `
          <div class="opt-card ${state.powerId === p.id ? 'selected' : ''}" data-pick="power" data-id="${p.id}">
            <div class="opt-top"><span class="opt-name">${p.name}</span><span class="opt-tag">${p.solarW} W / ${p.batteryWh} Wh</span></div>
            <div class="opt-desc">${p.desc}</div>
            <div class="opt-specs"><span>${p.mass} kg</span><span>$${p.cost}M</span></div>
          </div>`).join("")}
      </div>
      <div class="section-label"><span>ADCS Pointing & Thermal Control</span></div>
      <div class="option-grid">
        ${ADCS_THERMAL_OPTIONS.map(a => `
          <div class="opt-card ${state.adcsId === a.id ? 'selected' : ''}" data-pick="adcs" data-id="${a.id}">
            <div class="opt-top"><span class="opt-name">${a.name}</span><span class="opt-tag">${a.pointing.toUpperCase()}</span></div>
            <div class="opt-desc">${a.desc}</div>
            <div class="opt-specs"><span>${a.mass} kg</span><span>${a.power} W</span><span>Cool: ${a.coolingCap} W</span><span>$${a.cost}M</span></div>
          </div>`).join("")}
      </div>`;
  } else if (state.activeSegment === "orbit") {
    html += `
      <div class="section-label"><span>Target Orbital Regime (GMAT Trajectory Profiles)</span></div>
      <div class="option-grid">
        ${ORBITS.map(o => `
          <div class="opt-card ${state.orbitId === o.id ? 'selected' : ''}" data-pick="orbit" data-id="${o.id}">
            <div class="opt-top"><span class="opt-name">${o.name}</span><span class="opt-tag">Req Δv: ${o.reqDeltaV} m/s</span></div>
            <div class="opt-desc">${o.desc}</div>
            <div class="opt-specs"><span>Eclipse: ${Math.round(o.eclipseFrac * 100)}%</span><span>Base Life: ${o.dragLifetimeMonths} mo</span></div>
          </div>`).join("")}
      </div>
      <div class="section-label"><span>Spacecraft Propulsion Subsystem</span></div>
      <div class="option-grid">
        ${PROPULSION_OPTIONS.map(p => `
          <div class="opt-card ${state.propId === p.id ? 'selected' : ''}" data-pick="prop" data-id="${p.id}">
            <div class="opt-top"><span class="opt-name">${p.name}</span><span class="opt-tag">~${p.deltaV} m/s Δv</span></div>
            <div class="opt-desc">${p.desc}</div>
            <div class="opt-specs"><span>Dry+Prop: ${(p.dryMass + p.propMass).toFixed(1)} kg</span><span>${p.power} W</span><span>$${p.cost}M</span></div>
          </div>`).join("")}
      </div>
      <div class="section-label"><span>Launch Vehicle & Deployment Segment</span></div>
      <div class="option-grid">
        ${LAUNCH_VEHICLES.map(l => `
          <div class="opt-card ${state.launcherId === l.id ? 'selected' : ''}" data-pick="launcher" data-id="${l.id}">
            <div class="opt-top"><span class="opt-name">${l.name}</span><span class="opt-tag">$${l.cost}M</span></div>
            <div class="opt-desc">${l.desc}</div>
            <div class="opt-specs"><span>LEO: ${l.maxMassLEO} kg</span><span>Lunar: ${l.maxMassLunar} kg</span><span>L2: ${l.maxMassL2} kg</span></div>
          </div>`).join("")}
      </div>`;
  } else if (state.activeSegment === "ground") {
    html += `
      <div class="section-label"><span>Comms Transponder & Ground Station Network</span></div>
      <div class="option-grid">
        ${COMMS_GROUND_OPTIONS.map(c => `
          <div class="opt-card ${state.commsId === c.id ? 'selected' : ''}" data-pick="comms" data-id="${c.id}">
            <div class="opt-top"><span class="opt-name">${c.name}</span><span class="opt-tag">${c.band}</span></div>
            <div class="opt-desc">${c.desc}</div>
            <div class="opt-specs"><span>LEO: ${c.downlinkGBPerDayLEO} GB/d</span><span>Deep: ${c.downlinkGBPerDayDeep} GB/d</span><span>$${c.cost}M</span></div>
          </div>`).join("")}
      </div>
      <div class="section-label"><span>Payload Observation Duty Cycle (${Math.round(state.dutyCycle * 100)}%)</span></div>
      <div class="opt-card">
        <p class="opt-desc">Controls what fraction of each orbit the instruments actively collect data. Lowering duty cycle saves power and prevents data downlink overflow.</p>
        <input type="range" id="duty-slider" min="20" max="100" step="5" value="${Math.round(state.dutyCycle * 100)}" class="timeline-slider"/>
        <div class="opt-specs" style="margin-top:0.35rem">
          <span>Data Gen: ${res.rawDataGB} GB/day</span>
          <span>Downlink Cap: ${res.downlinkCapGB} GB/day</span>
        </div>
      </div>`;
  }

  body.innerHTML = html;

  // Bind dynamic option cards
  body.querySelectorAll("[data-pick]").forEach(el => {
    el.addEventListener("click", () => {
      const type = el.dataset.pick;
      const id = el.dataset.id;
      state.signedSeats = [false, false, false, false]; // Require re-review on change
      if (type === "objective") state.objectiveId = id;
      if (type === "instrument") {
        if (state.instrumentIds.includes(id)) {
          if (state.instrumentIds.length > 1) state.instrumentIds = state.instrumentIds.filter(x => x !== id);
        } else {
          state.instrumentIds.push(id);
        }
      }
      if (type === "bus") state.busId = id;
      if (type === "power") state.powerId = id;
      if (type === "adcs") state.adcsId = id;
      if (type === "orbit") state.orbitId = id;
      if (type === "prop") state.propId = id;
      if (type === "launcher") state.launcherId = id;
      if (type === "comms") state.commsId = id;
      renderAll();
    });
  });

  const dutySlider = document.getElementById("duty-slider");
  if (dutySlider) {
    dutySlider.addEventListener("input", (e) => {
      state.dutyCycle = Number(e.target.value) / 100;
      renderAll();
    });
  }

  const signBtn = document.getElementById("btn-seat-sign");
  if (signBtn) {
    signBtn.addEventListener("click", () => {
      const seatIdx = ["science", "spacecraft", "orbit", "ground"].indexOf(state.activeSegment);
      state.signedSeats[seatIdx] = !state.signedSeats[seatIdx];
      renderAll();
    });
  }
}

function renderAdvisorPanel(res) {
  const alertsEl = document.getElementById("mdl-alerts");
  alertsEl.innerHTML = res.alerts.map(a =>
    `<div class="alert-box alert-${a.level}">${a.msg}</div>`
  ).join("");

  const teamEl = document.getElementById("team-status-box");
  if (state.teamMode) {
    teamEl.style.display = "block";
    teamEl.innerHTML = `
      <div class="section-label"><span>4-Seat MDL Team Sign-Off</span></div>
      <div class="team-grid">
        ${TEAM_SEATS.map((s, idx) => `
          <div class="seat-card ${state.signedSeats[idx] ? 'signed' : ''}">
            <strong>${s.role.split(":")[0]}</strong><br/>
            <span style="color:var(--text-muted)">${state.signedSeats[idx] ? '✓ Approved' : '⏳ Reviewing'}</span>
          </div>`).join("")}
      </div>`;
  } else {
    teamEl.style.display = "none";
  }

  document.getElementById("live-mei-score").textContent = `${res.scores.totalMEI} / 1000`;
  document.getElementById("battery-dod-readout").textContent = `${res.batteryDoDPct}% (Limit ≤45%)`;
  document.getElementById("thermal-margin-readout").textContent = `${res.thermalMarginW >= 0 ? '+' : ''}${res.thermalMarginW} W`;
}

function updateSimTelemetryReadout(t, cachedRes = null) {
  const res = cachedRes || evaluateMissionDesign(state);
  const phase =
    t < 15 ? "PHASE 1: LAUNCH & FAIRING SEPARATION" :
    t < 30 ? "PHASE 2: SOLAR ARRAY DEPLOY & DETUMBLE" :
    t < 65 ? "PHASE 3: NOMINAL SCIENCE OBSERVATION PASS" :
    t < 85 ? "PHASE 4: ORBITAL ECLIPSE (BATTERY DISCHARGE)" :
             "PHASE 5: GROUND STATION RF DOWNLINK";
  document.getElementById("sim-phase-label").textContent = `${phase} (${Math.round(t)}%)`;
}

function drawTelemetryWaveform(res) {
  const canvas = document.getElementById("telemetry-canvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth || 320;
  const h = canvas.height = 110;
  ctx.clearRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = "#16233B";
  ctx.lineWidth = 1;
  for (let y = 22; y < h; y += 22) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Battery State-of-Charge Curve over 1 Orbit
  ctx.strokeStyle = res.batteryDoDPct > 45 ? "#EF4444" : "#10B981";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 4) {
    const frac = x / w;
    const inEclipse = frac > 0.58 && frac < (0.58 + res.orbit.eclipseFrac);
    const soc = inEclipse
      ? 100 - ((frac - 0.58) / Math.max(0.05, res.orbit.eclipseFrac)) * Math.min(95, res.batteryDoDPct)
      : 100 - Math.max(0, (1 - frac) * 8);
    const y = h - (soc / 100) * (h - 18) - 8;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#94A3B8";
  ctx.font = "10px monospace";
  ctx.fillText(`BATTERY SoC (Min: ${Math.max(0, (100 - res.batteryDoDPct)).toFixed(0)}%)`, 8, 13);
}

function openDebriefModal() {
  const res = evaluateMissionDesign(state);
  const passed = res.fatalCount === 0 && res.achievedScience >= res.mission.targetScience;
  const modal = document.getElementById("debrief-modal");
  const body = document.getElementById("debrief-body");

  body.innerHTML = `
    <div class="score-hero">
      <div class="score-circle" style="border-color:${passed ? 'var(--emerald)' : 'var(--amber)'}">
        <span style="font-size:1.5rem;font-weight:800;color:#fff">${res.scores.totalMEI}</span>
        <span style="font-size:0.65rem;color:var(--text-muted)">MEI SCORE</span>
      </div>
      <div>
        <h3 style="color:${passed ? 'var(--emerald)' : 'var(--amber)'};margin-bottom:0.35rem">
          ${passed ? "MISSION BASELINE APPROVED — CML 4 FLIGHT READY" : "ENGINEERING REVIEW: DESIGN REQUIRES ITERATION"}
        </h3>
        <p style="font-size:0.84rem;color:#CBD5E1;line-height:1.45">
          Science Return: <strong>${res.achievedScience} / ${res.mission.targetScience} pts</strong> ·
          Total Cost: <strong>$${res.totalCost}M</strong> ·
          Wet Mass: <strong>${res.wetMass} kg</strong> ·
          Est. Lifetime: <strong>${res.estLifetimeMonths} months</strong>
        </p>
      </div>
    </div>

    <div class="section-label"><span>Score Breakdown (Goddard MDL Evaluation Weights)</span></div>
    <div class="opt-specs" style="margin-bottom:0.8rem">
      <span>Science Yield: ${res.scores.sciScore}/400</span>
      <span>Cost/Mass Efficiency: ${res.scores.effScore}/250</span>
      <span>Subsystem Margins: ${res.scores.marginScore}/200</span>
      <span>Team/Gate Closure: ${res.scores.teamScore}/150</span>
    </div>

    <div class="twin-card">
      <strong style="color:var(--purple)">🛰️ Real NASA Heritage Mission Comparison: ${res.mission.nasaTwin.name}</strong>
      <p style="font-size:0.8rem;color:#E2E8F0;margin-top:0.35rem;line-height:1.4">${res.mission.nasaTwin.matchReason}</p>
    </div>

    <div class="section-label"><span>Post-Mission Root-Cause Diagnostics</span></div>
    ${res.alerts.map(a => `<div class="alert-box alert-${a.level}">${a.msg}</div>`).join("")}
  `;
  modal.classList.remove("hidden");
}

function exportMissionShareCode() {
  const res = evaluateMissionDesign(state);
  const payload = btoa(JSON.stringify({
    m: state.missionId, o: state.objectiveId, i: state.instrumentIds,
    b: state.busId, p: state.powerId, pr: state.propId, a: state.adcsId,
    or: state.orbitId, l: state.launcherId, c: state.commsId, d: state.dutyCycle,
    mei: res.scores.totalMEI
  }));
  navigator.clipboard?.writeText(payload);
  alert(`Mission Architecture Share Code copied to clipboard! (MEI: ${res.scores.totalMEI}/1000)

Share this code with teammates or compare against rival teams.`);
}

window.addEventListener("DOMContentLoaded", init);
