// ORBITAL FORGE: CML 1-4 — NASA Systems Engineering & Mission Database
// Grounded in NASA CubeSat 101, JPL CML 1-4, Goddard MDL, GMAT orbital regimes, and JWST Objective-Instrument rules.

export const MISSIONS = [
  {
    id: "fire_cubesat",
    title: "Tier 1: Coastal & Wildfire Sentinel (LEO CubeSat)",
    difficulty: "Cadet / Beginner Friendly",
    targetBody: "Earth",
    targetScience: 180,
    budgetCap: 8.5, // $M
    minLifetimeMonths: 18,
    recommendedOrbit: "sso_550",
    brief: "Design a rapid-response CubeSat constellation pathfinder to detect coastal algal blooms and active wildfire thermal hotspots within 6 hours of ignition.",
    nasaTwin: {
      name: "NASA TROPICS & FireSense Pathfinder (6U CubeSat Class)",
      matchReason: "Uses a compact CubeSat bus in Sun-Synchronous Low Earth Orbit with multispectral/IR radiometry and high-latitude ground downlinks."
    }
  },
  {
    id: "lunar_ice",
    title: "Tier 2: Lunar South Pole Ice Scout (Cislunar)",
    difficulty: "Flight Engineer / Intermediate",
    targetBody: "Moon",
    targetScience: 260,
    budgetCap: 24.0, // $M
    minLifetimeMonths: 12,
    recommendedOrbit: "lunar_polar",
    brief: "Map permanently shadowed craters near the Lunar South Pole to quantify surface water-ice deposits for Artemis landing site selection.",
    nasaTwin: {
      name: "NASA Lunar Flashlight & CAPSTONE (6U–12U Cislunar Class)",
      matchReason: "Requires high delta-v trans-lunar injection/capture propulsion, active thermal survival over frigid lunar poles, and Deep Space Network tracking."
    }
  },
  {
    id: "exoplanet_l2",
    title: "Tier 3: Exoplanet Flare & Transit Observatory (Sun-Earth L2)",
    difficulty: "MDL Chief Architect / Advanced",
    targetBody: "L2",
    targetScience: 340,
    budgetCap: 65.0, // $M
    minLifetimeMonths: 36,
    recommendedOrbit: "sun_earth_l2",
    brief: "Monitor M-dwarf host stars in UV and visible bands simultaneously to measure stellar flare radiation impacting habitable-zone exoplanet atmospheres.",
    nasaTwin: {
      name: "NASA Pandora SmallSat & TESS (SmallSat Deep-Space Class)",
      matchReason: "Demands sub-arcsecond star-tracker pointing, cryo-stabilized optics, deep-space L2 station-keeping, and X-band/optical high-gain downlinks."
    }
  },
  {
    id: "sandbox",
    title: "Open MDL Sandbox (Custom Architecture Lab)",
    difficulty: "Unconstrained Experimentation",
    targetBody: "Earth",
    targetScience: 150,
    budgetCap: 120.0,
    minLifetimeMonths: 12,
    recommendedOrbit: "leo_400",
    brief: "Experiment freely across all orbits, CubeSat/SmallSat buses, instruments, and launch vehicles to test extreme engineering trade-offs.",
    nasaTwin: {
      name: "NASA Goddard Mission Design Lab (MDL) Trade Study",
      matchReason: "Represents an open multi-parameter trade space evaluating Pareto-optimal mass, power, delta-v, and science return."
    }
  }
];

export const OBJECTIVES = [
  {
    id: "wildfire_ir",
    name: "Thermal Wildfire & Urban Heat Mapping",
    domain: "Earth",
    wavelength: "Mid/Thermal Infrared (3.8–12 µm)",
    scienceBase: 110,
    desc: "Detects sub-pixel high-temperature thermal anomalies and night-time fire fronts."
  },
  {
    id: "ocean_color",
    name: "Coastal Chlorophyll & Algal Bloom Spectroscopy",
    domain: "Earth",
    wavelength: "Visible / Near-IR (400–900 nm)",
    scienceBase: 95,
    desc: "Tracks coastal water quality, sediment plumes, and harmful algal blooms."
  },
  {
    id: "lunar_water_ice",
    name: "Permanently Shadowed Crater Water-Ice Assay",
    domain: "Moon",
    wavelength: "SWIR Laser Reflectance & Neutron Flux",
    scienceBase: 165,
    desc: "Probes Shackleton and Cabeus craters for surface frost and subsurface hydrogen."
  },
  {
    id: "lunar_gravity",
    name: "Lunar Mascon Gravity & Terrain Mapping",
    domain: "Moon",
    wavelength: "Ka-Band Doppler & Stereo Optical",
    scienceBase: 125,
    desc: "Refines low-altitude lunar navigation models for precision Artemis landings."
  },
  {
    id: "exoplanet_transit",
    name: "Exoplanet Transmission Spectroscopy",
    domain: "L2",
    wavelength: "Visible + Near-IR Photometry (0.4–1.7 µm)",
    scienceBase: 200,
    desc: "Measures starlight filtering through exoplanet atmospheres during transit."
  },
  {
    id: "stellar_uv_flare",
    name: "Host-Star Extreme UV Flare Monitoring",
    domain: "L2",
    wavelength: "Ultraviolet (130–300 nm)",
    scienceBase: 160,
    desc: "Quantifies coronal mass ejection and UV flux stripping exoplanet atmospheres."
  }
];

export const INSTRUMENTS = [
  {
    id: "mwir_microbolometer",
    name: "Uncooled MWIR Thermal Imager",
    compatibleObjectives: ["wildfire_ir"],
    mass: 1.8, power: 11, cost: 1.4, dataGBPerDay: 1.2, scienceValue: 115,
    pointingReq: "coarse", thermalLoad: 9,
    desc: "Compact microbolometer camera optimized for 6U CubeSat wildfire detection."
  },
  {
    id: "hyperspectral_vnir",
    name: "VNIR Hyperspectral Ocean Imager",
    compatibleObjectives: ["ocean_color", "wildfire_ir"],
    mass: 3.2, power: 18, cost: 2.3, dataGBPerDay: 3.4, scienceValue: 130,
    pointingReq: "fine", thermalLoad: 14,
    desc: "120-band pushbroom spectrometer; generates high daily data volume."
  },
  {
    id: "swir_laser_reflectometer",
    name: "4-Laser SWIR Ice Reflectometer",
    compatibleObjectives: ["lunar_water_ice"],
    mass: 4.5, power: 34, cost: 4.8, dataGBPerDay: 1.8, scienceValue: 175,
    pointingReq: "fine", thermalLoad: 28,
    desc: "Active near-IR laser altimeter/reflectometer that illuminates dark polar craters."
  },
  {
    id: "neutron_spectrometer",
    name: "Compact Lunar Neutron Spectrometer",
    compatibleObjectives: ["lunar_water_ice", "lunar_gravity"],
    mass: 2.4, power: 9, cost: 2.6, dataGBPerDay: 0.4, scienceValue: 120,
    pointingReq: "coarse", thermalLoad: 6,
    desc: "Detects epithermal neutron suppression caused by subsurface hydrogen/water."
  },
  {
    id: "precision_photometer",
    name: "20cm Vis/NIR Transit Telescope",
    compatibleObjectives: ["exoplanet_transit"],
    mass: 26.0, power: 48, cost: 14.5, dataGBPerDay: 4.5, scienceValue: 220,
    pointingReq: "subarcsec", thermalLoad: 35,
    desc: "Photometrically stabilized telescope requiring sub-arcsecond ADCS and active thermal control."
  },
  {
    id: "uv_coronagraph_spec",
    name: "Far-UV Stellar Flare Spectrograph",
    compatibleObjectives: ["stellar_uv_flare", "exoplanet_transit"],
    mass: 18.5, power: 38, cost: 11.2, dataGBPerDay: 2.9, scienceValue: 170,
    pointingReq: "subarcsec", thermalLoad: 26,
    desc: "Captures high-cadence UV flare spectra; incompatible with low-altitude Earth glow."
  }
];

export const BUS_OPTIONS = [
  {
    id: "cubesat_3u",
    name: "3U CubeSat Bus (CubeSat 101 Standard)",
    maxTotalMass: 5.5, dryMass: 1.6, basePower: 4, cost: 0.8,
    maxSolarW: 24, maxBatteryWh: 45, maxPropDeltaV: 120,
    desc: "10×10×34 cm COTS chassis. Ultra-low cost, strict mass/power envelope."
  },
  {
    id: "cubesat_6u",
    name: "6U CubeSat Bus (CSLI Pathfinder)",
    maxTotalMass: 13.5, dryMass: 3.4, basePower: 8, cost: 1.6,
    maxSolarW: 65, maxBatteryWh: 120, maxPropDeltaV: 650,
    desc: "10×20×34 cm workhorse bus (used by TROPICS & Lunar Flashlight)."
  },
  {
    id: "cubesat_12u",
    name: "12U Deep-Space CubeSat Bus",
    maxTotalMass: 26.0, dryMass: 6.2, basePower: 14, cost: 3.2,
    maxSolarW: 130, maxBatteryWh: 260, maxPropDeltaV: 1650,
    desc: "20×20×34 cm high-volume bus capable of cislunar propulsion & dual payloads."
  },
  {
    id: "smallsat_180",
    name: "ESPA-Class 180 kg SmallSat Bus",
    maxTotalMass: 185.0, dryMass: 58.0, basePower: 38, cost: 12.0,
    maxSolarW: 480, maxBatteryWh: 950, maxPropDeltaV: 2400,
    desc: "Full redundancy, precision optical bench, and deep-space thermal/power margin."
  }
];

export const POWER_OPTIONS = [
  { id: "body_solar", name: "Body-Mounted GaAs Cells + 40 Wh Li-Ion", solarW: 18, batteryWh: 40, mass: 0.7, cost: 0.35, desc: "No deployment mechanism risk; limited area." },
  { id: "deploy_2wing", name: "2-Wing Deployable Solar + 110 Wh Li-Ion", solarW: 58, batteryWh: 110, mass: 1.9, cost: 0.9, desc: "Standard 6U/12U deployable wings with 30% triple-junction efficiency." },
  { id: "deploy_4wing", name: "4-Wing Articulated Array + 240 Wh Li-Ion", solarW: 125, batteryWh: 240, mass: 4.2, cost: 2.1, desc: "Sun-tracking gimbaled wings for high-power sensors or cislunar ops." },
  { id: "smallsat_array", name: "High-Output 420 W Array + 850 Wh Battery", solarW: 420, batteryWh: 850, mass: 16.5, cost: 5.4, desc: "Deep-space rated EPS with dual redundant power distribution units." }
];

export const PROPULSION_OPTIONS = [
  { id: "none_drag", name: "No Propulsion (Passive Drag / Gravity Gradient)", deltaV: 0, dryMass: 0.0, propMass: 0.0, power: 0, cost: 0.0, desc: "Zero propulsion mass; relies on deployment orbit altitude for lifetime." },
  { id: "cold_gas", name: "Micro Cold-Gas Thruster (Butane/R236fa)", deltaV: 85, dryMass: 0.8, propMass: 0.7, power: 4, cost: 0.55, desc: "Safe rideshare-compliant attitude & minor orbit maintenance." },
  { id: "green_monoprop", name: "AS-CENT Green Monopropellant Thruster", deltaV: 580, dryMass: 1.8, propMass: 2.6, power: 14, cost: 1.8, desc: "High-thrust chemical system for orbit raising and lunar capture." },
  { id: "hall_electric", name: "Xenon/Iodine Hall-Effect Electric Thruster", deltaV: 1850, dryMass: 3.6, propMass: 2.8, power: 65, cost: 3.9, desc: "Very high specific impulse (Isp ~1,400 s); demands high solar power." },
  { id: "biprop_deep", name: "High-Delta-V Bipropellant Transfer Stage", deltaV: 2350, dryMass: 14.0, propMass: 42.0, power: 28, cost: 7.5, desc: "High-impulse deep-space maneuvering for L2 and lunar insertion." }
];

export const ADCS_THERMAL_OPTIONS = [
  { id: "basic_adcs", name: "Magnetorquers + Passive MLI Blanket", pointing: "coarse", mass: 0.6, power: 3, cost: 0.3, coolingCap: 15, desc: "1–2 deg pointing accuracy; passive thermal balance." },
  { id: "wheel_adcs", name: "3-Axis Reaction Wheels + Heat Pipes", pointing: "fine", mass: 1.6, power: 9, cost: 1.1, coolingCap: 35, desc: "0.05 deg pointing stability with conductive radiator straps." },
  { id: "star_cryo", name: "Dual Star Trackers + Active Cryo-Radiator", pointing: "subarcsec", mass: 6.5, power: 24, cost: 3.8, coolingCap: 75, desc: "Sub-arcsecond stability and active thermal control for precision optics." }
];

export const ORBITS = [
  {
    id: "leo_400",
    name: "ISS-Deployment LEO (400 km, 51.6°)",
    regime: "Earth",
    altitudeKm: 400,
    periodMin: 92.5,
    eclipseFrac: 0.38,
    reqDeltaV: 40,
    dragLifetimeMonths: 14,
    solarFactor: 1.0,
    slantRangeKm: 1200,
    desc: "Low launch cost via ISS deployer, but higher atmospheric drag limits lifetime without reboost."
  },
  {
    id: "sso_550",
    name: "Sun-Synchronous Polar LEO (550 km, 97.6°)",
    regime: "Earth",
    altitudeKm: 550,
    periodMin: 95.6,
    eclipseFrac: 0.32,
    reqDeltaV: 90,
    dragLifetimeMonths: 48,
    solarFactor: 1.0,
    slantRangeKm: 1600,
    desc: "Constant local solar illumination angle; ideal for Earth imaging and polar ground stations."
  },
  {
    id: "lunar_polar",
    name: "Lunar Low Polar Orbit (100 km Lunar, 90°)",
    regime: "Moon",
    altitudeKm: 100,
    periodMin: 118.0,
    eclipseFrac: 0.41,
    reqDeltaV: 1150, // Post-TLI lunar orbit insertion + station-keeping
    dragLifetimeMonths: 36,
    solarFactor: 0.98,
    slantRangeKm: 384400,
    desc: "Passes over both lunar poles every 2 hours; requires lunar orbit insertion delta-v and deep-space comms."
  },
  {
    id: "sun_earth_l2",
    name: "Sun-Earth L2 Halo Orbit (1.5M km)",
    regime: "L2",
    altitudeKm: 1500000,
    periodMin: 259200,
    eclipseFrac: 0.02, // Continuous solar illumination!
    reqDeltaV: 420,
    dragLifetimeMonths: 72,
    solarFactor: 0.98,
    slantRangeKm: 1500000,
    desc: "Uninterrupted thermal/solar stability away from Earth glow; requires high-gain deep-space downlink."
  }
];

export const LAUNCH_VEHICLES = [
  {
    id: "iss_nanoracks",
    name: "Commercial Cargo + ISS CubeSat Deployer",
    maxMassLEO: 14, maxMassLunar: 0, maxMassL2: 0,
    cost: 0.6,
    desc: "Low-cost deployment to 400 km LEO; cannot reach SSO, Moon, or L2 directly."
  },
  {
    id: "rideshare_sso",
    name: "Falcon Rideshare ESPA / P-POD",
    maxMassLEO: 35, maxMassLunar: 0, maxMassL2: 0,
    cost: 1.4,
    desc: "Dedicated Sun-Synchronous LEO rideshare slot up to 35 kg."
  },
  {
    id: "electron_lunar",
    name: "Dedicated Small Launcher + Photon Kick Stage",
    maxMassLEO: 220, maxMassLunar: 32, maxMassL2: 24,
    cost: 7.5,
    desc: "Delivers payloads directly onto Trans-Lunar Injection (TLI) or L2 transfer trajectories."
  },
  {
    id: "falcon_dedicated",
    name: "Medium-Lift Rideshare / Direct Injection",
    maxMassLEO: 500, maxMassLunar: 210, maxMassL2: 195,
    cost: 16.5,
    desc: "High throw-mass capability for SmallSat observatories to Lunar or L2 orbits."
  }
];

export const COMMS_GROUND_OPTIONS = [
  {
    id: "uhf_uni",
    name: "UHF Radio + University Ground Station (2 passes/day)",
    band: "UHF", mass: 0.4, power: 6, cost: 0.3,
    downlinkGBPerDayLEO: 0.35, downlinkGBPerDayDeep: 0.0,
    desc: "Simple omni-directional antenna; severe data bottleneck for imaging payloads."
  },
  {
    id: "sband_nsn",
    name: "S-Band Patch + NASA NSN / CSA Inuvik Polar Network",
    band: "S-Band", mass: 1.1, power: 14, cost: 1.2,
    downlinkGBPerDayLEO: 2.8, downlinkGBPerDayDeep: 0.12,
    desc: "High-latitude polar passes (including CSA Inuvik) boost SSO downlink capacity."
  },
  {
    id: "xband_dish",
    name: "X-Band High-Gain Dish + NASA Near/Deep Space Network",
    band: "X-Band", mass: 2.8, power: 26, cost: 3.4,
    downlinkGBPerDayLEO: 8.5, downlinkGBPerDayDeep: 2.4,
    desc: "Required for high-volume Lunar and L2 science data return."
  },
  {
    id: "optical_laser",
    name: "TBIRD-Class Optical Lasercom + Ground Telescope",
    band: "Optical", mass: 3.4, power: 32, cost: 5.2,
    downlinkGBPerDayLEO: 24.0, downlinkGBPerDayDeep: 6.2,
    desc: "Ultra-high bandwidth laser downlink; requires fine/sub-arcsecond pointing."
  }
];
