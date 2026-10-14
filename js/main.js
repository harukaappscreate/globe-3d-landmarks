import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js?v=6';
import { loadEarthAssets } from './globe/ProceduralTextures.js?v=6';
import { EarthBuilder } from './globe/EarthBuilder.js?v=6';
import { LandmarkBuilder } from './globe/LandmarkBuilder.js?v=6';
import { UrbanDataLayer } from './globe/UrbanDataLayer.js?v=6';
import { UIManager } from './ui/UIManager.js?v=6';

class TerraVistaApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.loaderBar = document.getElementById('loader-bar');
    this.loaderStatus = document.getElementById('loader-status');

    this.clock = new THREE.Clock();
    this.radius = 10;

    this._init();
  }

  _updateLoader(percent, message) {
    if (this.loaderBar) this.loaderBar.style.width = `${percent}%`;
    if (this.loaderStatus && message) this.loaderStatus.textContent = message;
  }

  async _init() {
    if (window.location.protocol === 'file:') {
      return;
    }

    this._updateLoader(15, 'Initializing WebGL renderer & post-processing...');
    this.sceneManager = new SceneManager(this.container, this.radius);

    const earthAssets = await loadEarthAssets((pct) =>
      this._updateLoader(pct, 'Loading NASA Blue Marble, Lunar & Natural Earth GeoJSON...')
    );

    this._updateLoader(82, 'Constructing 3D Earth shaders, Lunar Orbit & architectural landmarks...');
    this.earthBuilder = new EarthBuilder(
      this.sceneManager.globeGroup,
      this.sceneManager.scene,
      earthAssets,
      this.radius
    );

    this.landmarkBuilder = new LandmarkBuilder(this.sceneManager.globeGroup, this.radius);
    this.urbanDataLayer = new UrbanDataLayer(this.sceneManager.globeGroup, this.radius);

    this._updateLoader(95, 'Connecting interactive UI & Open Urban Data...');
    this.uiManager = new UIManager({
      sceneManager: this.sceneManager,
      earthBuilder: this.earthBuilder,
      landmarkBuilder: this.landmarkBuilder,
      urbanDataLayer: this.urbanDataLayer
    });

    this._updateLoader(100, 'Ready');
    setTimeout(() => {
      if (this.loadingOverlay) {
        this.loadingOverlay.classList.add('fade-out');
      }
      this.sceneManager.playIntroFlyIn();
    }, 220);

    this._animate();
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const deltaTime = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    this.earthBuilder.update(elapsedTime, deltaTime, this.sceneManager.isMoonViewMode);
    this.landmarkBuilder.update(elapsedTime, deltaTime);
    this.urbanDataLayer.update(elapsedTime, deltaTime);
    this.uiManager.update(deltaTime);
    this.sceneManager.update(deltaTime);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new TerraVistaApp();
});
