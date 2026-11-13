# ORBITAL FORGE: CML 1–4
### Interactive NASA Space Mission Design & Concurrent Systems Engineering Game

Built for the **NASA Space Apps Challenge — Space Mission Design Game**.

## Features
- **JPL Concept Maturity Levels (CML 1–4):** Progress from Science Formulation (CML 1) through Orbit/Launch Feasibility (CML 2), Concurrent Subsystem Trades (CML 3), to Point Design Closure (CML 4).
- **4 NASA Mission Segments:** Configure Science & User objectives, Spacecraft Bus/Power/ADCS, Orbit/Propulsion/Launch Vehicle, and Ground/Comms networks.
- **1-to-4 Player Team Co-Op Mode:** Assign seats to Principal Investigator, Spacecraft Bus Lead, Flight Dynamics Lead, and Ground Ops Lead with gate sign-offs.
- **Interactive 3D Spacecraft CAD & Orbital Mission Viz:** Real-time Three.js 3D viewport showing procedural spacecraft hardware and orbital eclipse/downlink passes.
- **Post-Mission Root-Cause Diagnostics & Real NASA Twin Comparison:** Compares player designs to *TROPICS, FireSense, Lunar Flashlight, CAPSTONE,* and *Pandora*.

## Run Locally
Because the app uses ES6 modules (`type="module"`), serve it with any static HTTP server:
```bash
npx serve .
# OR using Python:
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.
