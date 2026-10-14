import * as THREE from 'three';
import { latLonToVector3 } from './ProceduralTextures.js?v=6';

export class EarthBuilder {
  constructor(globeGroup, scene, assets, radius = 10) {
    this.globeGroup = globeGroup;
    this.scene = scene;
    this.textures = assets;
    this.radius = radius;

    this.sunDirection = new THREE.Vector3(1, 0.25, 0.6).normalize();
    this.earthMesh = null;
    this.cloudsMesh = null;
    this.atmosphereMesh = null;
    this.coastlineGroup = null;
    this.sunSprite = null;

    // Lunar System properties
    this.moonSystemGroup = null;
    this.moonPivot = null;
    this.moonMesh = null;
    this.moonOrbitLine = null;
    this.moonRadius = this.radius * 0.2727; // Authentic 27.3% Earth radius ratio
    this.moonOrbitRadius = 28.0;
    this.moonOrbitAngle = -1.15; // Positioned clearly in the initial view alongside Earth

    this._buildEarthSurface();
    this._buildElevatedCoastlines();
    this._buildCloudsLayer();
    this._buildAtmosphereHalo();
    this._buildMoonSystem();
    this._buildStarfieldAndSun();
  }

  _buildEarthSurface() {
    const geometry = new THREE.SphereGeometry(this.radius, 128, 128);

    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;

      void main() {
        vUv = uv;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vPosWorld = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const fragmentShader = /* glsl */ `
      uniform sampler2D uDayMap;
      uniform sampler2D uNightMap;
      uniform sampler2D uBumpMap;
      uniform sampler2D uSpecMap;
      uniform vec3 uSunDir;
      uniform float uMode; // 0.0: Satellite, 1.0: Urban Data, 2.0: Cyber Holo
      uniform float uTime;

      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;

      void main() {
        vec3 dayColor = texture2D(uDayMap, vUv).rgb;
        vec3 nightSample = texture2D(uNightMap, vUv).rgb;
        float nightIntensity = max(nightSample.r, max(nightSample.g, nightSample.b));
        vec3 nightLights = vec3(1.0, 0.82, 0.38) * pow(nightIntensity, 1.15) * 1.85;

        float specMask = texture2D(uSpecMap, vUv).r;
        vec3 normalTex = texture2D(uBumpMap, vUv).rgb * 2.0 - 1.0;

        vec3 N = normalize(vNormalWorld);
        vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.001), N));
        vec3 bitangent = normalize(cross(N, tangent));
        vec3 perturbedN = normalize(N + tangent * normalTex.x * 0.45 + bitangent * normalTex.y * 0.45);

        vec3 L = normalize(uSunDir);
        vec3 V = normalize(cameraPosition - vPosWorld);
        vec3 H = normalize(L + V);

        float ndotl = dot(perturbedN, L);
        float rawNdotL = dot(N, L);

        // Smooth solar terminator (-0.16 to +0.22)
        float dayFactor = smoothstep(-0.16, 0.22, rawNdotL);
        float twilightBand = smoothstep(-0.20, 0.03, rawNdotL) * (1.0 - smoothstep(0.03, 0.24, rawNdotL));

        // Ocean specular sun glint
        float spec = pow(max(dot(perturbedN, H), 0.0), 48.0) * specMask * dayFactor;
        vec3 specColor = vec3(0.82, 0.92, 1.0) * spec * 0.58;

        // Fresnel rim on globe surface
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2);

        // Mode 0: Realistic NASA Satellite & 3D Landmarks
        vec3 litDay = dayColor * (0.20 + 0.95 * max(ndotl, 0.0)) + specColor;
        vec3 twilightTint = vec3(0.95, 0.40, 0.16) * twilightBand * 0.26;
        vec3 darkSide = dayColor * 0.06 + nightLights * (1.35 - dayFactor * 1.15);
        vec3 satelliteCol = mix(darkSide, litDay, dayFactor)
          + twilightTint
          + vec3(0.14, 0.50, 0.92) * fresnel * (0.25 + 0.55 * dayFactor);

        // Mode 1: Urban Open Data (Dark Cartography so 3D Pillars & Arcs pop)
        float isLand = 1.0 - step(0.32, specMask);
        vec3 urbanBase = mix(vec3(0.015, 0.038, 0.088), dayColor * 0.32 + vec3(0.03, 0.08, 0.16), isLand);
        vec3 urbanCol = urbanBase * (0.55 + 0.45 * dayFactor)
          + nightLights * 1.55
          + vec3(0.08, 0.42, 0.78) * fresnel * 0.55;

        // Mode 2: Cyber Holo Twin (Holographic Grid & Neon Continents)
        float latGrid = abs(fract(vUv.y * 36.0) - 0.5);
        float lonGrid = abs(fract(vUv.x * 72.0) - 0.5);
        float gridLine = 1.0 - smoothstep(0.0, 0.04, min(latGrid, lonGrid));
        float scanWave = 0.5 + 0.5 * sin(vUv.y * 80.0 - uTime * 2.4);
        vec3 holoBase = mix(vec3(0.01, 0.03, 0.08), vec3(0.04, 0.24, 0.40), isLand);
        vec3 holoCol = holoBase
          + vec3(0.0, 0.78, 1.0) * gridLine * 0.22
          + nightIntensity * vec3(0.25, 1.0, 0.9) * 1.5
          + vec3(0.06, 0.68, 1.0) * fresnel * (0.65 + 0.25 * scanWave);

        vec3 finalColor = satelliteCol;
        if (uMode > 0.5 && uMode < 1.5) {
          finalColor = urbanCol;
        } else if (uMode >= 1.5) {
          finalColor = holoCol;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    this.earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uDayMap: { value: this.textures.dayTexture },
        uNightMap: { value: this.textures.nightTexture },
        uBumpMap: { value: this.textures.bumpTexture },
        uSpecMap: { value: this.textures.specularTexture },
        uSunDir: { value: this.sunDirection.clone() },
        uMode: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      vertexShader,
      fragmentShader
    });

    this.earthMesh = new THREE.Mesh(geometry, this.earthMaterial);
    this.earthMesh.name = 'EarthSurface';
    this.globeGroup.add(this.earthMesh);
  }

  /**
   * Builds high-precision 3D elevated coastline & country border vectors
   * from Natural Earth 110m Public Domain GeoJSON, batched into LineSegments.
   */
  _buildElevatedCoastlines() {
    this.coastlineGroup = new THREE.Group();

    const coastRadius = this.radius * 1.0022;
    const borderRadius = this.radius * 1.0018;

    this.coastlineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28
    });

    this.borderMaterial = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.16
    });

    const buildBatchedSegments = (linesArray, r) => {
      const positions = [];
      for (const line of linesArray) {
        for (let i = 0; i < line.length - 1; i++) {
          const [lon1, lat1] = line[i];
          const [lon2, lat2] = line[i + 1];
          if (Math.abs(lon2 - lon1) > 90) continue;

          const p1 = latLonToVector3(lat1, lon1, r);
          const p2 = latLonToVector3(lat2, lon2, r);
          positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      return geo;
    };

    if (this.textures.coastlineLines?.length) {
      const coastGeo = buildBatchedSegments(this.textures.coastlineLines, coastRadius);
      this.coastlineGroup.add(new THREE.LineSegments(coastGeo, this.coastlineMaterial));
    }

    if (this.textures.borderLines?.length) {
      const borderGeo = buildBatchedSegments(this.textures.borderLines, borderRadius);
      this.coastlineGroup.add(new THREE.LineSegments(borderGeo, this.borderMaterial));
    }

    const graticuleMat = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.12
    });

    [-23.4, 0, 23.4].forEach((lat) => {
      const pts = [];
      for (let lon = -180; lon <= 180; lon += 2) {
        pts.push(latLonToVector3(lat, lon, this.radius * 1.0015));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      this.coastlineGroup.add(new THREE.Line(geo, graticuleMat));
    });

    this.globeGroup.add(this.coastlineGroup);
  }

  _buildCloudsLayer() {
    const cloudGeo = new THREE.SphereGeometry(this.radius * 1.012, 96, 96);
    this.cloudsMaterial = new THREE.MeshStandardMaterial({
      map: this.textures.cloudsTexture,
      alphaMap: this.textures.cloudsTexture,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      roughness: 1.0,
      metalness: 0.0
    });

    this.cloudsMesh = new THREE.Mesh(cloudGeo, this.cloudsMaterial);
    this.cloudsMesh.name = 'CloudsLayer';
    this.globeGroup.add(this.cloudsMesh);
  }

  _buildAtmosphereHalo() {
    const atmosGeo = new THREE.SphereGeometry(this.radius * 1.125, 64, 64);

    const vertexShader = /* glsl */ `
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;

      void main() {
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vPosWorld = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = /* glsl */ `
      uniform vec3 uSunDir;
      uniform vec3 uAtmosColor;
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;

      void main() {
        vec3 V = normalize(cameraPosition - vPosWorld);
        float rim = pow(0.68 - dot(vNormalWorld, V), 2.8);
        float sunLight = smoothstep(-0.35, 0.5, dot(vNormalWorld, normalize(uSunDir)));
        vec3 col = mix(vec3(0.05, 0.18, 0.45), uAtmosColor, 0.35 + 0.65 * sunLight);
        gl_FragColor = vec4(col, clamp(rim * (0.35 + 0.65 * sunLight), 0.0, 0.85));
      }
    `;

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: this.sunDirection.clone() },
        uAtmosColor: { value: new THREE.Color(0x38bdf8) }
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.atmosphereMesh = new THREE.Mesh(atmosGeo, this.atmosphereMaterial);
    this.globeGroup.add(this.atmosphereMesh);
  }

  /**
   * Builds the 3D Moon & Inclined Lunar Orbit System with a custom GLSL shader
   * featuring crater bump relief, lunar phases synced to the Sun, and bluish Earthshine.
   */
  _buildMoonSystem() {
    this.moonSystemGroup = new THREE.Group();
    this.moonSystemGroup.name = 'LunarSystemGroup';
    // Realistic 5.14 deg lunar orbital inclination
    this.moonSystemGroup.rotation.z = THREE.MathUtils.degToRad(5.14);
    this.moonSystemGroup.rotation.x = THREE.MathUtils.degToRad(8.0);
    this.scene.add(this.moonSystemGroup);

    // 1. Subtle Glowing Lunar Orbit Trajectory Ring
    const orbitPts = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      orbitPts.push(
        new THREE.Vector3(Math.cos(a) * this.moonOrbitRadius, 0, Math.sin(a) * this.moonOrbitRadius)
      );
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
    this.moonOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.22
    });
    this.moonOrbitLine = new THREE.Line(orbitGeo, this.moonOrbitMaterial);
    this.moonSystemGroup.add(this.moonOrbitLine);

    // 2. Moon Sphere with Crater Relief + Lunar Phase + Earthshine Shader
    const moonGeo = new THREE.SphereGeometry(this.moonRadius, 64, 64);

    const moonVertexShader = /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;

      void main() {
        vUv = uv;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vPosWorld = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const moonFragmentShader = /* glsl */ `
      uniform sampler2D uMoonMap;
      uniform vec3 uSunDir;
      uniform float uMode;

      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;

      void main() {
        vec3 albedo = texture2D(uMoonMap, vUv).rgb;

        // Compute crater normal relief from luminance gradients
        vec2 texel = vec2(1.0 / 1024.0, 1.0 / 512.0);
        float hL = texture2D(uMoonMap, vUv - vec2(texel.x, 0.0)).r;
        float hR = texture2D(uMoonMap, vUv + vec2(texel.x, 0.0)).r;
        float hD = texture2D(uMoonMap, vUv - vec2(0.0, texel.y)).r;
        float hU = texture2D(uMoonMap, vUv + vec2(0.0, texel.y)).r;

        vec3 N = normalize(vNormalWorld);
        vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.001), N));
        vec3 bitangent = normalize(cross(N, tangent));
        vec3 craterN = normalize(N + tangent * (hL - hR) * 2.2 + bitangent * (hD - hU) * 2.2);

        vec3 L = normalize(uSunDir);
        vec3 V = normalize(cameraPosition - vPosWorld);

        // Oren-Nayar / Lommel-Seeliger style lunar reflectance
        float ndotl = max(dot(craterN, L), 0.0);
        float terminator = smoothstep(-0.08, 0.12, dot(N, L));
        float diffuse = pow(ndotl, 0.78) * terminator;

        // Subtle bluish Earthshine on the lunar hemisphere facing Earth (0,0,0)
        vec3 toEarth = normalize(-vPosWorld);
        float earthFacing = max(dot(N, toEarth), 0.0);
        vec3 earthshine = albedo * vec3(0.28, 0.45, 0.72) * (0.09 + 0.08 * earthFacing);

        // Subtle rim glow for visibility against deep space
        float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);

        vec3 litMoon = albedo * (1.28 * diffuse) + earthshine + vec3(0.65, 0.75, 0.9) * rim * 0.14;

        if (uMode > 1.5) {
          // Cyber Holo styling for the Moon
          float latGrid = abs(fract(vUv.y * 18.0) - 0.5);
          float lonGrid = abs(fract(vUv.x * 36.0) - 0.5);
          float grid = 1.0 - smoothstep(0.0, 0.05, min(latGrid, lonGrid));
          litMoon = mix(litMoon, vec3(0.15, 0.75, 0.95) * (albedo.r + grid * 0.35), 0.55);
        }

        gl_FragColor = vec4(litMoon, 1.0);
      }
    `;

    this.moonMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uMoonMap: { value: this.textures.moonTexture },
        uSunDir: { value: this.sunDirection.clone() },
        uMode: { value: 0.0 }
      },
      vertexShader: moonVertexShader,
      fragmentShader: moonFragmentShader
    });

    this.moonMesh = new THREE.Mesh(moonGeo, this.moonMaterial);
    this.moonMesh.name = 'MoonSurface';
    this.moonMesh.userData = {
      type: 'moon',
      data: {
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
      }
    };

    this.moonSystemGroup.add(this.moonMesh);
    this._updateMoonPosition();
  }

  _updateMoonPosition() {
    if (!this.moonMesh) return;
    const x = Math.cos(this.moonOrbitAngle) * this.moonOrbitRadius;
    const z = Math.sin(this.moonOrbitAngle) * this.moonOrbitRadius;
    this.moonMesh.position.set(x, 0, z);
    // Tidally locked: near side always faces Earth at (0, 0, 0)
    this.moonMesh.lookAt(0, 0, 0);
  }

  getMoonWorldPosition(target = new THREE.Vector3()) {
    if (!this.moonMesh) return target.set(this.moonOrbitRadius, 0, 0);
    return this.moonMesh.getWorldPosition(target);
  }

  setMoonVisible(visible) {
    if (this.moonSystemGroup) {
      this.moonSystemGroup.visible = visible;
    }
  }

  _buildStarfieldAndSun() {
    const starCount = 2800;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xbae6fd),
      new THREE.Color(0xfde68a),
      new THREE.Color(0xc4b5fd)
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 85 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = palette[Math.floor(Math.random() * palette.length)];
      const brightness = 0.55 + Math.random() * 0.45;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.48,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 128;
    sunCanvas.height = 128;
    const ctx = sunCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, 'rgba(255, 255, 240, 1)');
    grad.addColorStop(0.25, 'rgba(253, 224, 71, 0.85)');
    grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const sunTex = new THREE.CanvasTexture(sunCanvas);
    const sunMat = new THREE.SpriteMaterial({
      map: sunTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.sunSprite = new THREE.Sprite(sunMat);
    this.sunSprite.scale.set(16, 16, 1);
    this.scene.add(this.sunSprite);
    this.updateSunByUTCHours(12.0);
  }

  updateSunByUTCHours(utcHours, directionalLight) {
    const sunLon = (12 - utcHours) * 15;
    const sunLat = 16.5;
    this.sunDirection.copy(latLonToVector3(sunLat, sunLon, 1)).normalize();

    this.earthMaterial.uniforms.uSunDir.value.copy(this.sunDirection);
    this.atmosphereMaterial.uniforms.uSunDir.value.copy(this.sunDirection);
    if (this.moonMaterial) {
      this.moonMaterial.uniforms.uSunDir.value.copy(this.sunDirection);
    }

    if (this.sunSprite) {
      this.sunSprite.position.copy(this.sunDirection).multiplyScalar(75);
    }
    if (directionalLight) {
      directionalLight.position.copy(this.sunDirection).multiplyScalar(50);
    }
  }

  setVisualMode(modeName) {
    if (modeName === 'satellite') {
      this.earthMaterial.uniforms.uMode.value = 0.0;
      if (this.moonMaterial) this.moonMaterial.uniforms.uMode.value = 0.0;
      this.coastlineMaterial.opacity = 0.25;
      this.borderMaterial.opacity = 0.14;
      this.coastlineMaterial.color.setHex(0x38bdf8);
      this.atmosphereMaterial.uniforms.uAtmosColor.value.setHex(0x38bdf8);
    } else if (modeName === 'urban') {
      this.earthMaterial.uniforms.uMode.value = 1.0;
      if (this.moonMaterial) this.moonMaterial.uniforms.uMode.value = 1.0;
      this.coastlineMaterial.opacity = 0.62;
      this.borderMaterial.opacity = 0.32;
      this.coastlineMaterial.color.setHex(0x0ea5e9);
      this.atmosphereMaterial.uniforms.uAtmosColor.value.setHex(0x0284c7);
    } else if (modeName === 'holo') {
      this.earthMaterial.uniforms.uMode.value = 2.0;
      if (this.moonMaterial) this.moonMaterial.uniforms.uMode.value = 2.0;
      this.coastlineMaterial.opacity = 0.92;
      this.borderMaterial.opacity = 0.48;
      this.coastlineMaterial.color.setHex(0x22d3ee);
      this.atmosphereMaterial.uniforms.uAtmosColor.value.setHex(0x06b6d4);
    }
  }

  update(elapsedTime, deltaTime, pauseMoonOrbit = false) {
    this.earthMaterial.uniforms.uTime.value = elapsedTime;
    if (this.cloudsMesh && this.cloudsMesh.visible) {
      this.cloudsMesh.rotation.y += deltaTime * 0.012;
    }
    if (this.starfield) {
      this.starfield.rotation.y -= deltaTime * 0.002;
    }
    if (this.moonSystemGroup && this.moonSystemGroup.visible && !pauseMoonOrbit) {
      this.moonOrbitAngle += deltaTime * 0.025;
      this._updateMoonPosition();
    }
  }
}
