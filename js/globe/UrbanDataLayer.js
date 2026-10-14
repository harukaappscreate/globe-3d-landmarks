import * as THREE from 'three';
import { URBAN_AREAS_DATA, GLOBAL_ARCS_DATA } from '../data/openUrbanData.js';
import { latLonToVector3 } from './ProceduralTextures.js';

/**
 * Renders Open Data 3D Urban Population Pillars, 3D Inter-City Network Arcs with moving light packets,
 * and 3D Orbital Satellites (ISS / Earth Observation).
 */
export class UrbanDataLayer {
  constructor(globeGroup, radius = 10) {
    this.globeGroup = globeGroup;
    this.radius = radius;

    this.pillarsGroup = new THREE.Group();
    this.pillarsGroup.name = 'UrbanPillarsGroup';
    this.pillarsGroup.visible = false;
    this.globeGroup.add(this.pillarsGroup);

    this.arcsGroup = new THREE.Group();
    this.arcsGroup.name = 'GlobalArcsGroup';
    this.arcsGroup.visible = false;
    this.globeGroup.add(this.arcsGroup);

    this.satellitesGroup = new THREE.Group();
    this.satellitesGroup.name = 'OrbitalSatellitesGroup';
    this.globeGroup.add(this.satellitesGroup);

    this.cityEntries = new Map();
    this.interactiveMeshes = [];
    this.arcPackets = [];
    this.satellites = [];
    this.targetPillarScale = 1.0;
    this.currentPillarScale = 1.0;

    this._buildUrbanPillars();
    this._buildGlobalArcs();
    this._buildOrbitalSatellites();
  }

  _buildUrbanPillars() {
    const upAxis = new THREE.Vector3(0, 1, 0);

    for (const city of URBAN_AREAS_DATA) {
      const surfacePos = latLonToVector3(city.lat, city.lon, this.radius);
      const normal = surfacePos.clone().normalize();

      const anchor = new THREE.Group();
      anchor.position.copy(surfacePos);
      anchor.quaternion.setFromUnitVectors(upAxis, normal);

      // Height proportional to Open Data metropolitan population (in millions)
      const pillarHeight = 0.14 + (city.popM / 38.0) * 1.45;
      const radiusHex = city.popM >= 20 ? 0.048 : city.popM >= 10 ? 0.038 : 0.03;

      let hexColor = 0x34d399; // Emerald (<10M)
      if (city.popM >= 20) {
        hexColor = 0xfbbf24; // Gold Megacity (>=20M)
      } else if (city.popM >= 10) {
        hexColor = 0x38bdf8; // Cyan Large Metropolis (10-20M)
      }

      // 3D Hexagonal Pillar shifted so base sits at y = 0
      const pillarGeo = new THREE.CylinderGeometry(radiusHex * 0.72, radiusHex, pillarHeight, 6);
      pillarGeo.translate(0, pillarHeight / 2, 0);

      const pillarMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: 0.58,
        transparent: true,
        opacity: 0.86,
        roughness: 0.25,
        metalness: 0.5
      });

      const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
      pillarMesh.userData = { type: 'city', data: city, anchor };
      anchor.add(pillarMesh);
      this.interactiveMeshes.push(pillarMesh);

      // Glowing Tip Cap
      const capGeo = new THREE.SphereGeometry(radiusHex * 0.85, 8, 8);
      const capMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = pillarHeight;
      anchor.add(capMesh);

      // Surface Halo Dot
      const haloGeo = new THREE.RingGeometry(radiusHex * 1.3, radiusHex * 2.1, 6);
      haloGeo.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.y = 0.005;
      anchor.add(haloMesh);

      this.pillarsGroup.add(anchor);
      this.cityEntries.set(city.id, {
        id: city.id,
        data: city,
        anchor,
        pillarMesh,
        capMesh,
        pillarHeight,
        surfacePos
      });
    }
  }

  _buildGlobalArcs() {
    const packetGeo = new THREE.SphereGeometry(0.048, 8, 8);

    for (const [fromId, toId, colorStr] of GLOBAL_ARCS_DATA) {
      const fromCity = this.cityEntries.get(fromId);
      const toCity = this.cityEntries.get(toId);
      if (!fromCity || !toCity) continue;

      const start = fromCity.surfacePos.clone();
      const end = toCity.surfacePos.clone();
      const dist = start.distanceTo(end);

      // Compute elevated 3D control points above Earth's curvature
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const altitude = this.radius + 0.45 + dist * 0.34;
      mid.normalize().multiplyScalar(altitude);

      const ctrl1 = start.clone().lerp(mid, 0.5).normalize().multiplyScalar(this.radius + dist * 0.24);
      const ctrl2 = end.clone().lerp(mid, 0.5).normalize().multiplyScalar(this.radius + dist * 0.24);

      const curve = new THREE.CubicBezierCurve3(start, ctrl1, ctrl2, end);
      const points = curve.getPoints(56);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcColor = new THREE.Color(colorStr);
      const arcMat = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      this.arcsGroup.add(arcLine);

      // Animated Light Packet traveling along the 3D Bezier curve
      const packetMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
      });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);

      // Secondary trailing glow sphere
      const trailMat = new THREE.MeshBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: 0.65
      });
      const trailMesh = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), trailMat);

      this.arcsGroup.add(packetMesh, trailMesh);

      this.arcPackets.push({
        curve,
        packetMesh,
        trailMesh,
        progress: Math.random(),
        speed: 0.14 + Math.random() * 0.16
      });
    }
  }

  _buildOrbitalSatellites() {
    const orbitConfigs = [
      { name: 'ISS (国際宇宙ステーション)', radius: this.radius * 1.16, incX: 0.9, incZ: 0.35, speed: 0.28, color: 0xfbbf24 },
      { name: 'ALOS-4 地球観測衛星', radius: this.radius * 1.24, incX: 1.45, incZ: -0.4, speed: 0.21, color: 0x38bdf8 },
      { name: 'みちびき (QZSS) 準天頂軌道', radius: this.radius * 1.32, incX: 0.72, incZ: 0.85, speed: 0.16, color: 0x34d399 }
    ];

    orbitConfigs.forEach((cfg, idx) => {
      const orbitPivot = new THREE.Group();
      orbitPivot.rotation.x = cfg.incX;
      orbitPivot.rotation.z = cfg.incZ;

      // Dashed / Glowing Orbit Ring
      const ringPts = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * cfg.radius, 0, Math.sin(a) * cfg.radius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
      const ringMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.25
      });
      orbitPivot.add(new THREE.Line(ringGeo, ringMat));

      // 3D Satellite Model (Core Bus + Solar Array Wings)
      const satGroup = new THREE.Group();
      const bodyMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.14, 8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: cfg.color, emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.2 })
      );
      bodyMesh.rotation.z = Math.PI / 2;
      satGroup.add(bodyMesh);

      const panelMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.09, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.5, metalness: 0.9, roughness: 0.15 })
      );
      satGroup.add(panelMesh);

      orbitPivot.add(satGroup);
      this.satellitesGroup.add(orbitPivot);

      this.satellites.push({
        cfg,
        satGroup,
        angle: idx * 2.1
      });
    });
  }

  setPillarsVisible(visible) {
    this.pillarsGroup.visible = visible;
  }

  setArcsVisible(visible) {
    this.arcsGroup.visible = visible;
  }

  setSatellitesVisible(visible) {
    this.satellitesGroup.visible = visible;
  }

  setVisualMode(modeName) {
    if (modeName === 'urban') {
      this.targetPillarScale = 1.45;
      this.pillarsGroup.visible = true;
      this.arcsGroup.visible = true;
    } else if (modeName === 'holo') {
      this.targetPillarScale = 1.15;
    } else {
      this.targetPillarScale = 0.85;
    }
  }

  update(elapsedTime, deltaTime) {
    // Smoothly animate 3D population pillar height transitions
    this.currentPillarScale = THREE.MathUtils.lerp(this.currentPillarScale, this.targetPillarScale, deltaTime * 4.0);
    for (const entry of this.cityEntries.values()) {
      entry.pillarMesh.scale.y = this.currentPillarScale;
      entry.capMesh.position.y = entry.pillarHeight * this.currentPillarScale;
    }

    // Move light packets along 3D inter-city Bezier arcs
    if (this.arcsGroup.visible) {
      for (const item of this.arcPackets) {
        item.progress = (item.progress + deltaTime * item.speed) % 1.0;
        const pos = item.curve.getPointAt(item.progress);
        item.packetMesh.position.copy(pos);

        const trailT = (item.progress - 0.025 + 1.0) % 1.0;
        item.trailMesh.position.copy(item.curve.getPointAt(trailT));
      }
    }

    // Advance orbital satellites along inclined 3D orbits
    if (this.satellitesGroup.visible) {
      for (const sat of this.satellites) {
        sat.angle += deltaTime * sat.cfg.speed;
        const r = sat.cfg.radius;
        sat.satGroup.position.set(Math.cos(sat.angle) * r, 0, Math.sin(sat.angle) * r);
        sat.satGroup.rotation.y = -sat.angle;
      }
    }
  }
}
