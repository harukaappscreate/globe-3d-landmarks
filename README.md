# TerraVista 3D — Interactive Earth, Moon, Landmarks & Open Urban Data Globe

**Live Demo (GitHub Pages):** [https://harukaappscreate.github.io/globe-3d-landmarks/](https://harukaappscreate.github.io/globe-3d-landmarks/)  
**Repository:** [https://github.com/harukaappscreate/globe-3d-landmarks](https://github.com/harukaappscreate/globe-3d-landmarks)

An interactive 3D Earth and Lunar visualization built with **Three.js (WebGL / Custom GLSL Shaders)**, combining NASA satellite imagery, Natural Earth vector geography, procedural 3D architectural monuments, and UN Open Urban Data. Designed with a responsive HUD for both desktop and mobile devices, custom inline SVG iconography, English/Japanese bilingual switching, and a full-screen Showcase/Wallpaper mode.

Three.js（WebGL / カスタムGLSLシェーダー）を用いた、地球・月・世界主要ランドマークの3D建築表現とオープンデータ（都市圏人口・ネットワーク）の立体可視化を融合したインタラクティブ3D地球儀アプリケーションです。PC・スマートフォンの双方に対応したレスポンシブ設計となっています。

## Key Features / 主な特徴

- **Realistic Earth & Custom GLSL Atmosphere / 高精細3D地球儀 & 大気シェーダー**
  Combines NASA Blue Marble Next Generation (2048×1024) daytime albedo, topographic normal relief, ocean specular reflections, NASA Earth at Night city lights across the solar terminator, volumetric cloud layers, and Natural Earth 110m 3D vector coastlines and borders.
  NASA Blue Marble 衛星画像、法線マップによる山脈陰影、海洋の太陽光反射、昼夜境界線（ターミネーター）に連動する夜間都市光、および Natural Earth 110m GeoJSON による立体海岸線・国境線を描画します。
- **3D Moon & Earthrise Camera / 3D月軌道 &「地球の出」カメラ視点**
  Features the Moon in an inclined 5.14° orbit at its authentic 27.3% Earth-radius ratio, rendered with a custom GLSL shader for crater normal shadows, solar-synced lunar phases, and bluish Earthshine. Clicking the **Moon** button flies the camera to Lunar Orbit for an "Earthrise" perspective or a close-up crater orbit.
  実際のサイズ比（地球の約27.3%）と軌道傾斜角（5.14°）で公転する3D月を実装。太陽位置に連動する満ち欠け、クレーター陰影、地球からの反射光が夜側を照らす「地球照（Earthshine）」を表現し、ワンクリックで「地球の出（Earthrise）」アングルへ移動できます。
- **15 Procedural 3D World Landmarks & Urban Skylines / 世界15箇所の3Dランドマーク & 都市スカイライン**
  Synthesizes recognizable 3D architectural monuments (Tokyo Tower, Tokyo Skytree, Eiffel Tower, Statue of Liberty, Great Pyramids of Giza & Sphinx, Sydney Opera House, Big Ben & London Eye, Burj Khalifa, Colosseum, Taj Mahal, Golden Gate Bridge, Christ the Redeemer, Great Wall of China, Marina Bay Sands, and Sagrada Família) using `LatheGeometry`, `ExtrudeGeometry`, tubular trusses, and illuminated window facade textures without external commercial 3D assets.
  外部の商用3Dモデルに依存せず、Three.jsの複合ジオメトリと窓ファサードテクスチャによって世界15箇所の象徴的ランドマークと周辺の3D高層ビル群を地表法線方向に立体構築しています。
- **Open Urban Data Visualization / オープンデータによる世界都市圏の可視化**
  Includes 45+ global metropolitan agglomerations based on UN World Urbanization Prospects and Natural Earth public domain data, with toggleable 3D hexagonal population pillars and inter-city flight/data arcs.
  国連都市人口統計およびパブリックドメイン地理データに基づき、世界45以上の主要都市圏（メガシティ）のデータを収録。オプションから3Dヘキサゴン人口ピラーや都市間3Dアークの表示を切り替えられます。
- **Bilingual UI (EN / JA), Custom SVGs & Showcase Mode / 日英切替・オリジナルSVG・鑑賞モード**
  Defaults to English with instant switching to Japanese (`EN` / `JA`). Features a default-collapsed left explorer drawer and a full HUD hide mode (**Showcase button** or **`[H]` key**) ideal for ambient viewing or desktop live wallpapers.
  英語をデフォルトとし、ワンクリックで日本語へリアルタイム切替可能。左パネルはデフォルト格納されており、`[H]` キーまたは「Showcase」ボタンで全HUDを非表示にして純粋な鑑賞用・デスクトップ背景として利用できます。

## Directory Structure / ディレクトリ構成

```text
globe-3d-landmarks/
├── index.html                  # Entry point & ES Module importmap (Three.js latest)
├── css/
│   └── style.css               # Responsive styles for Desktop HUD, Mobile Bottom Sheet & Showcase Mode
├── js/
│   ├── main.js                 # Application bootstrap & animation loop
│   ├── core/
│   │   └── SceneManager.js     # Camera transitions (Overview / 3D Skyline / Lunar Earthrise), OrbitControls & Bloom
│   ├── globe/
│   │   ├── EarthBuilder.js     # Earth & Moon GLSL shaders, atmosphere, clouds, 3D GeoJSON coastlines & starfield
│   │   ├── LandmarkBuilder.js  # 15 procedural 3D architectural monuments & textured urban skylines
│   │   ├── UrbanDataLayer.js   # Open Data 3D population pillars, inter-city 3D arcs & orbital satellites
│   │   └── ProceduralTextures.js # Asset loader (NASA Blue Marble, Moon, Natural Earth GeoJSON) & fallbacks
│   ├── data/
│   │   ├── landmarksData.js    # Bilingual (EN/JA) world landmarks metadata & coordinates
│   │   └── openUrbanData.js    # Bilingual (EN/JA) global metropolitan Open Data & inter-city routes
│   └── ui/
│       └── UIManager.js        # Bilingual UI controller, search/filter, 3D projected labels & raycasting
├── .gitignore
├── LICENSE                     # MIT License (Copyright (c) 2026 haruka_apps)
└── README.md
```

## Running Locally / ローカル環境での起動方法

Because this project uses standard ES Modules (`<script type="module">`), serve the root directory via any local HTTP server:

本プロジェクトは標準的な ES Modules を使用しているため、ローカルWebサーバー経由で開いてください（オンライン環境では [GitHub Pages デモ](https://harukaappscreate.github.io/globe-3d-landmarks/) からそのままアクセスできます）。

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Data Sources & License / オープンデータ出典・ライセンス

- **Source Code**: [MIT License](./LICENSE) — Copyright (c) 2026 haruka_apps
- **3D Engine**: [Three.js](https://threejs.org/) (MIT License)
- **Satellite & Lunar Imagery**: NASA Visible Earth / Blue Marble Next Generation, NASA Earth Observatory, and NASA Lunar Reconnaissance Orbiter (Public Domain)
- **Vector Coastlines, Borders & Urban Statistics**: [Natural Earth 110m](https://www.naturalearthdata.com/) (Public Domain / CC0) and UN World Urbanization Prospects open statistical data. All 3D landmark geometries and building facade textures are procedurally generated in code.
