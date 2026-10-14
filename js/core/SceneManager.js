import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { latLonToVector3 } from '../globe/ProceduralTextures.js?v=6';

export class SceneManager {
  constructor(container, radius = 10) {
    this.container = container;
    this.radius = radius;

    this.scene = new THREE.Scene();
    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    this.isMobile = window.matchMedia('(max-width: 960px)').matches;
    this.autoRotateSpeed = 0.3;
    this.isCloseUpMode = false;
    this.isMoonViewMode = false;
    this.moonAngleIndex = 0;
    this.focusedLocalPos = null;

    // Camera transition state
    this.cameraAnim = {
      active: false,
      progress: 0,
      duration: 1.35,
      startCamPos: new THREE.Vector3(),
      endCamPos: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
      endTarget: new THREE.Vector3()
    };

    this._initCamera();
    this._initRenderer();
    this._initLights();
    this._initPostProcessing();
    this._initControls();
    this._initResizeListener();
  }

  _initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 600);
    // Start far away for cinematic intro zoom-in, facing Japan/Asia initially
    this.camera.position.set(-24, 16, -36);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile,
      powerPreference: 'high-performance'
    });
    const maxDpr = this.isMobile ? 1.75 : 2.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);
  }

  _initLights() {
    this.ambientLight = new THREE.AmbientLight(0x94a3b8, 0.9);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.75);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    this.sunLight.position.set(40, 15, 25);
    this.scene.add(this.sunLight);
  }

  _initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomRes = new THREE.Vector2(
      Math.floor(window.innerWidth / (this.isMobile ? 2 : 1)),
      Math.floor(window.innerHeight / (this.isMobile ? 2 : 1))
    );
    this.bloomPass = new UnrealBloomPass(bloomRes, 0.85, 0.45, 0.22);
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 85;
    this.controls.rotateSpeed = this.isMobile ? 0.65 : 0.75;
    this.controls.zoomSpeed = 0.9;
  }

  /**
   * Cinematic intro fly-in centered on East Asia / Tokyo while showing the Moon in background orbit
   */
  playIntroFlyIn() {
    const tokyoPos = latLonToVector3(30, 138, this.radius);
    const normal = tokyoPos.clone().normalize();
    const targetCamDist = this.isMobile ? 27.5 : 23.5;
    const endCamPos = normal.multiplyScalar(targetCamDist);

    this.startCameraTransition(endCamPos, new THREE.Vector3(0, 0, 0), 1.8);
  }

  /**
   * Smoothly flies the camera to a specific (lat, lon) coordinate on the globe.
   */
  flyToCoordinate(lat, lon, streetCloseUp = false) {
    this.isMoonViewMode = false;
    const localPos = latLonToVector3(lat, lon, this.radius);
    this.focusedLocalPos = localPos.clone();
    const worldSurfacePos = localPos.clone().applyMatrix4(this.globeGroup.matrixWorld);
    const outwardNormal = worldSurfacePos.clone().normalize();

    if (streetCloseUp) {
      this.isCloseUpMode = true;
      this.controls.minDistance = 0.65;

      const targetPos = worldSurfacePos.clone().addScaledVector(outwardNormal, 0.14);

      const upVec = new THREE.Vector3(0, 1, 0);
      const eastTangent = new THREE.Vector3().crossVectors(upVec, outwardNormal).normalize();
      if (eastTangent.lengthSq() < 0.01) eastTangent.set(1, 0, 0);
      const northTangent = new THREE.Vector3().crossVectors(outwardNormal, eastTangent).normalize();

      const camOffset = outwardNormal
        .clone()
        .multiplyScalar(this.isMobile ? 1.85 : 1.45)
        .addScaledVector(eastTangent, 1.35)
        .addScaledVector(northTangent, -1.05);

      const endCamPos = worldSurfacePos.clone().add(camOffset);
      this.startCameraTransition(endCamPos, targetPos, 1.3);
    } else {
      this.isCloseUpMode = false;
      this.controls.minDistance = this.radius * 1.16;
      const dist = this.isMobile ? 19.5 : 16.8;
      const endCamPos = outwardNormal.multiplyScalar(dist);
      this.startCameraTransition(endCamPos, new THREE.Vector3(0, 0, 0), 1.2);
    }
  }

  /**
   * Smoothly flies the camera to the 3D Moon in Lunar Orbit.
   * Alternates between two perspectives when clicked repeatedly:
   * - Angle 0: "Earthrise" over the Lunar Horizon (Moon in foreground + glowing Earth rising behind it)
   * - Angle 1: Sunlit Lunar Crater Close-Up (Direct orbit around the sunlit lunar hemisphere)
   */
  flyToMoon(earthBuilder) {
    const wasAlreadyInMoonMode = this.isMoonViewMode;
    this.isCloseUpMode = false;
    this.isMoonViewMode = true;
    this.controls.minDistance = earthBuilder.moonRadius * 1.35;

    if (wasAlreadyInMoonMode) {
      this.moonAngleIndex = (this.moonAngleIndex + 1) % 2;
    } else {
      this.moonAngleIndex = 0;
    }

    if (earthBuilder.moonSystemGroup) {
      earthBuilder.moonSystemGroup.updateMatrixWorld(true);
    }
    const moonWorldPos = earthBuilder.getMoonWorldPosition(new THREE.Vector3());
    const earthToMoonDir = moonWorldPos.clone().normalize();
    const sideTangent = new THREE.Vector3(-earthToMoonDir.z, 0.22, earthToMoonDir.x).normalize();

    if (this.moonAngleIndex === 0) {
      // Angle 0: Earthrise Over Lunar Horizon (Moon on side of frame, Earth glowing behind its limb)
      const endCamPos = moonWorldPos
        .clone()
        .addScaledVector(earthToMoonDir, earthBuilder.moonRadius * 2.85)
        .addScaledVector(sideTangent, earthBuilder.moonRadius * 1.35);

      const lookTarget = moonWorldPos.clone().lerp(new THREE.Vector3(0, 0, 0), 0.14);
      this.startCameraTransition(endCamPos, lookTarget, 1.4);
    } else {
      // Angle 1: Sunlit Crater Close-Up Orbit centered directly on the Moon
      const sunDir = earthBuilder.sunDirection.clone().normalize();
      const endCamPos = moonWorldPos
        .clone()
        .addScaledVector(sunDir, earthBuilder.moonRadius * 2.45)
        .addScaledVector(sideTangent, earthBuilder.moonRadius * 0.95);

      this.startCameraTransition(endCamPos, moonWorldPos, 1.25);
    }
  }

  resetCameraToOverview() {
    this.isCloseUpMode = false;
    this.isMoonViewMode = false;
    this.controls.minDistance = this.radius * 1.16;

    const currentDir = this.camera.position.clone().normalize();
    if (currentDir.lengthSq() < 0.01) currentDir.set(0, 0.3, 1).normalize();
    const dist = this.isMobile ? 26.5 : 22.8;
    const endCamPos = currentDir.multiplyScalar(dist);

    this.startCameraTransition(endCamPos, new THREE.Vector3(0, 0, 0), 1.25);
  }

  startCameraTransition(endCamPos, endTarget, duration = 1.2) {
    this.cameraAnim.active = true;
    this.cameraAnim.progress = 0;
    this.cameraAnim.duration = duration;
    this.cameraAnim.startCamPos.copy(this.camera.position);
    this.cameraAnim.endCamPos.copy(endCamPos);
    this.cameraAnim.startTarget.copy(this.controls.target);
    this.cameraAnim.endTarget.copy(endTarget);
  }

  setBloomStrength(strength) {
    this.bloomPass.strength = strength;
  }

  setAutoRotateSpeed(speed) {
    this.autoRotateSpeed = speed;
  }

  _initResizeListener() {
    window.addEventListener('resize', () => {
      this.isMobile = window.matchMedia('(max-width: 960px)').matches;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
    });
  }

  update(deltaTime) {
    if (this.cameraAnim.active) {
      this.cameraAnim.progress += deltaTime / this.cameraAnim.duration;
      const rawT = Math.min(1.0, this.cameraAnim.progress);
      const easeT = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

      this.camera.position.lerpVectors(this.cameraAnim.startCamPos, this.cameraAnim.endCamPos, easeT);
      this.controls.target.lerpVectors(this.cameraAnim.startTarget, this.cameraAnim.endTarget, easeT);

      if (!this.isCloseUpMode && !this.isMoonViewMode) {
        const minSafeR = this.radius * 1.22;
        if (this.camera.position.length() < minSafeR) {
          this.camera.position.normalize().multiplyScalar(minSafeR);
        }
      }

      if (rawT >= 1.0) {
        this.cameraAnim.active = false;
      }
    } else if (!this.isCloseUpMode && this.autoRotateSpeed > 0) {
      this.globeGroup.rotation.y += deltaTime * 0.08 * this.autoRotateSpeed;
    }

    this.controls.update();
    this.composer.render();
  }
}
