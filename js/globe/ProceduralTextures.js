import * as THREE from 'three';
import { CONTINENT_POLYGONS, URBAN_AREAS_DATA } from '../data/openUrbanData.js';
import { LANDMARKS_DATA } from '../data/landmarksData.js';

/**
 * Converts geographic (lat, lon) in degrees to a 3D Cartesian Vector3 on a sphere of given radius.
 * Matches Three.js SphereGeometry UV parameterization (equirectangular projection) exactly:
 * u = (lon + 180) / 360, v = (lat + 90) / 180
 */
export function latLonToVector3(lat, lon, radius = 10) {
  const polar = THREE.MathUtils.degToRad(90 - lat);
  const azimuth = THREE.MathUtils.degToRad(lon + 180);

  const x = -radius * Math.sin(polar) * Math.cos(azimuth);
  const y = radius * Math.cos(polar);
  const z = radius * Math.sin(polar) * Math.sin(azimuth);

  return new THREE.Vector3(x, y, z);
}

/**
 * Public Domain NASA Visible Earth / Blue Marble, NASA Lunar Reconnaissance / Clementine Moon,
 * & Natural Earth (CC0) URLs.
 */
const NASA_TEXTURE_URLS = {
  day: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_atmos_2048.jpg',
  normal: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_normal_2048.jpg',
  specular: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_specular_2048.jpg',
  night: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_lights_2048.png',
  clouds: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/earth_clouds_1024.png',
  moon: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/textures/planets/moon_1024.jpg'
};

const NATURAL_EARTH_GEOJSON_URLS = {
  land: 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_land.geojson',
  coastline:
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_coastline.geojson',
  borders:
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_boundary_lines_land.geojson'
};

/**
 * Loads a single texture via THREE.TextureLoader as a Promise.
 */
function loadTextureAsync(loader, url, isSRGB = true) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        if (isSRGB) {
          tex.colorSpace = THREE.SRGBColorSpace;
        }
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        resolve(tex);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

/**
 * Loads Public Domain NASA Blue Marble 2048x1024 textures, NASA Moon 1024x512 texture,
 * and Natural Earth 110m GeoJSON coastlines.
 */
export async function loadEarthAssets(onProgress) {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  if (onProgress) {
    onProgress(25, 'Loading NASA Blue Marble, Lunar & Natural Earth GeoJSON...');
  }

  let coastlineLines = [];
  let borderLines = [];
  let landPolygons = [];

  try {
    const [landRes, coastRes, borderRes] = await Promise.all([
      fetch(NATURAL_EARTH_GEOJSON_URLS.land),
      fetch(NATURAL_EARTH_GEOJSON_URLS.coastline),
      fetch(NATURAL_EARTH_GEOJSON_URLS.borders)
    ]);

    if (landRes.ok) {
      const landJson = await landRes.json();
      landPolygons = extractLineCoordsFromGeoJSON(landJson);
    }
    if (coastRes.ok) {
      const coastJson = await coastRes.json();
      coastlineLines = extractLineCoordsFromGeoJSON(coastJson);
    }
    if (borderRes.ok) {
      const borderJson = await borderRes.json();
      borderLines = extractLineCoordsFromGeoJSON(borderJson);
    }
  } catch (err) {
    console.warn('Natural Earth GeoJSON fetch failed, using built-in outlines:', err);
    coastlineLines = CONTINENT_POLYGONS;
    landPolygons = CONTINENT_POLYGONS;
  }

  if (coastlineLines.length === 0) {
    coastlineLines = CONTINENT_POLYGONS;
  }

  let dayTexture, bumpTexture, specularTexture, nightTexture, cloudsTexture, moonTexture;

  try {
    const [day, normal, spec, night, clouds] = await Promise.all([
      loadTextureAsync(loader, NASA_TEXTURE_URLS.day, true),
      loadTextureAsync(loader, NASA_TEXTURE_URLS.normal, false),
      loadTextureAsync(loader, NASA_TEXTURE_URLS.specular, false),
      loadTextureAsync(loader, NASA_TEXTURE_URLS.night, true),
      loadTextureAsync(loader, NASA_TEXTURE_URLS.clouds, true)
    ]);

    dayTexture = day;
    bumpTexture = normal;
    specularTexture = spec;
    nightTexture = night;
    cloudsTexture = clouds;
  } catch (err) {
    console.warn('Satellite texture load failed, synthesizing from Natural Earth GeoJSON:', err);
    const fallback = generateGeoJSONFallbackTextures(
      landPolygons.length ? landPolygons : coastlineLines
    );
    dayTexture = fallback.dayTexture;
    bumpTexture = fallback.bumpTexture;
    specularTexture = fallback.specularTexture;
    nightTexture = fallback.nightTexture;
    cloudsTexture = fallback.cloudsTexture;
  }

  try {
    moonTexture = await loadTextureAsync(loader, NASA_TEXTURE_URLS.moon, true);
  } catch (err) {
    console.warn('Moon texture load failed, synthesizing procedural lunar surface:', err);
    moonTexture = generateProceduralMoonTexture();
  }

  if (onProgress) {
    onProgress(75, 'Building 3D Earth, Lunar Orbit & Landmarks...');
  }

  return {
    dayTexture,
    bumpTexture,
    specularTexture,
    nightTexture,
    cloudsTexture,
    moonTexture,
    coastlineLines,
    borderLines
  };
}

/**
 * Extracts arrays of [lon, lat] coordinate sequences from a GeoJSON FeatureCollection
 */
function extractLineCoordsFromGeoJSON(geojson) {
  const lines = [];
  if (!geojson || !Array.isArray(geojson.features)) return lines;

  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (!geom) continue;

    if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
      lines.push(geom.coordinates);
    } else if (geom.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
      for (const line of geom.coordinates) {
        lines.push(line);
      }
    } else if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
      for (const ring of geom.coordinates) {
        lines.push(ring);
      }
    } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          lines.push(ring);
        }
      }
    }
  }
  return lines;
}

/**
 * Generates procedural skyscraper window facade texture used by LandmarkBuilder
 */
export function createBuildingFacadeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 512);

  const cols = 16;
  const rows = 48;
  const padX = 3;
  const padY = 3;
  const cellW = 256 / cols;
  const cellH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = Math.sin(r * 37.3 + c * 91.7) * 43758.5453;
      const rand = seed - Math.floor(seed);

      if (rand > 0.36) {
        if (rand > 0.82) {
          ctx.fillStyle = '#fde68a';
        } else if (rand > 0.58) {
          ctx.fillStyle = '#bae6fd';
        } else {
          ctx.fillStyle = '#38bdf8';
        }
      } else {
        ctx.fillStyle = '#1e293b';
      }

      ctx.fillRect(c * cellW + padX, r * cellH + padY, cellW - padX * 1.6, cellH - padY * 1.6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a procedural lunar texture with maria plains and impact craters as an offline fallback
 */
export function generateProceduralMoonTexture() {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(0, 0, w, h);

  // Dark basaltic lunar maria basins
  for (let i = 0; i < 18; i++) {
    const mx = ((i * 173) % w);
    const my = 90 + ((i * 97) % (h - 180));
    const mr = 35 + ((i * 41) % 85);
    const grad = ctx.createRadialGradient(mx, my, mr * 0.1, mx, my, mr);
    grad.addColorStop(0, 'rgba(75, 85, 99, 0.72)');
    grad.addColorStop(0.7, 'rgba(107, 114, 128, 0.35)');
    grad.addColorStop(1, 'rgba(156, 163, 175, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact craters with bright ejecta rims
  for (let c = 0; c < 180; c++) {
    const cx = (Math.sin(c * 12.9898) * 0.5 + 0.5) * w;
    const cy = (Math.cos(c * 78.233) * 0.5 + 0.5) * h;
    const cr = 2 + (c % 18);

    ctx.strokeStyle = 'rgba(229, 231, 235, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(55, 65, 81, 0.45)';
    ctx.beginPath();
    ctx.arc(cx + 0.8, cy + 0.8, cr * 0.82, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * High-accuracy fallback texture generator using Natural Earth polygons if image CDN is unreachable.
 */
function generateGeoJSONFallbackTextures(polygons) {
  const width = 2048;
  const height = 1024;

  const dayCanvas = document.createElement('canvas');
  dayCanvas.width = width;
  dayCanvas.height = height;
  const ctx = dayCanvas.getContext('2d');

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c4a6e');
  oceanGrad.addColorStop(0.5, '#082f49');
  oceanGrad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#2d6a4f';
  ctx.strokeStyle = '#52b788';
  ctx.lineWidth = 1.5;

  for (const poly of polygons) {
    ctx.beginPath();
    poly.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  const specCanvas = document.createElement('canvas');
  specCanvas.width = width;
  specCanvas.height = height;
  const sCtx = specCanvas.getContext('2d');
  sCtx.fillStyle = '#ffffff';
  sCtx.fillRect(0, 0, width, height);
  sCtx.fillStyle = '#111111';
  for (const poly of polygons) {
    sCtx.beginPath();
    poly.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (i === 0) sCtx.moveTo(x, y);
      else sCtx.lineTo(x, y);
    });
    sCtx.closePath();
    sCtx.fill();
  }

  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nCtx = nightCanvas.getContext('2d');
  nCtx.fillStyle = '#000000';
  nCtx.fillRect(0, 0, width, height);
  for (const c of [...URBAN_AREAS_DATA, ...LANDMARKS_DATA]) {
    const x = ((c.lon + 180) / 360) * width;
    const y = ((90 - c.lat) / 180) * height;
    const grad = nCtx.createRadialGradient(x, y, 1, x, y, 14);
    grad.addColorStop(0, 'rgba(254, 240, 138, 1)');
    grad.addColorStop(0.4, 'rgba(251, 191, 36, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    nCtx.fillStyle = grad;
    nCtx.beginPath();
    nCtx.arc(x, y, 14, 0, Math.PI * 2);
    nCtx.fill();
  }

  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 512;
  cloudCanvas.height = 256;
  const cCtx = cloudCanvas.getContext('2d');
  cCtx.fillStyle = '#000000';
  cCtx.fillRect(0, 0, 512, 256);

  const dayTexture = new THREE.CanvasTexture(dayCanvas);
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  const specularTexture = new THREE.CanvasTexture(specCanvas);
  const nightTexture = new THREE.CanvasTexture(nightCanvas);
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  const cloudsTexture = new THREE.CanvasTexture(cloudCanvas);

  return {
    dayTexture,
    bumpTexture: specularTexture,
    specularTexture,
    nightTexture,
    cloudsTexture
  };
}
