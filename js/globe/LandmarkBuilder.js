import * as THREE from 'three';
import { LANDMARKS_DATA } from '../data/landmarksData.js';
import { latLonToVector3, createBuildingFacadeTexture } from './ProceduralTextures.js';

/**
 * Builds high-detail 3D architectural models for all 15 world landmarks
 * using curved tubular trusses, LatheGeometry domes/spires, ExtrudeGeometry arches/shells,
 * suspension cables, and illuminated window facade textures.
 */
export class LandmarkBuilder {
  constructor(globeGroup, radius = 10) {
    this.globeGroup = globeGroup;
    this.radius = radius;

    this.landmarksGroup = new THREE.Group();
    this.landmarksGroup.name = 'LandmarksGroup';
    this.globeGroup.add(this.landmarksGroup);

    this.facadeTexture = createBuildingFacadeTexture();

    this.landmarkEntries = [];
    this.interactiveMeshes = [];
    this.skylineGroups = [];
    this.animatedRings = [];
    this.rotatingParts = [];
    this.blinkingLights = [];

    this._buildAllLandmarks();
  }

  _buildAllLandmarks() {
    const upAxis = new THREE.Vector3(0, 1, 0);

    for (const data of LANDMARKS_DATA) {
      const surfacePos = latLonToVector3(data.lat, data.lon, this.radius);
      const normal = surfacePos.clone().normalize();

      const anchor = new THREE.Group();
      anchor.position.copy(surfacePos);
      anchor.quaternion.setFromUnitVectors(upAxis, normal);
      anchor.userData = { type: 'landmark', data };

      // 1. Circular Architectural Plaza & Pulsing Beacon Ring
      const plazaGeo = new THREE.CylinderGeometry(0.11, 0.125, 0.008, 32);
      const plazaMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.6,
        metalness: 0.3
      });
      const plaza = new THREE.Mesh(plazaGeo, plazaMat);
      plaza.position.y = 0.004;
      anchor.add(plaza);

      const ringGeo = new THREE.RingGeometry(0.118, 0.135, 48);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const baseRing = new THREE.Mesh(ringGeo, ringMat);
      baseRing.position.y = 0.009;
      anchor.add(baseRing);
      this.animatedRings.push(baseRing);

      // 2. High-Detail 3D Monument Group
      const monumentGroup = new THREE.Group();
      this._constructDetailedMonument(monumentGroup, data);
      anchor.add(monumentGroup);

      // 3. Textured High-Rise Urban Skyline Ring (set back outside the plaza)
      const skylineGroup = this._constructTexturedSkyline(data);
      anchor.add(skylineGroup);
      this.skylineGroups.push(skylineGroup);

      // 4. Invisible Raycast Hit Cylinder
      const hitGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.85, 12);
      hitGeo.translate(0, 0.425, 0);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { type: 'landmark', data, anchor };
      anchor.add(hitMesh);
      this.interactiveMeshes.push(hitMesh);

      this.landmarksGroup.add(anchor);
      this.landmarkEntries.push({
        id: data.id,
        data,
        anchor,
        monumentGroup,
        skylineGroup,
        baseRing,
        worldPos: new THREE.Vector3()
      });
    }
  }

  /**
   * Helper: Creates a 3D strut cylinder between two 3D points p1 and p2
   */
  _createStrut(p1, p2, radius, material) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(radius, radius, len, 6);
    geo.translate(0, len / 2, 0);
    geo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(p1);
    mesh.lookAt(p2);
    return mesh;
  }

  /**
   * Builds intricate, multi-part 3D architectural models for each landmark
   */
  _constructDetailedMonument(group, data) {
    const windowMat = new THREE.MeshStandardMaterial({
      map: this.facadeTexture,
      emissive: new THREE.Color(data.color),
      emissiveMap: this.facadeTexture,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.8
    });

    switch (data.archType) {
      case 'tokyo_tower': {
        this._buildLatticeTower(group, {
          height: 0.56,
          baseSpread: 0.088,
          topSpread: 0.011,
          tiers: 9,
          bandColors: [0xff2a1a, 0xffffff],
          hasFootBuilding: true,
          mainDeckY: 0.21,
          topDeckY: 0.38,
          windowMat
        });
        break;
      }

      case 'eiffel': {
        const bronzeMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          emissive: 0xb45309,
          emissiveIntensity: 0.45,
          metalness: 0.75,
          roughness: 0.3
        });
        const goldLightMat = new THREE.MeshStandardMaterial({
          color: 0xfde047,
          emissive: 0xfacc15,
          emissiveIntensity: 0.85,
          metalness: 0.5,
          roughness: 0.2
        });
        this._buildLatticeTower(group, {
          height: 0.54,
          baseSpread: 0.092,
          topSpread: 0.012,
          tiers: 10,
          bandColors: [0xd97706, 0xf59e0b],
          hasBaseArches: true,
          mainDeckY: 0.16,
          secondDeckY: 0.30,
          topDeckY: 0.46,
          windowMat: goldLightMat,
          archMat: bronzeMat
        });
        break;
      }

      case 'skytree': {
        this._buildTokyoSkytree(group, windowMat);
        break;
      }

      case 'statue_liberty': {
        this._buildStatueOfLiberty(group);
        break;
      }

      case 'pyramids': {
        this._buildGizaPyramidsAndSphinx(group);
        break;
      }

      case 'opera_house': {
        this._buildSydneyOperaHouse(group, windowMat);
        break;
      }

      case 'big_ben': {
        this._buildBigBenAndLondonEye(group, windowMat);
        break;
      }

      case 'burj_khalifa': {
        this._buildBurjKhalifa(group, windowMat);
        break;
      }

      case 'colosseum': {
        this._buildRomanColosseum(group);
        break;
      }

      case 'taj_mahal': {
        this._buildTajMahal(group);
        break;
      }

      case 'golden_gate': {
        this._buildGoldenGateBridge(group);
        break;
      }

      case 'christ_redeemer': {
        this._buildChristTheRedeemer(group);
        break;
      }

      case 'great_wall': {
        this._buildGreatWallOfChina(group);
        break;
      }

      case 'marina_bay': {
        this._buildMarinaBaySands(group, windowMat);
        break;
      }

      case 'sagrada_familia':
      default: {
        this._buildSagradaFamilia(group);
        break;
      }
    }
  }

  /**
   * Builds a true open-frame parabolic 4-legged lattice tower (Tokyo Tower / Eiffel Tower)
   * with curved corner legs, horizontal & X-brace truss struts, observation decks, and antenna spire.
   */
  _buildLatticeTower(group, cfg) {
    const mats = cfg.bandColors.map(
      (hex) =>
        new THREE.MeshStandardMaterial({
          color: hex,
          emissive: hex,
          emissiveIntensity: 0.38,
          metalness: 0.65,
          roughness: 0.3
        })
    );

    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]
    ];

    // Parabolic curve function for leg spread at normalized height t in [0..1]
    const getSpread = (t) => cfg.baseSpread * Math.pow(1 - t, 1.65) + cfg.topSpread;

    // 1. Optional FootTown base building (Tokyo Tower)
    if (cfg.hasFootBuilding) {
      const footTown = new THREE.Mesh(
        new THREE.BoxGeometry(cfg.baseSpread * 1.35, 0.036, cfg.baseSpread * 1.35),
        cfg.windowMat
      );
      footTown.position.y = 0.018;
      group.add(footTown);
    }

    // 2. Optional 4 decorative semi-circular base arches (Eiffel Tower)
    if (cfg.hasBaseArches) {
      const archR = cfg.baseSpread * 0.62;
      const archGeo = new THREE.TorusGeometry(archR, 0.0045, 8, 24, Math.PI);
      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((rotY) => {
        const archPivot = new THREE.Group();
        archPivot.rotation.y = rotY;
        const arch = new THREE.Mesh(archGeo, cfg.archMat || mats[0]);
        arch.position.set(0, 0.005, cfg.baseSpread * 0.82);
        archPivot.add(arch);
        group.add(archPivot);
      });
    }

    // 3. Build 4 Curved Corner Truss Legs + Horizontal & X-Bracing across tiers
    const tiers = cfg.tiers;
    const towerBodyH = cfg.height * 0.78;

    for (let i = 0; i < tiers; i++) {
      const t0 = i / tiers;
      const t1 = (i + 1) / tiers;
      const y0 = t0 * towerBodyH;
      const y1 = t1 * towerBodyH;
      const s0 = getSpread(t0);
      const s1 = getSpread(t1);
      const mat = mats[i % mats.length];
      const legRadius = 0.0055 * (1 - t0 * 0.45);
      const braceRadius = legRadius * 0.55;

      for (let c = 0; c < 4; c++) {
        const [cx, cz] = corners[c];
        const [nx, nz] = corners[(c + 1) % 4];

        const p00 = new THREE.Vector3(cx * s0, y0, cz * s0);
        const p01 = new THREE.Vector3(cx * s1, y1, cz * s1);
        const p10 = new THREE.Vector3(nx * s0, y0, nz * s0);
        const p11 = new THREE.Vector3(nx * s1, y1, nz * s1);

        // Main corner leg segment
        group.add(this._createStrut(p00, p01, legRadius, mat));
        // Horizontal girder ring
        group.add(this._createStrut(p01, p11, braceRadius * 1.15, mat));
        // Diagonal X-bracing on all 4 faces (skip bottom tier center if arch exists)
        if (!(cfg.hasBaseArches && i === 0)) {
          group.add(this._createStrut(p00, p11, braceRadius, mat));
          group.add(this._createStrut(p10, p01, braceRadius, mat));
        }
      }
    }

    // 4. Observation Decks
    const addDeck = (y, scaleSpread, height, isRound = false) => {
      const t = Math.min(1, y / towerBodyH);
      const w = getSpread(t) * scaleSpread;
      const deckGeo = isRound
        ? new THREE.CylinderGeometry(w * 1.15, w * 1.05, height, 16)
        : new THREE.BoxGeometry(w * 2.25, height, w * 2.25);
      const deck = new THREE.Mesh(deckGeo, cfg.windowMat);
      deck.position.y = y;
      group.add(deck);

      // Railing rim
      const rimGeo = isRound
        ? new THREE.CylinderGeometry(w * 1.25, w * 1.25, height * 0.28, 16)
        : new THREE.BoxGeometry(w * 2.4, height * 0.28, w * 2.4);
      const rim = new THREE.Mesh(rimGeo, mats[1] || mats[0]);
      rim.position.y = y + height * 0.55;
      group.add(rim);
    };

    if (cfg.mainDeckY) addDeck(cfg.mainDeckY, 1.15, 0.028, false);
    if (cfg.secondDeckY) addDeck(cfg.secondDeckY, 1.18, 0.022, false);
    if (cfg.topDeckY) addDeck(cfg.topDeckY, 1.35, 0.024, true);

    // 5. Segmented Broadcast Spire & Blinking Aviation Beacon
    const spireH = cfg.height - towerBodyH;
    const spireSegs = 4;
    for (let s = 0; s < spireSegs; s++) {
      const segH = spireH / spireSegs;
      const rBot = 0.009 * (1 - s / spireSegs);
      const rTop = 0.009 * (1 - (s + 0.8) / spireSegs);
      const spireMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(Math.max(0.0015, rTop), rBot, segH, 8),
        mats[s % mats.length]
      );
      spireMesh.position.y = towerBodyH + (s + 0.5) * segH;
      group.add(spireMesh);
    }

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff3b30 })
    );
    beacon.position.y = cfg.height + 0.006;
    group.add(beacon);
    this.blinkingLights.push(beacon);
  }

  /**
   * Tokyo Skytree: Tripod base morphing into cylindrical lattice cage + 2 futuristic circular decks
   */
  _buildTokyoSkytree(group, windowMat) {
    const whiteSteelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.28,
      metalness: 0.75,
      roughness: 0.25
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.4,
      roughness: 0.6
    });

    // Central Shinbashira core column
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, 0.48, 16), coreMat);
    core.position.y = 0.24;
    group.add(core);

    // Outer helical lattice cage morphing from 3 tripod corners at base to circle at Tembo Deck
    const levels = 10;
    const maxLatticeY = 0.36;
    const branches = 9;

    const getSkytreePoint = (branchIdx, levelIdx) => {
      const t = levelIdx / levels;
      const y = t * maxLatticeY;
      const baseAngle = (branchIdx / branches) * Math.PI * 2;
      // Triangular lobes at bottom (t=0) blending to circular radius at top (t=1)
      const triMod = 1 + 0.38 * Math.cos(3 * baseAngle) * (1 - t);
      const r = (0.062 * Math.pow(1 - t, 0.85) + 0.022) * triMod;
      const twistAngle = baseAngle + t * 0.42;
      return new THREE.Vector3(Math.cos(twistAngle) * r, y, Math.sin(twistAngle) * r);
    };

    for (let l = 0; l < levels; l++) {
      for (let b = 0; b < branches; b++) {
        const p00 = getSkytreePoint(b, l);
        const p01 = getSkytreePoint(b, l + 1);
        const p10 = getSkytreePoint((b + 1) % branches, l);
        const p11 = getSkytreePoint((b + 1) % branches, l + 1);

        group.add(this._createStrut(p00, p01, 0.0024, whiteSteelMat));
        group.add(this._createStrut(p01, p11, 0.0018, whiteSteelMat));
        group.add(this._createStrut(p00, p11, 0.0016, whiteSteelMat));
      }
    }

    // Tembo Deck (350m) - Outward-cantilevered 3-story observation drum
    const deck1 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.029, 0.034, 24), windowMat);
    deck1.position.y = 0.365;
    group.add(deck1);

    // Upper lattice shaft between 350m and 450m
    const upperShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.022, 0.09, 12, 3, true),
      new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.45,
        wireframe: true
      })
    );
    upperShaft.position.y = 0.42;
    group.add(upperShaft);

    // Tembo Galleria (450m) with spiral skywalk ring
    const deck2 = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.024, 0.022, 24), windowMat);
    deck2.position.y = 0.47;
    group.add(deck2);

    const galleriaTube = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.0035, 8, 24), whiteSteelMat);
    galleriaTube.rotation.x = Math.PI / 2 - 0.14;
    galleriaTube.position.y = 0.47;
    group.add(galleriaTube);

    // Digital Broadcast Gain Tower Spire (to 634m)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.011, 0.16, 12), whiteSteelMat);
    spire.position.y = 0.56;
    group.add(spire);
  }

  /**
   * Statue of Liberty: 11-pointed Star Fort + Stepped Granite Pedestal + Sculpted Patina Figure & Torch
   */
  _buildStatueOfLiberty(group) {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.7,
      metalness: 0.1
    });
    const patinaMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0d9488,
      emissiveIntensity: 0.35,
      roughness: 0.45,
      metalness: 0.3
    });
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

    // 1. 11-Pointed Star Fort (Fort Wood) using THREE.Shape + ExtrudeGeometry
    const starShape = new THREE.Shape();
    const points = 11;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 0.095 : 0.062;
      const a = (i / (points * 2)) * Math.PI * 2;
      if (i === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    starShape.closePath();

    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.026, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004 });
    starGeo.rotateX(-Math.PI / 2);
    group.add(new THREE.Mesh(starGeo, stoneMat));

    // 2. Multi-tiered Classical Granite Pedestal with colonnade indentations
    const tiers = [
      { w: 0.088, h: 0.032, y: 0.042 },
      { w: 0.072, h: 0.068, y: 0.092 },
      { w: 0.080, h: 0.016, y: 0.134 },
      { w: 0.060, h: 0.055, y: 0.170 },
      { w: 0.068, h: 0.014, y: 0.204 }
    ];
    tiers.forEach((t) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.w), stoneMat);
      m.position.y = t.y;
      group.add(m);
    });

    // 3. Sculpted Copper Statue Figure via LatheGeometry profile
    const robePoints = [
      new THREE.Vector2(0.026, 0.21),
      new THREE.Vector2(0.024, 0.25),
      new THREE.Vector2(0.019, 0.30),
      new THREE.Vector2(0.021, 0.35),
      new THREE.Vector2(0.016, 0.39),
      new THREE.Vector2(0.008, 0.41)
    ];
    const statueBody = new THREE.Mesh(new THREE.LatheGeometry(robePoints, 18), patinaMat);
    group.add(statueBody);

    // Head & 7-Spike Crown
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), patinaMat);
    head.position.y = 0.422;
    group.add(head);

    for (let s = -3; s <= 3; s++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.002, 0.018, 4), patinaMat);
      spike.position.set(Math.sin(s * 0.35) * 0.014, 0.432 + Math.cos(s * 0.35) * 0.008, 0.004);
      spike.rotation.z = -s * 0.35;
      group.add(spike);
    }

    // Left arm holding Tablet
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.028, 0.006), patinaMat);
    tablet.position.set(-0.022, 0.355, 0.012);
    tablet.rotation.z = 0.3;
    group.add(tablet);

    // Raised Right Arm & Golden Torch Flame
    const arm = this._createStrut(
      new THREE.Vector3(0.014, 0.385, 0),
      new THREE.Vector3(0.026, 0.468, 0.006),
      0.0048,
      patinaMat
    );
    group.add(arm);

    const torchCup = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.004, 0.012, 10), goldMat);
    torchCup.position.set(0.026, 0.472, 0.006);
    group.add(torchCup);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.026, 8), goldMat);
    flame.position.set(0.026, 0.49, 0.006);
    group.add(flame);
    this.blinkingLights.push(flame);
  }

  /**
   * Great Pyramids of Giza (Stepped limestone courses + Khafre smooth apex cap + Great Sphinx)
   */
  _buildGizaPyramidsAndSphinx(group) {
    const limestoneMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xa16207,
      emissiveIntensity: 0.25,
      roughness: 0.75,
      metalness: 0.1
    });
    const smoothCapMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xca8a04,
      emissiveIntensity: 0.35,
      roughness: 0.4
    });

    const buildSteppedPyramid = (cx, cz, baseRadius, height, steps, hasSmoothCap) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(cx, 0, cz);

      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        const rBot = baseRadius * (1 - t0);
        const rTop = baseRadius * (1 - t1);
        const tierH = height / steps;
        const isCap = hasSmoothCap && i >= steps - 3;

        const geo = new THREE.CylinderGeometry(rTop, rBot, tierH, 4);
        const mesh = new THREE.Mesh(geo, isCap ? smoothCapMat : limestoneMat);
        mesh.position.y = (i + 0.5) * tierH;
        mesh.rotation.y = Math.PI / 4;
        pGroup.add(mesh);
      }
      group.add(pGroup);
    };

    // Khufu (Great Pyramid), Khafre (with preserved smooth casing stones at apex), Menkaure
    buildSteppedPyramid(-0.055, -0.045, 0.088, 0.155, 14, false);
    buildSteppedPyramid(0.028, 0.020, 0.082, 0.148, 14, true);
    buildSteppedPyramid(0.088, 0.072, 0.048, 0.086, 10, false);

    // 3 Queen's Pyramids next to Menkaure
    [-0.028, 0, 0.028].forEach((ox) => {
      buildSteppedPyramid(0.088 + ox, 0.118, 0.016, 0.028, 5, false);
    });

    // Great Sphinx Monument in front of Khafre
    const sphinxBody = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.016, 0.045), limestoneMat);
    sphinxBody.position.set(0.078, 0.008, -0.025);
    group.add(sphinxBody);

    const sphinxHead = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, 0.018, 6), smoothCapMat);
    sphinxHead.position.set(0.078, 0.022, -0.008);
    group.add(sphinxHead);
  }

  /**
   * Sydney Opera House: Interlocking curved spherical-vaulted ribbed sails on harbour concourse
   */
  _buildSydneyOperaHouse(group, windowMat) {
    const podiumMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.6 });
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.15,
      side: THREE.DoubleSide
    });

    // Bennelong Point Granite Podium & Broad Steps
    const podium = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.024, 0.13), podiumMat);
    podium.position.y = 0.012;
    group.add(podium);

    // Curved Vaulted Sail Builder using extruded pointed-arch shell profile
    const createVaultedSail = (w, h, d, tiltZ, rotY, pos) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(w * 0.9, h * 0.55, 0, h);
      shape.lineTo(-w * 0.15, h * 0.82);
      shape.quadraticCurveTo(w * 0.52, h * 0.42, -w * 0.12, 0);
      shape.closePath();

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: d,
        bevelEnabled: true,
        bevelThickness: 0.003,
        bevelSize: 0.003,
        curveSegments: 16
      });
      geo.center();
      const mesh = new THREE.Mesh(geo, shellMat);
      mesh.position.copy(pos);
      mesh.rotation.z = tiltZ;
      mesh.rotation.y = rotY;
      group.add(mesh);

      // Glazed glass curtain wall nestled inside the vault mouth
      const glass = new THREE.Mesh(new THREE.ConeGeometry(w * 0.45, h * 0.72, 4), windowMat);
      glass.position.copy(pos).add(new THREE.Vector3(0.008, -h * 0.12, 0));
      group.add(glass);
    };

    // Main Concert Hall Vaults (4 interlocking shells)
    createVaultedSail(0.055, 0.145, 0.036, -0.22, 0.12, new THREE.Vector3(-0.052, 0.082, -0.018));
    createVaultedSail(0.048, 0.125, 0.032, -0.18, 0.12, new THREE.Vector3(-0.020, 0.072, -0.018));
    createVaultedSail(0.038, 0.098, 0.028, -0.12, 0.12, new THREE.Vector3(0.008, 0.060, -0.018));
    createVaultedSail(0.032, 0.075, 0.024, 0.25, 0.12, new THREE.Vector3(-0.072, 0.052, -0.018));

    // Joan Sutherland Theatre Vaults (Parallel second row)
    createVaultedSail(0.046, 0.118, 0.030, -0.22, -0.08, new THREE.Vector3(-0.022, 0.070, 0.026));
    createVaultedSail(0.038, 0.096, 0.026, -0.16, -0.08, new THREE.Vector3(0.008, 0.058, 0.026));
    createVaultedSail(0.030, 0.075, 0.022, -0.10, -0.08, new THREE.Vector3(0.034, 0.048, 0.026));
  }

  /**
   * Big Ben (Elizabeth Tower with 4 illuminated clock dials, Gothic buttresses & spire),
   * Palace of Westminster, and London Eye (with spokes, A-frame legs & 24 passenger capsules)
   */
  _buildBigBenAndLondonEye(group, windowMat) {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xd97706,
      emissiveIntensity: 0.28,
      roughness: 0.5,
      metalness: 0.2
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3
    });
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // 1. Elizabeth Tower (Big Ben)
    const tx = -0.048;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.24, 0.038), stoneMat);
    shaft.position.set(tx, 0.12, 0);
    group.add(shaft);

    // 4 Corner Gothic Buttress Pillars
    [
      [-0.02, -0.02],
      [0.02, -0.02],
      [0.02, 0.02],
      [-0.02, 0.02]
    ].forEach(([bx, bz]) => {
      const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.28, 0.006), stoneMat);
      buttress.position.set(tx + bx, 0.14, bz);
      group.add(buttress);
    });

    // Belfry Clock Housing (wider upper section)
    const clockBox = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.048, 0.046), stoneMat);
    clockBox.position.set(tx, 0.255, 0);
    group.add(clockBox);

    // 4 Illuminated Clock Faces with Gold Rim & Hands on all 4 sides
    const dialGeo = new THREE.CircleGeometry(0.016, 20);
    const rimGeo = new THREE.RingGeometry(0.015, 0.018, 20);
    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((rotY) => {
      const faceGroup = new THREE.Group();
      faceGroup.position.set(tx, 0.255, 0);
      faceGroup.rotation.y = rotY;

      const dial = new THREE.Mesh(dialGeo, dialMat);
      dial.position.z = 0.0235;
      const rim = new THREE.Mesh(rimGeo, goldMat);
      rim.position.z = 0.024;
      faceGroup.add(dial, rim);
      group.add(faceGroup);
    });

    // Stepped Gothic Spire & Ayrton Light Lantern
    const lowerSpire = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.055, 4), roofMat);
    lowerSpire.position.set(tx, 0.305, 0);
    lowerSpire.rotation.y = Math.PI / 4;
    group.add(lowerSpire);

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.026, 0.022), goldMat);
    lantern.position.set(tx, 0.335, 0);
    group.add(lantern);

    const upperSpire = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.065, 4), roofMat);
    upperSpire.position.set(tx, 0.375, 0);
    upperSpire.rotation.y = Math.PI / 4;
    group.add(upperSpire);

    // 2. Palace of Westminster Riverfront Wing with Gothic Pinnacles
    const palace = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.058, 0.042), windowMat);
    palace.position.set(-0.075, 0.029, -0.032);
    group.add(palace);

    for (let p = 0; p < 6; p++) {
      const pin = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.028, 4), stoneMat);
      pin.position.set(-0.125 + p * 0.02, 0.072, -0.012);
      group.add(pin);
    }

    // 3. Detailed London Eye Observation Wheel (with A-frame legs, spokes & 20 capsules)
    const wheelCenter = new THREE.Vector3(0.062, 0.115, 0.025);
    const wheelR = 0.088;

    // A-frame support legs
    group.add(this._createStrut(new THREE.Vector3(0.042, 0, 0.005), wheelCenter, 0.0035, dialMat));
    group.add(this._createStrut(new THREE.Vector3(0.082, 0, 0.005), wheelCenter, 0.0035, dialMat));

    const wheelGroup = new THREE.Group();
    wheelGroup.position.copy(wheelCenter);

    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.7
    });

    const mainRim = new THREE.Mesh(new THREE.TorusGeometry(wheelR, 0.004, 10, 36), cyanMat);
    wheelGroup.add(mainRim);

    const capsules = 20;
    for (let i = 0; i < capsules; i++) {
      const a = (i / capsules) * Math.PI * 2;
      const cx = Math.cos(a) * wheelR;
      const cy = Math.sin(a) * wheelR;

      // Tension spoke cable
      wheelGroup.add(this._createStrut(new THREE.Vector3(0, 0, 0), new THREE.Vector3(cx, cy, 0), 0.001, dialMat));

      // Ovoid passenger capsule pod
      const pod = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 8, 8), dialMat);
      pod.scale.set(1.3, 0.85, 0.85);
      pod.position.set(cx * 1.06, cy * 1.06, 0);
      wheelGroup.add(pod);
    }

    group.add(wheelGroup);
    this.rotatingParts.push(wheelGroup);
  }

  /**
   * Burj Khalifa: True Y-shaped tripartite floor plan with 18 spiraling setback tiers
   */
  _buildBurjKhalifa(group, windowMat) {
    const silverGlassMat = new THREE.MeshStandardMaterial({
      map: this.facadeTexture,
      color: 0xbae6fd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.12
    });

    // Central hexagonal high-rise core
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.022, 0.56, 6), silverGlassMat);
    core.position.y = 0.28;
    group.add(core);

    // 3 Y-Wing Buttresses with spiraling setback heights
    const setbacks = 18;
    for (let s = 0; s < setbacks; s++) {
      const wingIdx = s % 3;
      const angle = (wingIdx * Math.PI * 2) / 3;
      const t = s / setbacks;
      const tierHeight = 0.06 + (1 - t) * 0.46;
      const wingLength = 0.014 + (1 - t) * 0.048;
      const wingWidth = 0.010 + (1 - t) * 0.012;

      const wingPivot = new THREE.Group();
      wingPivot.rotation.y = angle;

      // Rounded-tip wing lobe
      const wingMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(wingWidth * 0.82, wingWidth, tierHeight, 8),
        s % 2 === 0 ? silverGlassMat : windowMat
      );
      wingMesh.scale.set(1, 1, wingLength / wingWidth);
      wingMesh.position.set(0, tierHeight / 2, wingLength * 0.55);
      wingPivot.add(wingMesh);

      // Glowing setback terrace ring cap
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(wingWidth * 0.88, wingWidth * 0.88, 0.004, 8),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
      );
      cap.scale.set(1, 1, wingLength / wingWidth);
      cap.position.set(0, tierHeight, wingLength * 0.55);
      wingPivot.add(cap);

      group.add(wingPivot);
    }

    // Telescopic Spire (reaching 0.72 units total height)
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0012, 0.006, 0.18, 8),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
    );
    spire.position.y = 0.63;
    group.add(spire);
  }

  /**
   * Roman Colosseum: Multi-story arcaded elliptical amphitheatre with preserved outer northern facade
   * and exposed inner seating tiers
   */
  _buildRomanColosseum(group) {
    const travertineMat = new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      emissive: 0xea580c,
      emissiveIntensity: 0.25,
      roughness: 0.65,
      metalness: 0.1
    });
    const innerStoneMat = new THREE.MeshStandardMaterial({
      color: 0xfed7aa,
      emissive: 0xc2410c,
      emissiveIntensity: 0.2,
      roughness: 0.75
    });

    const cols = 36;
    const rx = 0.105;
    const rz = 0.086;

    // 4 Stacked Stories of Arched Pillars around the Ellipse
    for (let floor = 0; floor < 4; floor++) {
      const y = floor * 0.024;
      const floorH = 0.022;

      // Cornice ring band for each story
      const ringPts = [];
      for (let i = 0; i <= cols; i++) {
        const a = (i / cols) * Math.PI * 2;
        // Top 2 stories preserved on North half (authentic Colosseum silhouette!)
        if (floor >= 2 && Math.sin(a) > 0.25) continue;
        ringPts.push(new THREE.Vector3(Math.cos(a) * rx, y + floorH, Math.sin(a) * rz));
      }
      if (ringPts.length > 2) {
        const curve = new THREE.CatmullRomCurve3(ringPts, floor < 2);
        const cornice = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.0045, 6, floor < 2), travertineMat);
        group.add(cornice);
      }

      // Travertine Arcade Piers
      for (let i = 0; i < cols; i++) {
        const a = (i / cols) * Math.PI * 2;
        if (floor >= 2 && Math.sin(a) > 0.2) continue;

        const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.0038, 0.0042, floorH, 6), travertineMat);
        pier.position.set(Math.cos(a) * rx, y + floorH / 2, Math.sin(a) * rz);
        group.add(pier);
      }
    }

    // Inner Cavea (Stepped Amphitheatre Seating Bowl)
    for (let t = 0; t < 4; t++) {
      const scale = 0.85 - t * 0.14;
      const tierH = 0.052 - t * 0.011;
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(rx * scale, rx * (scale - 0.08), tierH, 32, 1, true),
        innerStoneMat
      );
      ring.scale.set(1, 1, rz / rx);
      ring.position.y = tierH / 2;
      group.add(ring);
    }

    // Central Hypogeum Arena Floor
    const arena = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 24), innerStoneMat);
    arena.scale.set(1, 1, rz / rx);
    arena.position.y = 0.004;
    group.add(arena);
  }

  /**
   * Taj Mahal: Marble plinth, chamfered mausoleum with recessed iwan arches,
   * LatheGeometry bulbous onion dome + 4 corner chhatris + 4 3-balcony minarets + reflecting pool
   */
  _buildTajMahal(group) {
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef3c7,
      emissiveIntensity: 0.35,
      roughness: 0.22,
      metalness: 0.15
    });
    const archDarkMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5
    });
    const goldFinialMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Raised White Marble Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.022, 0.165), marbleMat);
    plinth.position.y = 0.011;
    group.add(plinth);

    // Chamfered Octagonal Mausoleum Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.072, 8), marbleMat);
    body.position.y = 0.058;
    body.rotation.y = Math.PI / 8;
    group.add(body);

    // 4 Grand Pishtaq Iwan Arch Portals on N/S/E/W facades
    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((rotY) => {
      const portalPivot = new THREE.Group();
      portalPivot.rotation.y = rotY;

      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.082, 0.012), marbleMat);
      frame.position.set(0, 0.063, 0.049);

      const archNiche = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.058, 0.014), archDarkMat);
      archNiche.position.set(0, 0.052, 0.050);

      portalPivot.add(frame, archNiche);
      group.add(portalPivot);
    });

    // Bulbous Onion Dome via LatheGeometry profile
    const domePts = [
      new THREE.Vector2(0.028, 0.094),
      new THREE.Vector2(0.030, 0.112),
      new THREE.Vector2(0.036, 0.132),
      new THREE.Vector2(0.032, 0.152),
      new THREE.Vector2(0.018, 0.168),
      new THREE.Vector2(0.005, 0.180),
      new THREE.Vector2(0.000, 0.188)
    ];
    const mainDome = new THREE.Mesh(new THREE.LatheGeometry(domePts, 24), marbleMat);
    group.add(mainDome);

    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.0025, 0.028, 8), goldFinialMat);
    finial.position.y = 0.20;
    group.add(finial);

    // 4 Corner Chhatris (Smaller domed kiosks on the roof) & 4 Corner Minarets
    const minaretOffsets = [
      [-0.072, -0.072],
      [0.072, -0.072],
      [-0.072, 0.072],
      [0.072, 0.072]
    ];

    minaretOffsets.forEach(([mx, mz]) => {
      // Corner Chhatri on mausoleum roof
      const chhatri = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), marbleMat);
      chhatri.scale.set(1, 1.35, 1);
      chhatri.position.set(mx * 0.42, 0.105, mz * 0.42);
      group.add(chhatri);

      // Tapered Minaret Shaft with 3 Balcony Rings & Dome Cap
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0085, 0.135, 12), marbleMat);
      shaft.position.set(mx, 0.088, mz);
      group.add(shaft);

      [0.055, 0.095, 0.135].forEach((by) => {
        const balcony = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.009, 0.004, 12), goldFinialMat);
        balcony.position.set(mx, 0.022 + by, mz);
        group.add(balcony);
      });

      const minCap = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 10, 8), marbleMat);
      minCap.position.set(mx, 0.168, mz);
      group.add(minCap);
    });
  }

  /**
   * Golden Gate Bridge: Art Deco stepped twin portal towers, catenary main cables & 36 vertical suspenders
   */
  _buildGoldenGateBridge(group) {
    const intlOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.45,
      metalness: 0.7,
      roughness: 0.3
    });
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.5,
      roughness: 0.5
    });
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      emissive: 0xf97316,
      emissiveIntensity: 0.35
    });

    const towerX = [-0.085, 0.085];
    const bridgeZ = 0.015;
    const towerH = 0.25;
    const deckY = 0.072;

    // 1. Twin Art Deco Multi-Strut Towers
    towerX.forEach((tx) => {
      // Concrete pier base
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.018, 12), deckMat);
      pier.scale.set(0.8, 1, 1.5);
      pier.position.set(tx, 0.009, 0);
      group.add(pier);

      // Left & Right vertical legs
      [-bridgeZ, bridgeZ].forEach((tz) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.011, towerH, 0.009), intlOrangeMat);
        leg.position.set(tx, towerH / 2 + 0.01, tz);
        group.add(leg);
      });

      // 4 Horizontal Art Deco Portal Cross-Struts above & below deck
      [0.04, 0.11, 0.165, 0.22, 0.255].forEach((sy) => {
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.009, bridgeZ * 2.2), intlOrangeMat);
        cross.position.set(tx, sy, 0);
        group.add(cross);
      });
    });

    // 2. Roadway Truss Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.009, bridgeZ * 2.1), deckMat);
    deck.position.y = deckY;
    group.add(deck);

    // 3. Parabolic Main Suspension Cables & Vertical Suspender Ropes on both sides
    const getCableY = (x) => {
      const absX = Math.abs(x);
      if (absX <= 0.085) {
        // Center span parabola between towers
        const u = x / 0.085;
        return 0.086 + u * u * (towerH + 0.01 - 0.086);
      } else {
        // Side span catenary from tower to anchorage
        const u = (absX - 0.085) / (0.16 - 0.085);
        return (towerH + 0.01) * (1 - u) + deckY * u + 0.02 * Math.sin(u * Math.PI);
      }
    };

    [-bridgeZ, bridgeZ].forEach((cz) => {
      const pts = [];
      for (let s = -24; s <= 24; s++) {
        const x = (s / 24) * 0.16;
        pts.push(new THREE.Vector3(x, getCableY(x), cz));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const mainCable = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.0028, 6, false), intlOrangeMat);
      group.add(mainCable);

      // Vertical Suspender Ropes
      for (let s = -18; s <= 18; s += 2) {
        const x = (s / 20) * 0.15;
        if (Math.abs(Math.abs(x) - 0.085) < 0.008) continue;
        const topY = getCableY(x);
        const rope = this._createStrut(
          new THREE.Vector3(x, deckY, cz),
          new THREE.Vector3(x, topY, cz),
          0.0009,
          cableMat
        );
        group.add(rope);
      }
    });
  }

  /**
   * Christ the Redeemer: Multi-faceted Corcovado granite peak, viewing terrace & sculpted statue
   */
  _buildChristTheRedeemer(group) {
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: 0x064e3b,
      emissiveIntensity: 0.25,
      roughness: 0.85,
      flatShading: true
    });
    const soapstoneMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xe2e8f0,
      emissiveIntensity: 0.45,
      roughness: 0.3
    });

    // Multi-peak Corcovado Mountain Cliff
    const mainPeak = new THREE.Mesh(new THREE.ConeGeometry(0.088, 0.19, 9), rockMat);
    mainPeak.position.y = 0.095;
    group.add(mainPeak);

    const sideRidge = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.13, 7), rockMat);
    sideRidge.position.set(-0.04, 0.065, 0.025);
    group.add(sideRidge);

    // Octagonal Art Deco Pedestal at Summit
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.042, 8), soapstoneMat);
    pedestal.position.y = 0.205;
    group.add(pedestal);

    // Sculpted Robe Torso via LatheGeometry
    const torsoPts = [
      new THREE.Vector2(0.016, 0.225),
      new THREE.Vector2(0.014, 0.275),
      new THREE.Vector2(0.018, 0.325),
      new THREE.Vector2(0.011, 0.345)
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 16), soapstoneMat);
    group.add(torso);

    // Outstretched Arms
    const arms = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.115, 10), soapstoneMat);
    arms.rotation.z = Math.PI / 2;
    arms.position.y = 0.322;
    group.add(arms);

    // Slightly bowed Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 12), soapstoneMat);
    head.scale.set(0.9, 1.2, 0.95);
    head.position.set(0, 0.358, 0.003);
    group.add(head);
  }

  /**
   * Great Wall of China: Winding mountain ridge + crenellated stone ramparts + 4 arched watchtowers
   */
  _buildGreatWallOfChina(group) {
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.85,
      flatShading: true
    });
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xa16207,
      emissiveIntensity: 0.3,
      roughness: 0.6
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.5
    });

    const waypoints = [
      new THREE.Vector3(-0.11, 0.035, -0.045),
      new THREE.Vector3(-0.04, 0.075, 0.028),
      new THREE.Vector3(0.035, 0.055, -0.025),
      new THREE.Vector3(0.11, 0.095, 0.035)
    ];

    const curve = new THREE.CatmullRomCurve3(waypoints);

    // Mountain ridge base beneath the wall
    const ridgeGeo = new THREE.TubeGeometry(curve, 36, 0.028, 6, false);
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.scale.set(1, 1.5, 1);
    ridge.position.y = -0.018;
    group.add(ridge);

    // Fortified Stone Wall Segments with Merlon Battlements
    const samples = 28;
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.028, 0.014), wallMat);
      seg.position.copy(pt);
      seg.lookAt(pt.clone().add(tangent));
      group.add(seg);

      // Crenellation battlements along top edge
      if (i % 2 === 0) {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.007, 0.006), wallMat);
        merlon.position.copy(pt).add(new THREE.Vector3(0, 0.017, 0));
        merlon.lookAt(pt.clone().add(tangent).add(new THREE.Vector3(0, 0.017, 0)));
        group.add(merlon);
      }
    }

    // 4 Two-Story Watchtowers (敵楼) with Curved Eaves
    waypoints.forEach((wp) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.052, 0.032), wallMat);
      tower.position.copy(wp).add(new THREE.Vector3(0, 0.018, 0));
      group.add(tower);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.018, 4), roofMat);
      roof.position.copy(wp).add(new THREE.Vector3(0, 0.052, 0));
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
    });
  }

  /**
   * Marina Bay Sands: 3 curving double-leg hotel towers + cantilevered SkyPark hull + Lotus Museum
   */
  _buildMarinaBaySands(group, windowMat) {
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.4,
      metalness: 0.6,
      roughness: 0.25
    });
    const poolMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

    // 3 Curving Hotel Towers (each composed of 2 leaning slabs that merge at the top)
    [-0.056, 0, 0.056].forEach((ox) => {
      const tGroup = new THREE.Group();
      tGroup.position.x = ox;

      const straightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.21, 0.016), windowMat);
      straightLeg.position.set(0, 0.105, -0.006);

      const slopingLeg = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.215, 0.016), windowMat);
      slopingLeg.position.set(0, 0.105, 0.012);
      slopingLeg.rotation.x = -0.16;

      tGroup.add(straightLeg, slopingLeg);
      group.add(tGroup);
    });

    // Cantilevered SkyPark Ship Hull across the top of all 3 towers
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-0.082, -0.018);
    hullShape.lineTo(0.095, -0.018);
    hullShape.quadraticCurveTo(0.125, 0, 0.095, 0.018);
    hullShape.lineTo(-0.082, 0.018);
    hullShape.quadraticCurveTo(-0.095, 0, -0.082, -0.018);

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004
    });
    hullGeo.rotateX(Math.PI / 2);
    const skyPark = new THREE.Mesh(hullGeo, hullMat);
    skyPark.position.set(0.008, 0.222, 0);
    group.add(skyPark);

    // Glowing Infinity Pool strip on top of SkyPark
    const pool = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.003, 0.014), poolMat);
    pool.position.set(0.005, 0.224, 0.006);
    group.add(pool);

    // ArtScience Lotus Museum in front of Marina Bay Sands
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(0.055, 0.018, 0.058);
    for (let p = 0; p < 8; p++) {
      const a = (p / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.032, 5), hullMat);
      petal.position.set(Math.cos(a) * 0.014, 0.01, Math.sin(a) * 0.014);
      petal.rotation.z = -Math.cos(a) * 0.55;
      petal.rotation.x = Math.sin(a) * 0.55;
      lotusGroup.add(petal);
    }
    group.add(lotusGroup);
  }

  /**
   * Sagrada Família: Organic hyperboloid LatheGeometry spires, Nativity/Passion facades,
   * Virgin Mary Star tower, and towering central Jesus Christ Spire with 4-armed cross
   */
  _buildSagradaFamilia(group) {
    const sandstoneMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xd97706,
      emissiveIntensity: 0.32,
      roughness: 0.55,
      metalness: 0.15
    });
    const pinnacleMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
    const starMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Cruciform Basilica Nave & Transept
    const nave = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.068, 0.135), sandstoneMat);
    nave.position.y = 0.034;
    group.add(nave);

    const transept = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.068, 0.058), sandstoneMat);
    transept.position.y = 0.034;
    group.add(transept);

    // Helper for Gaudi's signature parabolic spindle bell towers
    const createGaudiSpire = (x, z, radius, height, capMat) => {
      const pts = [
        new THREE.Vector2(radius, 0),
        new THREE.Vector2(radius * 1.05, height * 0.35),
        new THREE.Vector2(radius * 0.85, height * 0.68),
        new THREE.Vector2(radius * 0.42, height * 0.90),
        new THREE.Vector2(0.002, height)
      ];
      const spire = new THREE.Mesh(new THREE.LatheGeometry(pts, 12), sandstoneMat);
      spire.position.set(x, 0.035, z);
      group.add(spire);

      const finial = new THREE.Mesh(new THREE.OctahedronGeometry(radius * 0.55, 0), capMat);
      finial.position.set(x, 0.035 + height + 0.008, z);
      group.add(finial);
    };

    // 4 Nativity Facade Spires (East) & 4 Passion Facade Spires (West)
    [-0.024, -0.008, 0.008, 0.024].forEach((zOff, idx) => {
      const h = idx === 1 || idx === 2 ? 0.175 : 0.15;
      createGaudiSpire(0.052, zOff, 0.011, h, pinnacleMat);
      createGaudiSpire(-0.052, zOff, 0.011, h, pinnacleMat);
    });

    // 4 Evangelist Spires surrounding the center
    [
      [-0.022, -0.022],
      [0.022, -0.022],
      [-0.022, 0.022],
      [0.022, 0.022]
    ].forEach(([ex, ez]) => {
      createGaudiSpire(ex, ez, 0.013, 0.22, pinnacleMat);
    });

    // Tower of the Virgin Mary (North apse) with 12-pointed glowing blue/white star
    createGaudiSpire(0, -0.042, 0.015, 0.235, starMat);

    // Central Tower of Jesus Christ (172.5m - tallest central spire)
    createGaudiSpire(0, 0, 0.020, 0.31, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  }

  /**
   * Builds a textured high-rise urban skyline in a ring OUTSIDE the landmark plaza
   * using window-grid facade textures, stepped setbacks, and cylindrical/octagonal towers.
   */
  _constructTexturedSkyline(data) {
    const skyline = new THREE.Group();
    const count = data.skylineDensity || 18;

    const glassTowerMat = new THREE.MeshStandardMaterial({
      map: this.facadeTexture,
      emissive: new THREE.Color(data.color),
      emissiveMap: this.facadeTexture,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.8
    });

    const roofAccentMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(data.color)
    });

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.18;
      // Keep buildings outside radius 0.185 so the central landmark plaza is completely unobstructed
      const dist = 0.185 + (i % 4) * 0.052;
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;

      const popFactor = Math.min(1.5, Math.max(0.65, Math.sqrt(data.urbanPopM) / 4));
      const h = (0.042 + ((i * 19) % 10) * 0.015) * popFactor * (1.2 - dist * 1.4);
      const safeH = Math.max(0.028, h);
      const r = 0.012 + (i % 3) * 0.004;

      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(bx, 0, bz);
      bldgGroup.rotation.y = angle;

      // Vary building silhouettes: octagonal towers, stepped setback skyscrapers, and tapered towers
      const style = i % 3;
      if (style === 0) {
        // Stepped setback high-rise
        const lower = new THREE.Mesh(new THREE.BoxGeometry(r * 2, safeH * 0.65, r * 2), glassTowerMat);
        lower.position.y = safeH * 0.325;
        const upper = new THREE.Mesh(new THREE.BoxGeometry(r * 1.4, safeH * 0.35, r * 1.4), glassTowerMat);
        upper.position.y = safeH * 0.825;
        bldgGroup.add(lower, upper);
      } else if (style === 1) {
        // Octagonal / Cylindrical glass curtain tower
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 1.1, safeH, 8), glassTowerMat);
        cyl.position.y = safeH / 2;
        bldgGroup.add(cyl);
      } else {
        // Tapered modern prism skyscraper with rooftop spire
        const prism = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r * 1.15, safeH, 4), glassTowerMat);
        prism.position.y = safeH / 2;
        prism.rotation.y = Math.PI / 4;
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.0025, safeH * 0.25, 6), roofAccentMat);
        spire.position.y = safeH * 1.12;
        bldgGroup.add(prism, spire);
      }

      skyline.add(bldgGroup);
    }

    return skyline;
  }

  setLandmarkScale(scale) {
    for (const entry of this.landmarkEntries) {
      entry.monumentGroup.scale.setScalar(scale);
      entry.skylineGroup.scale.setScalar(scale);
    }
  }

  setLandmarksVisible(visible) {
    this.landmarksGroup.visible = visible;
  }

  setSkylinesVisible(visible) {
    for (const sg of this.skylineGroups) {
      sg.visible = visible;
    }
  }

  update(elapsedTime, deltaTime) {
    const pulse = 1 + 0.14 * Math.sin(elapsedTime * 3.0);
    for (const ring of this.animatedRings) {
      ring.scale.setScalar(pulse);
    }
    for (const wheel of this.rotatingParts) {
      wheel.rotation.z += deltaTime * 0.35;
    }
    const blinkOn = Math.sin(elapsedTime * 6.0) > 0;
    for (const light of this.blinkingLights) {
      light.visible = blinkOn;
    }
  }
}
