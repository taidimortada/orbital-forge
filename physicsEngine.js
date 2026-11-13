// ORBITAL FORGE: CML 1-4 — Concurrent MDL Physics & Systems Engineering Engine
import {
  MISSIONS, OBJECTIVES, INSTRUMENTS, BUS_OPTIONS, POWER_OPTIONS,
  PROPULSION_OPTIONS, ADCS_THERMAL_OPTIONS, ORBITS, LAUNCH_VEHICLES, COMMS_GROUND_OPTIONS
} from './nasaData.js';

export function evaluateMissionDesign(state) {
  const mission = MISSIONS.find(m => m.id === state.missionId) || MISSIONS[0];
  const objective = OBJECTIVES.find(o => o.id === state.objectiveId) || OBJECTIVES[0];
  const selectedInstruments = INSTRUMENTS.filter(i => state.instrumentIds.includes(i.id));
  const bus = BUS_OPTIONS.find(b => b.id === state.busId) || BUS_OPTIONS[1];
  const powerSys = POWER_OPTIONS.find(p => p.id === state.powerId) || POWER_OPTIONS[1];
  const prop = PROPULSION_OPTIONS.find(p => p.id === state.propId) || PROPULSION_OPTIONS[0];
  const adcs = ADCS_THERMAL_OPTIONS.find(a => a.id === state.adcsId) || ADCS_THERMAL_OPTIONS[0];
  const orbit = ORBITS.find(o => o.id === state.orbitId) || ORBITS[1];
  const launcher = LAUNCH_VEHICLES.find(l => l.id === state.launcherId) || LAUNCH_VEHICLES[1];
  const comms = COMMS_GROUND_OPTIONS.find(c => c.id === state.commsId) || COMMS_GROUND_OPTIONS[1];

  // Apply anomaly modifiers if active
  const massPenalty = state.activeAnomaly === 'rideshare_cap' ? 1.5 : 0;
  const dragPenalty = state.activeAnomaly === 'solar_storm' ? 0.65 : 1.0;

  // 1. MASS BUDGET (kg)
  const instMass = selectedInstruments.reduce((s, i) => s + i.mass, 0);
  const dryMass = bus.dryMass + instMass + powerSys.mass + prop.dryMass + adcs.mass + comms.mass;
  const wetMass = +(dryMass + prop.propMass).toFixed(2);
  const busMassLimit = +(bus.maxTotalMass - massPenalty).toFixed(2);

  // Launcher throw mass capacity to selected regime
  let launcherCap = launcher.maxMassLEO;
  if (orbit.regime === 'Moon') launcherCap = launcher.maxMassLunar;
  if (orbit.regime === 'L2') launcherCap = launcher.maxMassL2;
  const effectiveMassLimit = Math.min(busMassLimit, launcherCap);

  // 2. POWER & ECLIPSE ENERGY BALANCE (W & Wh)
  const sunlitFrac = 1 - orbit.eclipseFrac;
  const avgSolarGenW = +(powerSys.solarW * orbit.solarFactor * sunlitFrac * 0.86).toFixed(1); // 0.86 cosine/MPPT factor
  const instAvgPower = selectedInstruments.reduce((s, i) => s + i.power * state.dutyCycle, 0);
  const avgLoadW = +(bus.basePower + instAvgPower + adcs.power + comms.power * 0.35 + prop.power * 0.15).toFixed(1);
  const powerMarginPct = avgLoadW > 0 ? +(((avgSolarGenW - avgLoadW) / avgLoadW) * 100).toFixed(1) : 100;

  // Eclipse battery Depth of Discharge (DoD)
  const eclipseHours = (orbit.periodMin * orbit.eclipseFrac) / 60;
  const eclipseLoadW = bus.basePower + adcs.power + (instAvgPower * 0.45);
  const energyUsedWh = eclipseLoadW * Math.min(eclipseHours, 1.5); // Cap for L2 long orbit representation
  const batteryDoDPct = +((energyUsedWh / powerSys.batteryWh) * 100).toFixed(1);

  // 3. PROPULSION & DELTA-V (Tsiolkovsky-scaled check)
  // Scale effective delta-v slightly if spacecraft is heavier than nominal reference
  const massScale = Math.max(0.72, Math.min(1.18, bus.maxTotalMass / Math.max(wetMass, 1)));
  const availableDeltaV = Math.round(prop.deltaV * massScale);
  const requiredDeltaV = orbit.reqDeltaV;
  const deltaVMargin = availableDeltaV - requiredDeltaV;

  // 4. DATA GENERATION VS. COMMS DOWNLINK (GB/day)
  const rawDataGB = +(selectedInstruments.reduce((s, i) => s + i.dataGBPerDay, 0) * state.dutyCycle).toFixed(2);
  const isDeepSpace = orbit.regime === 'Moon' || orbit.regime === 'L2';
  const downlinkCapGB = isDeepSpace ? comms.downlinkGBPerDayDeep : comms.downlinkGBPerDayLEO;
  const effectiveDownlinkGB = +Math.min(rawDataGB, downlinkCapGB).toFixed(2);
  const dataOverflowGB = +Math.max(0, rawDataGB - downlinkCapGB).toFixed(2);

  // 5. THERMAL & POINTING COMPATIBILITY
  const totalThermalW = selectedInstruments.reduce((s, i) => s + i.thermalLoad * state.dutyCycle, 0) + comms.power * 0.4;
  const thermalMarginW = +(adcs.coolingCap - totalThermalW).toFixed(1);

  const pointingRank = { coarse: 1, fine: 2, subarcsec: 3 };
  const maxReqPointing = selectedInstruments.reduce((max, i) => Math.max(max, pointingRank[i.pointingReq] || 1), 1);
  if (comms.band === 'Optical') {
    // Lasercom requires at least fine pointing
  }
  const hasPointingRank = pointingRank[adcs.pointing] || 1;
  const pointingOk = hasPointingRank >= maxReqPointing && (comms.band !== 'Optical' || hasPointingRank >= 2);

  // 6. LIFETIME & BUDGET ($M)
  const reboostBonusMonths = deltaVMargin > 0 ? Math.min(36, Math.round(deltaVMargin / 15)) : 0;
  const estLifetimeMonths = Math.round((orbit.dragLifetimeMonths + reboostBonusMonths) * dragPenalty);

  const instCost = selectedInstruments.reduce((s, i) => s + i.cost, 0);
  const opsCost = +(estLifetimeMonths * 0.08).toFixed(2);
  const totalCost = +(bus.cost + instCost + powerSys.cost + prop.cost + adcs.cost + comms.cost + launcher.cost + opsCost).toFixed(2);

  // 7. SCIENCE RETURN & ENGINEERING DIAGNOSTICS
  const alerts = [];
  let fatalCount = 0;
  let warnCount = 0;

  if (selectedInstruments.length === 0) {
    alerts.push({ level: 'err', msg: 'CML 1 Blocker: No scientific instrument selected.' });
    fatalCount++;
  }
  const compatibleCount = selectedInstruments.filter(i => i.compatibleObjectives.includes(objective.id)).length;
  if (selectedInstruments.length > 0 && compatibleCount === 0) {
    alerts.push({ level: 'err', msg: `Science Mismatch: Selected instruments cannot observe ${objective.wavelength}.` });
    fatalCount++;
  }
  if (orbit.regime !== objective.domain && mission.id !== 'sandbox') {
    alerts.push({ level: 'err', msg: `Orbit Mismatch: "${objective.name}" requires ${objective.domain} regime (currently ${orbit.regime}).` });
    fatalCount++;
  }
  if (launcherCap === 0) {
    alerts.push({ level: 'err', msg: `Launch Failure: ${launcher.name} cannot inject payloads to ${orbit.regime}.` });
    fatalCount++;
  } else if (wetMass > effectiveMassLimit) {
    alerts.push({ level: 'err', msg: `Mass Exceeded: ${wetMass} kg exceeds ${effectiveMassLimit} kg bus/launcher limit.` });
    fatalCount++;
  }
  if (powerMarginPct < 0) {
    alerts.push({ level: 'err', msg: `Power Deficit: Average generation (${avgSolarGenW} W) < Load (${avgLoadW} W). Spacecraft will brown out.` });
    fatalCount++;
  } else if (powerMarginPct < 10) {
    alerts.push({ level: 'warn', msg: `Tight Power Margin (${powerMarginPct}%): NASA MDL recommends ≥10% margin at CML 4.` });
    warnCount++;
  }
  if (batteryDoDPct > 45) {
    alerts.push({ level: 'err', msg: `Eclipse Battery Failure: Depth of Discharge (${batteryDoDPct}%) exceeds 45% Li-Ion safe limit.` });
    fatalCount++;
  } else if (batteryDoDPct > 35) {
    alerts.push({ level: 'warn', msg: `High Battery DoD (${batteryDoDPct}%): Approaching eclipse thermal/cycle limit.` });
    warnCount++;
  }
  if (deltaVMargin < 0) {
    alerts.push({ level: 'err', msg: `Propulsion Shortfall: Need ${requiredDeltaV} m/s Δv for ${orbit.name}, only ${availableDeltaV} m/s available.` });
    fatalCount++;
  }
  if (dataOverflowGB > 0.05) {
    alerts.push({ level: 'warn', msg: `Downlink Bottleneck: ${dataOverflowGB} GB/day stranded onboard. Upgrade comms/ground passes or lower duty cycle.` });
    warnCount++;
  }
  if (!pointingOk) {
    alerts.push({ level: 'err', msg: `ADCS Pointing Error: Payload/Lasercom requires higher pointing stability than ${adcs.name}.` });
    fatalCount++;
  }
  if (thermalMarginW < 0) {
    alerts.push({ level: 'err', msg: `Thermal Overheat: Heat load (${totalThermalW.toFixed(1)} W) exceeds radiator rejection (${adcs.coolingCap} W).` });
    fatalCount++;
  }
  if (totalCost > mission.budgetCap && mission.id !== 'sandbox') {
    alerts.push({ level: 'err', msg: `Over Budget: $${totalCost}M exceeds mission cap of $${mission.budgetCap}M.` });
    fatalCount++;
  }
  if (estLifetimeMonths < mission.minLifetimeMonths && mission.id !== 'sandbox') {
    alerts.push({ level: 'warn', msg: `Short Lifetime: ${estLifetimeMonths} mo vs ${mission.minLifetimeMonths} mo goal (add Δv reboost or higher orbit).` });
    warnCount++;
  }

  if (alerts.length === 0) {
    alerts.push({ level: 'ok', msg: 'All Goddard MDL concurrent subsystems closed within nominal NASA CML 4 margins!' });
  }

  // Science yield calculation (penalized if data cannot be downlinked or pointing fails)
  const downlinkEfficiency = rawDataGB > 0 ? Math.min(1, downlinkCapGB / rawDataGB) : 0;
  const lifetimeFactor = Math.min(1.25, estLifetimeMonths / mission.minLifetimeMonths);
  const rawScienceSum = selectedInstruments.reduce((sum, inst) => {
    const compatMult = inst.compatibleObjectives.includes(objective.id) ? 1.0 : 0.2;
    return sum + inst.scienceValue * compatMult;
  }, 0);
  const achievedScience = pointingOk
    ? Math.round((objective.scienceBase * 0.4 + rawScienceSum) * state.dutyCycle * (0.35 + 0.65 * downlinkEfficiency) * lifetimeFactor)
    : Math.round(rawScienceSum * 0.15);

  // CML Gate Readiness (CML 1 -> CML 4)
  const cml1Ready = selectedInstruments.length > 0 && compatibleCount > 0;
  const cml2Ready = cml1Ready && launcherCap > 0 && wetMass <= effectiveMassLimit * 1.15 && powerMarginPct >= -10;
  const cml3Ready = cml2Ready && deltaVMargin >= 0 && pointingOk && thermalMarginW >= 0;
  const cml4Ready = cml3Ready && fatalCount === 0 && achievedScience >= mission.targetScience;

  // Mission Efficiency Index (0 - 1000)
  const sciScore = Math.min(400, Math.round((achievedScience / mission.targetScience) * 320));
  const costRatio = Math.max(0.2, Math.min(1.5, mission.budgetCap / Math.max(totalCost, 1)));
  const effScore = Math.min(250, Math.round(costRatio * 180));
  const marginScore = fatalCount === 0 ? Math.max(80, 200 - warnCount * 35) : Math.max(0, 70 - fatalCount * 25);
  const teamScore = state.teamMode ? (state.signedSeats.filter(Boolean).length * 37 + 2) : 150;
  const totalMEI = Math.min(1000, sciScore + effScore + marginScore + teamScore);

  return {
    mission, objective, selectedInstruments, bus, powerSys, prop, adcs, orbit, launcher, comms,
    wetMass, dryMass, effectiveMassLimit,
    avgSolarGenW, avgLoadW, powerMarginPct, batteryDoDPct,
    availableDeltaV, requiredDeltaV, deltaVMargin,
    rawDataGB, downlinkCapGB, effectiveDownlinkGB, dataOverflowGB,
    thermalMarginW, pointingOk, estLifetimeMonths, totalCost,
    achievedScience, alerts, fatalCount, warnCount,
    cmlGates: [cml1Ready, cml2Ready, cml3Ready, cml4Ready],
    scores: { sciScore, effScore, marginScore, teamScore, totalMEI }
  };
}
