// ORBITAL FORGE: CML 1-4 — Interactive 3D Spacecraft CAD & Mission Viz Orbital Simulator
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class MissionViewport3D {
  constructor(containerEl) {
    this.container = containerEl;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, containerEl.clientWidth / 420, 0.1, 2000);
    this.camera.position.set(0, 4.5, 9.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(containerEl.clientWidth, 420);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerEl.innerHTML = '';
    containerEl.appendChild(this.renderer.domElement);

    this.viewMode = 'cad'; // 'cad' or 'orbit'
    this.simTime = 0; // 0 to 100% of mission phase
    this.playing = false;
    this.speed = 1;
    this.mouseDown = false;
    this.rotY = 0.5;
    this.rotX = 0.35;

    this._initLightsAndStars();
    this._initGroups();
    this._bindControls();
    this._animate();
  }

  _initLightsAndStars() {
    const ambient = new THREE.AmbientLight(0x334155, 1.4);
    this.scene.add(ambient);

    this.sunLight = new THREE.DirectionalLight(0xFFFBEB, 2.6);
    this.sunLight.position.set(15, 6, 10);
    this.scene.add(this.sunLight);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 180;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xCBD5E1, size: 0.28 });
    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  _initGroups() {
    this.cadGroup = new THREE.Group();
    this.orbitGroup = new THREE.Group();
    this.orbitGroup.visible = false;
    this.scene.add(this.cadGroup);
    this.scene.add(this.orbitGroup);
  }

  _bindControls() {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', (e) => {
      this.mouseDown = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    window.addEventListener('pointerup', () => { this.mouseDown = false; });
    window.addEventListener('pointermove', (e) => {
      if (!this.mouseDown) return;
      this.rotY += (e.clientX - this.lastX) * 0.008;
      this.rotX = Math.max(-1.2, Math.min(1.2, this.rotX + (e.clientY - this.lastY) * 0.008));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    window.addEventListener('resize', () => {
      if (!this.container) return;
      this.camera.aspect = this.container.clientWidth / 420;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, 420);
    });
  }

  setMode(mode) {
    this.viewMode = mode;
    this.cadGroup.visible = (mode === 'cad');
    this.orbitGroup.visible = (mode === 'orbit');
    if (mode === 'cad') {
      this.camera.position.set(0, 2.2, 6.2);
    } else {
      this.camera.position.set(0, 6.5, 11.5);
    }
    this.camera.lookAt(0, 0, 0);
  }

  updateFromDesign(evalResult) {
    // Rebuild Procedural Spacecraft CAD Mesh
    while (this.cadGroup.children.length) this.cadGroup.remove(this.cadGroup.children[0]);

    const busId = evalResult.bus.id;
    let dims = [1.0, 1.0, 2.2]; // 3U
    if (busId === 'cubesat_6u') dims = [1.0, 1.6, 2.4];
    if (busId === 'cubesat_12u') dims = [1.6, 1.6, 2.4];
    if (busId === 'smallsat_180') dims = [2.2, 2.2, 2.6];

    // Gold/Silver MLI Foil Chassis
    const chassisGeo = new THREE.BoxGeometry(dims[0], dims[1], dims[2]);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: busId === 'smallsat_180' ? 0xD97706 : 0xCBD5E1,
      metalness: 0.78,
      roughness: 0.28
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    this.cadGroup.add(chassis);

    // Structural frame edges
    const edges = new THREE.EdgesGeometry(chassisGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x38BDF8 }));
    this.cadGroup.add(line);

    // Solar Arrays
    const pId = evalResult.powerSys.id;
    if (pId !== 'body_solar') {
      const span = pId === 'deploy_2wing' ? 2.4 : pId === 'deploy_4wing' ? 3.4 : 4.4;
      const panelGeo = new THREE.BoxGeometry(span, 0.06, dims[2] * 0.75);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1D4ED8,
        emissive: 0x0F172A,
        metalness: 0.5,
        roughness: 0.2
      });
      const leftWing = new THREE.Mesh(panelGeo, panelMat);
      leftWing.position.set(-(dims[0] / 2 + span / 2 + 0.15), 0, 0);
      const rightWing = new THREE.Mesh(panelGeo, panelMat);
      rightWing.position.set(dims[0] / 2 + span / 2 + 0.15, 0, 0);
      this.cadGroup.add(leftWing, rightWing);
    }

    // Instrument Optical Barrel
    if (evalResult.selectedInstruments.length > 0) {
      const lensGeo = new THREE.CylinderGeometry(0.36, 0.42, 0.65, 20);
      lensGeo.rotateX(Math.PI / 2);
      const lensMat = new THREE.MeshStandardMaterial({ color: 0xA78BFA, metalness: 0.6, roughness: 0.25 });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 0.15, dims[2] / 2 + 0.25);
      this.cadGroup.add(lens);
    }

    // Comms Dish / Antenna
    const cBand = evalResult.comms.band;
    if (cBand === 'X-Band' || cBand === 'Optical') {
      const dishGeo = new THREE.ConeGeometry(0.55, 0.35, 24, 1, true);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0x10B981, side: THREE.DoubleSide, metalness: 0.7 });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, dims[1] / 2 + 0.3, 0);
      this.cadGroup.add(dish);
    } else {
      const whipGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8);
      const whipMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
      const whip = new THREE.Mesh(whipGeo, whipMat);
      whip.position.set(0, dims[1] / 2 + 0.45, 0);
      this.cadGroup.add(whip);
    }

    // Propulsion Nozzle
    if (evalResult.prop.id !== 'none_drag') {
      const nozGeo = new THREE.ConeGeometry(0.28, 0.45, 16);
      nozGeo.rotateX(-Math.PI / 2);
      const nozMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 });
      const noz = new THREE.Mesh(nozGeo, nozMat);
      noz.position.set(0, 0, -(dims[2] / 2 + 0.2));
      this.cadGroup.add(noz);
    }

    // Rebuild Orbital Mission Viz Environment
    while (this.orbitGroup.children.length) this.orbitGroup.remove(this.orbitGroup.children[0]);

    const regime = evalResult.orbit.regime;
    const bodyRadius = regime === 'L2' ? 1.1 : 2.1;
    const bodyColor = regime === 'Moon' ? 0x94A3B8 : regime === 'L2' ? 0xF59E0B : 0x0284C7;
    const planetGeo = new THREE.SphereGeometry(bodyRadius, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      emissive: regime === 'L2' ? 0xB45309 : 0x082F49,
      roughness: 0.65
    });
    this.centralBody = new THREE.Mesh(planetGeo, planetMat);
    this.orbitGroup.add(this.centralBody);

    // Eclipse Shadow Cone (behind planet along -X)
    if (regime !== 'L2') {
      const shadowGeo = new THREE.CylinderGeometry(bodyRadius * 0.98, bodyRadius * 0.98, 9, 24, 1, true);
      shadowGeo.rotateZ(Math.PI / 2);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x020617, transparent: true, opacity: 0.45, side: THREE.DoubleSide
      });
      const shadowCone = new THREE.Mesh(shadowGeo, shadowMat);
      shadowCone.position.set(-4.5 - bodyRadius * 0.5, 0, 0);
      this.orbitGroup.add(shadowCone);
    }

    // Orbit Ring
    this.orbitRadius = regime === 'Moon' ? 3.2 : regime === 'L2' ? 4.4 : evalResult.orbit.id === 'sso_550' ? 3.4 : 2.9;
    const ringPoints = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(a) * this.orbitRadius, 0, Math.sin(a) * this.orbitRadius));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x38BDF8 });
    this.orbitRing = new THREE.Line(ringGeo, ringMat);
    if (evalResult.orbit.id === 'sso_550' || regime === 'Moon') {
      this.orbitRing.rotation.z = 1.25;
    } else {
      this.orbitRing.rotation.z = 0.45;
    }
    this.orbitGroup.add(this.orbitRing);

    // Orbiting Spacecraft Marker + RF Downlink Beam
    const satMarkerGeo = new THREE.BoxGeometry(0.32, 0.22, 0.45);
    const satMarkerMat = new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x059669 });
    this.satMarker = new THREE.Mesh(satMarkerGeo, satMarkerMat);
    this.orbitGroup.add(this.satMarker);

    const beamGeo = new THREE.ConeGeometry(0.45, this.orbitRadius - bodyRadius, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x10B981, transparent: true, opacity: 0.28 });
    this.rfBeam = new THREE.Mesh(beamGeo, beamMat);
    this.orbitGroup.add(this.rfBeam);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    if (this.viewMode === 'cad') {
      if (!this.mouseDown) this.rotY += 0.005;
      this.cadGroup.rotation.y = this.rotY;
      this.cadGroup.rotation.x = this.rotX;
    } else {
      this.orbitGroup.rotation.y = this.rotY * 0.6;
      if (this.playing) {
        this.simTime = (this.simTime + 0.18 * this.speed) % 100;
        if (this.onTimeTick) this.onTimeTick(this.simTime);
      }
      if (this.satMarker && this.orbitRing) {
        const angle = (this.simTime / 100) * Math.PI * 2;
        const localPos = new THREE.Vector3(
          Math.cos(angle) * this.orbitRadius,
          0,
          Math.sin(angle) * this.orbitRadius
        );
        localPos.applyEuler(this.orbitRing.rotation);
        this.satMarker.position.copy(localPos);
        this.satMarker.lookAt(0, 0, 0);

        // Show RF beam during ground pass windows (angles near +X / +Z)
        const inGroundPass = Math.cos(angle) > 0.45;
        this.rfBeam.visible = inGroundPass;
        this.rfBeam.position.copy(localPos).multiplyScalar(0.55);
        this.rfBeam.lookAt(0, 0, 0);
        this.rfBeam.rotateX(Math.PI / 2);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
