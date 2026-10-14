import * as THREE from 'three';
import { LANDMARKS_DATA } from '../data/landmarksData.js?v=6';
import { URBAN_AREAS_DATA } from '../data/openUrbanData.js?v=6';

const MOON_FALLBACK_DATA = {
  id: 'lunar-orbiter',
  nameEn: 'The Moon (Luna)',
  nameJa: '月 (Luna / 地球の衛星)',
  diameterKm: '3,474 km',
  distanceKm: '384,400 km',
  inclination: '5.14°',
  descriptionEn:
    'Earth’s only natural satellite, rendered at its authentic 27.3% Earth-radius proportion with NASA lunar reconnaissance albedo, crater relief shadows along the solar terminator, and bluish Earthshine on the night side.',
  descriptionJa:
    '地球唯一の自然衛星。地球直径の約27.3%という実際のサイズ比に基づき、NASA月面マップによる海の濃淡・ターミネーター沿いのクレーター陰影・および地球から反射した青い光が夜側を照らす「地球照（Earthshine）」をGLSLシェーダーで再現しています。'
};

const I18N_DICT = {
  en: {
    brandSubtitle: 'World Landmarks & Open Urban Data',
    exploreBtn: 'Explore & Options',
    modeSatellite: 'Satellite & Landmarks',
    modeUrban: 'Urban Open Data',
    modeHolo: 'Cyber Holo',
    moonView: 'Moon',
    resetView: 'Overview',
    langBadge: 'EN',
    zenBtn: 'Showcase',
    restoreHud: 'Show HUD',
    drawerHandle: 'Explorer & 3D Settings',
    tabLandmarks: 'Landmarks',
    tabCities: 'Urban Data',
    tabControls: 'Options',
    searchPlaceholder: 'Search landmarks, cities, countries...',
    regAll: 'All',
    regAsia: 'Asia',
    regEurope: 'Europe',
    regAmericas: 'Americas',
    regMea: 'MEA & Oceania',
    openDataNote: 'Source: UN Urbanization Prospects & Natural Earth (Public Domain)',
    lblLanguage: 'Interface Language',
    btnOptionsZen: 'Enter Full Showcase / Wallpaper Mode (Hide All HUD)',
    lblSolar: 'Solar Terminator & Time',
    chkSolarAuto: 'Smooth automatic day-night solar cycle',
    lblScale: '3D Landmark & Skyline Scale',
    lblBloom: 'Atmospheric & City Light Bloom',
    lblRotate: 'Globe Auto-Rotation Speed',
    groupLayers: '3D Layer Visibility',
    chkMoon: '3D Moon & Lunar Orbit (Phases & Earthshine)',
    chkLandmarks: '3D Architectural Landmarks',
    chkLabels: 'Floating 3D Landmark Name Tags',
    chkSkylines: '3D Urban High-Rise Skylines',
    chkPillars: 'Open Data 3D Population Pillars',
    chkArcs: 'Global Inter-City 3D Flight & Data Arcs',
    chkCoastlines: '3D Natural Earth Coastlines & Borders',
    chkClouds: 'Volumetric Clouds & Fresnel Atmosphere',
    chkSatellites: 'Orbital Satellites & ISS Trajectories',
    btnCloseup: '3D Close-Up Skyline Orbit',
    btnMoonOrbit: 'Switch Lunar Camera Angle (Earthrise / Crater)',
    btnPullback: 'Return to Full Globe Overview',
    hint1: 'Drag / Swipe: Orbit',
    hint2: 'Wheel / Pinch: Zoom',
    hint3: 'Click Monument / Moon: 3D Close-Up',
    hint4: 'Press [H]: Hide All HUD',
    metroUnit: 'Metro',
    densityUnit: 'Density',
    popApprox: 'Pop.',
    badgeLandmark: '3D LANDMARK & SKYLINE',
    badgeUrban: 'OPEN DATA URBAN AREA',
    badgeMoon: 'NATURAL SATELLITE • LUNAR ORBIT',
    metricHeight: 'Height / Elevation',
    metricMetroPop: 'Metro Pop (OpenData)',
    metricStructure: '3D Structure',
    metricUrbanPop: 'Est. Metro Population',
    metricDensity: 'Density (OpenData)',
    metricTier: 'Urban Tier',
    metricMoonDia: 'Mean Diameter',
    metricMoonDist: 'Orbital Distance',
    metricMoonInc: 'Inclination',
    moonLabel: 'The Moon'
  },
  ja: {
    brandSubtitle: '世界主要ランドマーク & 都市オープンデータ',
    exploreBtn: 'メニュー・設定',
    modeSatellite: '衛星 & 3Dランドマーク',
    modeUrban: '都市オープンデータ',
    modeHolo: 'サイバーホログラム',
    moonView: '月視点',
    resetView: '全体視点',
    langBadge: 'JA',
    zenBtn: '鑑賞モード',
    restoreHud: 'HUDを表示',
    drawerHandle: 'ランドマーク・都市・3D設定',
    tabLandmarks: 'ランドマーク',
    tabCities: '都市データ',
    tabControls: 'オプション',
    searchPlaceholder: '都市名・ランドマーク・国名で検索...',
    regAll: 'すべて',
    regAsia: 'アジア',
    regEurope: '欧州',
    regAmericas: '米州',
    regMea: '中東・アフリカ・豪州',
    openDataNote: '出典: UN Urbanization Prospects / Natural Earth (Public Domain)',
    lblLanguage: '表示言語 (Language)',
    btnOptionsZen: '鑑賞・壁紙モードへ切替（全HUDを非表示）',
    lblSolar: '太陽位置・昼夜ターミネーター',
    chkSolarAuto: '太陽光の緩やかな自動推移（昼夜サイクル）',
    lblScale: '3Dランドマーク・都市ビル群スケール',
    lblBloom: '大気・都市光 Bloom（発光強度）',
    lblRotate: '地球の自転スピード',
    groupLayers: '3Dレイヤー表示切替',
    chkMoon: '3D月 & 公転軌道（満ち欠け・地球照）',
    chkLandmarks: '主要ランドマーク 3Dモニュメント',
    chkLabels: '3Dランドマーク名 フローティングラベル',
    chkSkylines: '都市部 3Dプロシージャル高層ビル群',
    chkPillars: 'Open Data 都市圏人口 3Dヘキサゴンピラー',
    chkArcs: 'グローバル都市間 3Dフライト＆通信アーク',
    chkCoastlines: 'Natural Earth 3D海岸線・国境ベクター',
    chkClouds: '立体雲レイヤー & 大気圏フレネル発光',
    chkSatellites: '人工衛星・ISS 3D周回軌道リング',
    btnCloseup: '3D都市・ランドマーク接近視点',
    btnMoonOrbit: '月カメラアングル切替（地球の出 / クレーター接近）',
    btnPullback: '地球全体視点へ引く',
    hint1: 'ドラッグ / スワイプ：回転',
    hint2: 'ホイール / ピンチ：ズーム',
    hint3: 'モニュメント・月を選択：3D接近',
    hint4: '[H]キー：全HUD非表示（鑑賞用）',
    metroUnit: '都市圏',
    densityUnit: '密度',
    popApprox: '約',
    badgeLandmark: '3D LANDMARK & SKYLINE',
    badgeUrban: 'OPEN DATA URBAN AREA',
    badgeMoon: 'NATURAL SATELLITE • LUNAR ORBIT',
    metricHeight: '構造物高 / 標高',
    metricMetroPop: '都市圏人口 (OpenData)',
    metricStructure: '3D造形タイプ',
    metricUrbanPop: '都市圏推計人口',
    metricDensity: '人口密度 (OpenData)',
    metricTier: '都市階層区分',
    metricMoonDia: '平均直径',
    metricMoonDist: '地球からの距離',
    metricMoonInc: '軌道傾斜角',
    moonLabel: '月 (Luna)'
  }
};

export class UIManager {
  constructor({ sceneManager, earthBuilder, landmarkBuilder, urbanDataLayer }) {
    this.sceneManager = sceneManager;
    this.earthBuilder = earthBuilder;
    this.landmarkBuilder = landmarkBuilder;
    this.urbanDataLayer = urbanDataLayer;

    this.lang = 'en';
    this.selectedItem = null;
    this.activeRegion = 'all';
    this.searchQuery = '';
    this.solarHours = 12.0;
    this.autoSolarCycle = true;
    this.labelsEnabled = true;
    this.zenMode = false;

    this.raycaster = new THREE.Raycaster();
    this.pointerDownPos = new THREE.Vector2();
    this.pointerUpPos = new THREE.Vector2();
    this.labelElements = new Map();
    this.moonLabelEl = null;

    this._cacheElements();
    this._createFloatingLabels();
    this.applyLanguage('en');
    this._bindEvents();
  }

  _cacheElements() {
    this.labelsContainer = document.getElementById('labels-container');
    this.controlDrawer = document.getElementById('control-drawer');
    this.btnToggleDrawer = document.getElementById('btn-toggle-drawer');
    this.drawerToggleBtn = document.getElementById('drawer-toggle-btn');
    this.btnCloseDrawer = document.getElementById('btn-close-drawer');

    this.btnMoonView = document.getElementById('btn-moon-view');
    this.btnZenMode = document.getElementById('btn-zen-mode');
    this.btnOptionsZen = document.getElementById('btn-options-zen');
    this.btnRestoreHud = document.getElementById('btn-restore-hud');

    this.btnLangToggle = document.getElementById('btn-lang-toggle');
    this.selectLanguage = document.getElementById('select-language');

    this.landmarksListEl = document.getElementById('landmarks-list');
    this.citiesListEl = document.getElementById('cities-list');
    this.badgeLandmarks = document.getElementById('badge-landmarks');
    this.badgeCities = document.getElementById('badge-cities');

    this.searchBoxWrap = document.getElementById('search-box-wrap');
    this.searchInput = document.getElementById('search-input');
    this.regionFilterBtns = document.querySelectorAll('.filter-chip');
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.modeBtns = document.querySelectorAll('.mode-btn');

    this.solarTimeDisplay = document.getElementById('solar-time-display');
    this.btnResetCamera = document.getElementById('btn-reset-camera');

    this.sliderSolar = document.getElementById('slider-solar');
    this.valSolar = document.getElementById('val-solar');
    this.chkSolarAuto = document.getElementById('chk-solar-auto');

    this.sliderLandmarkScale = document.getElementById('slider-landmark-scale');
    this.valLandmarkScale = document.getElementById('val-landmark-scale');

    this.sliderBloom = document.getElementById('slider-bloom');
    this.valBloom = document.getElementById('val-bloom');

    this.sliderRotate = document.getElementById('slider-rotate');
    this.valRotate = document.getElementById('val-rotate');

    this.chkMoon = document.getElementById('chk-moon');
    this.chkLandmarks = document.getElementById('chk-landmarks');
    this.chkLabels = document.getElementById('chk-labels');
    this.chkSkylines = document.getElementById('chk-skylines');
    this.chkPillars = document.getElementById('chk-pillars');
    this.chkArcs = document.getElementById('chk-arcs');
    this.chkCoastlines = document.getElementById('chk-coastlines');
    this.chkClouds = document.getElementById('chk-clouds');
    this.chkSatellites = document.getElementById('chk-satellites');

    this.detailCard = document.getElementById('detail-card');
    this.btnCloseDetail = document.getElementById('btn-close-detail');
    this.detailBadge = document.getElementById('detail-badge');
    this.detailTitle = document.getElementById('detail-title');
    this.detailSubtitle = document.getElementById('detail-subtitle');
    this.metricLabel1 = document.getElementById('metric-label-1');
    this.metricVal1 = document.getElementById('metric-val-1');
    this.metricLabel2 = document.getElementById('metric-label-2');
    this.metricVal2 = document.getElementById('metric-val-2');
    this.metricLabel3 = document.getElementById('metric-label-3');
    this.metricVal3 = document.getElementById('metric-val-3');
    this.detailDesc = document.getElementById('detail-desc');
    this.btnStreetOrbit = document.getElementById('btn-street-orbit');
    this.btnGlobeOverview = document.getElementById('btn-globe-overview');
  }

  _getMoonData() {
    return this.earthBuilder?.moonMesh?.userData?.data || MOON_FALLBACK_DATA;
  }

  _createFloatingLabels() {
    this.labelsContainer.innerHTML = '';
    for (const entry of this.landmarkBuilder.landmarkEntries) {
      const el = document.createElement('div');
      el.className = 'globe-label';
      el.innerHTML = `
        <span class="label-dot" style="background:${entry.data.color};box-shadow:0 0 6px ${entry.data.color}"></span>
        <span class="label-text">${this._getShortLandmarkName(entry.data)}</span>
      `;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectItem('landmark', entry.data, true);
      });
      this.labelsContainer.appendChild(el);
      this.labelElements.set(entry.id, el);
    }

    const moonEl = document.createElement('div');
    moonEl.className = 'globe-label';
    moonEl.innerHTML = `
      <span class="label-dot" style="background:#e2e8f0;box-shadow:0 0 6px #f8fafc"></span>
      <span class="label-text">${I18N_DICT[this.lang].moonLabel}</span>
    `;
    moonEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectItem('moon', this._getMoonData(), true);
    });
    this.labelsContainer.appendChild(moonEl);
    this.moonLabelEl = moonEl;
  }

  _getShortLandmarkName(data) {
    if (this.lang === 'ja') {
      return data.nameJa.split(' & ')[0];
    }
    return data.nameEn.split(' & ')[0];
  }

  applyLanguage(langCode) {
    this.lang = langCode === 'ja' ? 'ja' : 'en';
    document.documentElement.lang = this.lang;
    if (this.selectLanguage) this.selectLanguage.value = this.lang;

    const t = I18N_DICT[this.lang];
    const setTxt = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setTxt('txt-brand-subtitle', t.brandSubtitle);
    setTxt('txt-explore-btn', t.exploreBtn);
    setTxt('txt-mode-satellite', t.modeSatellite);
    setTxt('txt-mode-urban', t.modeUrban);
    setTxt('txt-mode-holo', t.modeHolo);
    setTxt('txt-moon-view', t.moonView);
    setTxt('txt-reset-view', t.resetView);
    setTxt('txt-lang-badge', t.langBadge);
    setTxt('txt-zen-btn', t.zenBtn);
    setTxt('txt-restore-hud', t.restoreHud);
    setTxt('txt-drawer-handle', t.drawerHandle);
    setTxt('txt-tab-landmarks', t.tabLandmarks);
    setTxt('txt-tab-cities', t.tabCities);
    setTxt('txt-tab-controls', t.tabControls);
    setTxt('txt-reg-all', t.regAll);
    setTxt('txt-reg-asia', t.regAsia);
    setTxt('txt-reg-europe', t.regEurope);
    setTxt('txt-reg-americas', t.regAmericas);
    setTxt('txt-reg-mea', t.regMea);
    setTxt('txt-opendata-note', t.openDataNote);
    setTxt('txt-lbl-language', t.lblLanguage);
    setTxt('txt-btn-options-zen', t.btnOptionsZen);
    setTxt('txt-lbl-solar', t.lblSolar);
    setTxt('txt-chk-solar-auto', t.chkSolarAuto);
    setTxt('txt-lbl-scale', t.lblScale);
    setTxt('txt-lbl-bloom', t.lblBloom);
    setTxt('txt-lbl-rotate', t.lblRotate);
    setTxt('txt-group-layers', t.groupLayers);
    setTxt('txt-chk-moon', t.chkMoon);
    setTxt('txt-chk-landmarks', t.chkLandmarks);
    setTxt('txt-chk-labels', t.chkLabels);
    setTxt('txt-chk-skylines', t.chkSkylines);
    setTxt('txt-chk-pillars', t.chkPillars);
    setTxt('txt-chk-arcs', t.chkArcs);
    setTxt('txt-chk-coastlines', t.chkCoastlines);
    setTxt('txt-chk-clouds', t.chkClouds);
    setTxt('txt-chk-satellites', t.chkSatellites);
    setTxt('txt-btn-closeup', this.selectedItem?.type === 'moon' ? t.btnMoonOrbit : t.btnCloseup);
    setTxt('txt-btn-pullback', t.btnPullback);
    setTxt('txt-hint-1', t.hint1);
    setTxt('txt-hint-2', t.hint2);
    setTxt('txt-hint-3', t.hint3);
    setTxt('txt-hint-4', t.hint4);

    if (this.searchInput) {
      this.searchInput.placeholder = t.searchPlaceholder;
    }

    for (const entry of this.landmarkBuilder.landmarkEntries) {
      const el = this.labelElements.get(entry.id);
      const txtSpan = el?.querySelector('.label-text');
      if (txtSpan) {
        txtSpan.textContent = this._getShortLandmarkName(entry.data);
      }
    }

    if (this.moonLabelEl) {
      const moonSpan = this.moonLabelEl.querySelector('.label-text');
      if (moonSpan) moonSpan.textContent = t.moonLabel;
    }

    this._renderLists();
    if (this.selectedItem) {
      this._populateDetailCard(this.selectedItem.type, this.selectedItem.data);
    }
  }

  setZenMode(enabled) {
    this.zenMode = enabled;
    document.body.classList.toggle('zen-mode', this.zenMode);
    this.btnRestoreHud.classList.toggle('hidden', !this.zenMode);
    this._updateLabelsVisibility();
  }

  _updateLabelsVisibility() {
    const show = this.labelsEnabled && !this.zenMode;
    this.labelsContainer.style.display = show ? 'block' : 'none';
  }

  _matchesFilter(item) {
    if (this.activeRegion !== 'all' && item.region !== this.activeRegion) {
      return false;
    }
    if (!this.searchQuery) return true;
    const q = this.searchQuery.toLowerCase();
    const hay = `${item.nameEn} ${item.nameJa} ${item.countryEn || ''} ${item.countryJa || ''} ${item.cityEn || ''} ${item.cityJa || ''}`.toLowerCase();
    return hay.includes(q);
  }

  _renderLists() {
    const isJa = this.lang === 'ja';
    const t = I18N_DICT[this.lang];

    const filteredLandmarks = LANDMARKS_DATA.filter((l) => this._matchesFilter(l));
    this.badgeLandmarks.textContent = String(filteredLandmarks.length);
    this.landmarksListEl.innerHTML = '';

    // Featured Celestial Card: The Moon (Luna)
    if (this.activeRegion === 'all' && (!this.searchQuery || 'moon luna 月'.includes(this.searchQuery.toLowerCase()))) {
      const moonData = this._getMoonData();
      const moonCard = document.createElement('div');
      moonCard.className = `list-card ${this.selectedItem?.type === 'moon' ? 'active' : ''}`;
      moonCard.innerHTML = `
        <div class="card-main">
          <div class="card-title">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e2e8f0;box-shadow:0 0 6px #ffffff"></span>
            <span>${isJa ? moonData.nameJa : moonData.nameEn}</span>
          </div>
          <div class="card-sub">${isJa ? '地球周回軌道 • Earthrise視点' : 'Lunar Orbit • Earthrise & Craters'}</div>
        </div>
        <div class="card-metric">
          <span class="card-metric-val" style="color:#e2e8f0">${moonData.diameterKm}</span>
          <span class="card-metric-unit">${moonData.distanceKm}</span>
        </div>
      `;
      moonCard.addEventListener('click', () => {
        if (this.chkMoon) this.chkMoon.checked = true;
        this.earthBuilder.setMoonVisible(true);
        this.selectItem('moon', moonData, true);
        if (this.sceneManager.isMobile) {
          this.controlDrawer.classList.add('collapsed');
          this.btnToggleDrawer.classList.remove('active');
        }
      });
      this.landmarksListEl.appendChild(moonCard);
    }

    for (const lm of filteredLandmarks) {
      const name = isJa ? lm.nameJa : lm.nameEn;
      const country = isJa ? lm.countryJa : lm.countryEn;
      const city = isJa ? lm.cityJa : lm.cityEn;

      const card = document.createElement('div');
      card.className = `list-card ${this.selectedItem?.data?.id === lm.id ? 'active' : ''}`;
      card.innerHTML = `
        <div class="card-main">
          <div class="card-title">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${lm.color}"></span>
            <span>${name}</span>
          </div>
          <div class="card-sub">${country} • ${city} (${lm.archLabel})</div>
        </div>
        <div class="card-metric">
          <span class="card-metric-val">${lm.heightMeters} m</span>
          <span class="card-metric-unit">${t.metroUnit} ${lm.urbanPopM}M</span>
        </div>
      `;
      card.addEventListener('click', () => {
        this.selectItem('landmark', lm, true);
        if (this.sceneManager.isMobile) {
          this.controlDrawer.classList.add('collapsed');
          this.btnToggleDrawer.classList.remove('active');
        }
      });
      this.landmarksListEl.appendChild(card);
    }

    const filteredCities = URBAN_AREAS_DATA.filter((c) => this._matchesFilter(c)).sort(
      (a, b) => b.popM - a.popM
    );
    this.badgeCities.textContent = String(filteredCities.length);
    this.citiesListEl.innerHTML = '';

    for (const city of filteredCities) {
      const tierColor = city.popM >= 20 ? '#fbbf24' : city.popM >= 10 ? '#38bdf8' : '#34d399';
      const name = isJa ? city.nameJa : city.nameEn;
      const country = isJa ? city.countryJa : city.countryEn;
      const subPop = isJa
        ? `約${Math.round(city.popM * 100).toLocaleString()}万人`
        : `${t.popApprox} ${city.popM.toFixed(1)}M`;

      const card = document.createElement('div');
      card.className = `list-card ${this.selectedItem?.data?.id === city.id ? 'active' : ''}`;
      card.innerHTML = `
        <div class="card-main">
          <div class="card-title">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${tierColor}"></span>
            <span>${name}</span>
          </div>
          <div class="card-sub">${country} • ${t.densityUnit} ${city.density.toLocaleString()}/km²</div>
        </div>
        <div class="card-metric">
          <span class="card-metric-val" style="color:${tierColor}">${city.popM.toFixed(1)} M</span>
          <span class="card-metric-unit">${subPop}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        this.selectItem('city', city, false);
        if (this.sceneManager.isMobile) {
          this.controlDrawer.classList.add('collapsed');
          this.btnToggleDrawer.classList.remove('active');
        }
      });
      this.citiesListEl.appendChild(card);
    }
  }

  selectItem(type, data, streetCloseUp = false) {
    this.selectedItem = { type, data };

    for (const [id, el] of this.labelElements.entries()) {
      el.classList.toggle('selected', type === 'landmark' && id === data.id);
    }
    if (this.moonLabelEl) {
      this.moonLabelEl.classList.toggle('selected', type === 'moon');
    }
    if (this.btnMoonView) {
      this.btnMoonView.classList.toggle('active', type === 'moon');
    }

    this._renderLists();
    this._populateDetailCard(type, data);

    if (type === 'moon') {
      this.sceneManager.flyToMoon(this.earthBuilder);
    } else {
      this.sceneManager.flyToCoordinate(data.lat, data.lon, streetCloseUp);
    }
  }

  _populateDetailCard(type, data) {
    const isJa = this.lang === 'ja';
    const t = I18N_DICT[this.lang];

    this.detailCard.classList.remove('hidden');
    const closeUpSpan = document.getElementById('txt-btn-closeup');

    if (type === 'moon') {
      this.detailBadge.textContent = t.badgeMoon;
      this.detailBadge.style.color = '#e2e8f0';
      this.detailTitle.textContent = isJa ? data.nameJa : data.nameEn;
      this.detailSubtitle.textContent = isJa
        ? '地球周回軌道 • 潮汐ロック（同期自転）'
        : 'Earth-Moon System • Tidally Locked Synchronous Orbit';

      this.metricLabel1.textContent = t.metricMoonDia;
      this.metricVal1.textContent = data.diameterKm;
      this.metricLabel2.textContent = t.metricMoonDist;
      this.metricVal2.textContent = data.distanceKm;
      this.metricLabel3.textContent = t.metricMoonInc;
      this.metricVal3.textContent = data.inclination;
      this.detailDesc.textContent = isJa ? data.descriptionJa : data.descriptionEn;
      if (closeUpSpan) closeUpSpan.textContent = t.btnMoonOrbit;
      return;
    }

    if (closeUpSpan) closeUpSpan.textContent = t.btnCloseup;

    const latStr = `${Math.abs(data.lat).toFixed(2)}° ${data.lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(data.lon).toFixed(2)}° ${data.lon >= 0 ? 'E' : 'W'}`;

    if (type === 'landmark') {
      const name = isJa ? data.nameJa : data.nameEn;
      const country = isJa ? data.countryJa : data.countryEn;
      const city = isJa ? data.cityJa : data.cityEn;
      const desc = isJa ? data.descriptionJa : data.descriptionEn;

      this.detailBadge.textContent = t.badgeLandmark;
      this.detailBadge.style.color = data.color;
      this.detailTitle.textContent = name;
      this.detailSubtitle.textContent = `${country} • ${city} (${latStr}, ${lonStr})`;

      this.metricLabel1.textContent = t.metricHeight;
      this.metricVal1.textContent = `${data.heightMeters} m`;
      this.metricLabel2.textContent = t.metricMetroPop;
      this.metricVal2.textContent = isJa
        ? `${Math.round(data.urbanPopM * 100).toLocaleString()} 万人`
        : `${data.urbanPopM.toFixed(1)}M`;
      this.metricLabel3.textContent = t.metricStructure;
      this.metricVal3.textContent = data.archLabel;
      this.detailDesc.textContent = desc;
    } else {
      const name = isJa ? `${data.nameJa} (${data.nameEn})` : data.nameEn;
      const country = isJa ? data.countryJa : data.countryEn;

      this.detailBadge.textContent = t.badgeUrban;
      this.detailBadge.style.color = '#38bdf8';
      this.detailTitle.textContent = name;
      this.detailSubtitle.textContent = `${country} (${latStr}, ${lonStr})`;

      this.metricLabel1.textContent = t.metricUrbanPop;
      this.metricVal1.textContent = isJa
        ? `${Math.round(data.popM * 100).toLocaleString()} 万人`
        : `${data.popM.toFixed(1)} Million`;
      this.metricLabel2.textContent = t.metricDensity;
      this.metricVal2.textContent = `${data.density.toLocaleString()} /km²`;
      this.metricLabel3.textContent = t.metricTier;
      this.metricVal3.textContent =
        data.popM >= 20 ? 'Megacity (>20M)' : data.popM >= 10 ? 'Large Hub' : 'Major Urban';

      this.detailDesc.textContent = isJa
        ? `国連都市人口統計（UN World Urbanization Prospects）およびNatural Earthオープンデータに基づく${country}の主要都市圏です。`
        : `Major metropolitan agglomeration in ${country} based on UN World Urbanization Prospects and Natural Earth public domain data.`;
    }
  }

  _bindEvents() {
    const toggleDrawer = () => {
      const isCollapsed = this.controlDrawer.classList.toggle('collapsed');
      this.btnToggleDrawer.classList.toggle('active', !isCollapsed);
    };

    this.btnToggleDrawer.addEventListener('click', toggleDrawer);
    this.drawerToggleBtn.addEventListener('click', toggleDrawer);
    this.btnCloseDrawer.addEventListener('click', () => {
      this.controlDrawer.classList.add('collapsed');
      this.btnToggleDrawer.classList.remove('active');
    });

    // Moon View Button in Top Bar
    if (this.btnMoonView) {
      this.btnMoonView.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.chkMoon) this.chkMoon.checked = true;
        this.earthBuilder.setMoonVisible(true);
        this.selectItem('moon', this._getMoonData(), true);
      });
    }

    this.btnZenMode.addEventListener('click', () => this.setZenMode(true));
    this.btnOptionsZen.addEventListener('click', () => this.setZenMode(true));
    this.btnRestoreHud.addEventListener('click', () => this.setZenMode(false));

    window.addEventListener('keydown', (e) => {
      if (document.activeElement === this.searchInput) return;
      if (e.key === 'h' || e.key === 'H') {
        this.setZenMode(!this.zenMode);
      } else if (e.key === 'Escape' && this.zenMode) {
        this.setZenMode(false);
      }
    });

    this.btnLangToggle.addEventListener('click', () => {
      this.applyLanguage(this.lang === 'en' ? 'ja' : 'en');
    });

    this.selectLanguage.addEventListener('change', (e) => {
      this.applyLanguage(e.target.value);
    });

    this.tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        this.tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
        this.tabContents.forEach((content) => {
          content.classList.toggle('active', content.id === `tab-${targetTab}`);
        });
        this.searchBoxWrap.classList.toggle('hidden', targetTab === 'controls');
      });
    });

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      this._renderLists();
    });

    this.regionFilterBtns.forEach((chip) => {
      chip.addEventListener('click', () => {
        this.activeRegion = chip.dataset.region;
        this.regionFilterBtns.forEach((c) => c.classList.toggle('active', c === chip));
        this._renderLists();
      });
    });

    this.modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.modeBtns.forEach((b) => b.classList.toggle('active', b === btn));
        this.earthBuilder.setVisualMode(mode);
        this.urbanDataLayer.setVisualMode(mode);

        if (mode === 'urban') {
          this.chkPillars.checked = true;
          this.chkArcs.checked = true;
        }
      });
    });

    this.btnResetCamera.addEventListener('click', () => {
      if (this.btnMoonView) this.btnMoonView.classList.remove('active');
      this.sceneManager.resetCameraToOverview();
    });

    this.btnCloseDetail.addEventListener('click', () => {
      this.detailCard.classList.add('hidden');
    });

    this.btnStreetOrbit.addEventListener('click', () => {
      if (!this.selectedItem) return;
      if (this.selectedItem.type === 'moon') {
        this.sceneManager.flyToMoon(this.earthBuilder);
      } else {
        this.sceneManager.flyToCoordinate(this.selectedItem.data.lat, this.selectedItem.data.lon, true);
      }
    });

    this.btnGlobeOverview.addEventListener('click', () => {
      if (this.btnMoonView) this.btnMoonView.classList.remove('active');
      this.sceneManager.resetCameraToOverview();
    });

    this.sliderSolar.addEventListener('input', (e) => {
      this.solarHours = parseFloat(e.target.value);
      this.chkSolarAuto.checked = false;
      this.autoSolarCycle = false;
      this._updateSolarUI();
    });

    this.chkSolarAuto.addEventListener('change', (e) => {
      this.autoSolarCycle = e.target.checked;
    });

    this.sliderLandmarkScale.addEventListener('input', (e) => {
      const s = parseFloat(e.target.value);
      this.valLandmarkScale.textContent = `${s.toFixed(1)}x`;
      this.landmarkBuilder.setLandmarkScale(s);
    });

    this.sliderBloom.addEventListener('input', (e) => {
      const b = parseFloat(e.target.value);
      this.valBloom.textContent = b.toFixed(2);
      this.sceneManager.setBloomStrength(b);
    });

    this.sliderRotate.addEventListener('input', (e) => {
      const r = parseFloat(e.target.value);
      this.valRotate.textContent = `${r.toFixed(1)}x`;
      this.sceneManager.setAutoRotateSpeed(r);
    });

    if (this.chkMoon) {
      this.chkMoon.addEventListener('change', (e) => {
        this.earthBuilder.setMoonVisible(e.target.checked);
      });
    }

    this.chkLandmarks.addEventListener('change', (e) => {
      this.landmarkBuilder.setLandmarksVisible(e.target.checked);
      this._updateLabelsVisibility();
    });

    this.chkLabels.addEventListener('change', (e) => {
      this.labelsEnabled = e.target.checked;
      this._updateLabelsVisibility();
    });

    this.chkSkylines.addEventListener('change', (e) => {
      this.landmarkBuilder.setSkylinesVisible(e.target.checked);
    });

    this.chkPillars.addEventListener('change', (e) => {
      this.urbanDataLayer.setPillarsVisible(e.target.checked);
    });

    this.chkArcs.addEventListener('change', (e) => {
      this.urbanDataLayer.setArcsVisible(e.target.checked);
    });

    this.chkCoastlines.addEventListener('change', (e) => {
      this.earthBuilder.coastlineGroup.visible = e.target.checked;
    });

    this.chkClouds.addEventListener('change', (e) => {
      this.earthBuilder.cloudsMesh.visible = e.target.checked;
      this.earthBuilder.atmosphereMesh.visible = e.target.checked;
    });

    this.chkSatellites.addEventListener('change', (e) => {
      this.urbanDataLayer.setSatellitesVisible(e.target.checked);
    });

    const domEl = this.sceneManager.renderer.domElement;
    domEl.addEventListener('pointerdown', (e) => {
      this.pointerDownPos.set(e.clientX, e.clientY);
    });

    domEl.addEventListener('pointerup', (e) => {
      this.pointerUpPos.set(e.clientX, e.clientY);
      if (this.pointerDownPos.distanceTo(this.pointerUpPos) < 6) {
        this._handleCanvasTap(e.clientX, e.clientY);
      }
    });
  }

  _handleCanvasTap(clientX, clientY) {
    if (this.zenMode) return;

    const mouse = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.sceneManager.camera);

    const targets = [
      ...(this.earthBuilder.moonSystemGroup?.visible && this.earthBuilder.moonMesh
        ? [this.earthBuilder.moonMesh]
        : []),
      ...(this.landmarkBuilder.landmarksGroup.visible ? this.landmarkBuilder.interactiveMeshes : []),
      ...(this.urbanDataLayer.pillarsGroup.visible ? this.urbanDataLayer.interactiveMeshes : [])
    ];

    const intersects = this.raycaster.intersectObjects(targets, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object.userData;
      if (hit && hit.data) {
        this.selectItem(hit.type, hit.data, hit.type === 'landmark' || hit.type === 'moon');
      }
    }
  }

  _updateSolarUI() {
    const hrs = Math.floor(this.solarHours) % 24;
    const mins = Math.floor((this.solarHours % 1) * 60);
    const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} UTC`;
    this.valSolar.textContent = formatted;
    this.solarTimeDisplay.textContent = formatted;
    this.earthBuilder.updateSunByUTCHours(this.solarHours, this.sceneManager.sunLight);
  }

  update(deltaTime) {
    if (this.autoSolarCycle) {
      this.solarHours = (this.solarHours + deltaTime * 0.18) % 24;
      this.sliderSolar.value = this.solarHours.toFixed(1);
      this._updateSolarUI();
    }

    if (!this.labelsEnabled || this.zenMode) return;

    const cam = this.sceneManager.camera;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const tempVec = new THREE.Vector3();
    const normalVec = new THREE.Vector3();
    const camDir = new THREE.Vector3();

    if (this.chkLandmarks.checked) {
      for (const entry of this.landmarkBuilder.landmarkEntries) {
        const labelEl = this.labelElements.get(entry.id);
        if (!labelEl) continue;

        entry.anchor.getWorldPosition(tempVec);
        normalVec.copy(tempVec).normalize();
        camDir.copy(cam.position).sub(tempVec).normalize();

        const facingDot = normalVec.dot(camDir);
        if (facingDot < 0.12) {
          labelEl.style.opacity = '0';
          labelEl.style.pointerEvents = 'none';
          continue;
        }

        tempVec.addScaledVector(normalVec, 0.42);
        tempVec.project(cam);

        if (tempVec.z > 1.0) {
          labelEl.style.opacity = '0';
          labelEl.style.pointerEvents = 'none';
          continue;
        }

        const screenX = (tempVec.x * 0.5 + 0.5) * w;
        const screenY = (-tempVec.y * 0.5 + 0.5) * h;

        labelEl.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -100%)`;
        labelEl.style.opacity = String(Math.min(1, (facingDot - 0.12) * 3.0));
        labelEl.style.pointerEvents = 'auto';
      }
    }

    if (this.moonLabelEl && this.earthBuilder.moonSystemGroup?.visible) {
      this.earthBuilder.getMoonWorldPosition(tempVec);
      tempVec.y += this.earthBuilder.moonRadius * 1.25;
      tempVec.project(cam);

      if (tempVec.z > 1.0 || tempVec.z < -1.0) {
        this.moonLabelEl.style.opacity = '0';
        this.moonLabelEl.style.pointerEvents = 'none';
      } else {
        const mx = (tempVec.x * 0.5 + 0.5) * w;
        const my = (-tempVec.y * 0.5 + 0.5) * h;
        this.moonLabelEl.style.transform = `translate3d(${mx.toFixed(1)}px, ${my.toFixed(1)}px, 0) translate(-50%, -100%)`;
        this.moonLabelEl.style.opacity = '0.95';
        this.moonLabelEl.style.pointerEvents = 'auto';
      }
    } else if (this.moonLabelEl) {
      this.moonLabelEl.style.opacity = '0';
      this.moonLabelEl.style.pointerEvents = 'none';
    }
  }
}
