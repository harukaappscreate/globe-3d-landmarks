/**
 * Open Urban Agglomerations, Inter-City Network Arcs & Simplified Continental Polygons (Bilingual EN / JA)
 * Sources:
 * - UN World Urbanization Prospects (Open Statistical Data)
 * - Natural Earth 110m Simplified Coastlines & Populated Places (Public Domain / CC0)
 */

export const URBAN_AREAS_DATA = [
  // Asia
  { id: 'tokyo', nameEn: 'Greater Tokyo Area', nameJa: '東京都市圏', countryEn: 'Japan', countryJa: '日本', region: 'Asia', lat: 35.6895, lon: 139.6917, popM: 37.4, density: 4750, hub: true },
  { id: 'osaka', nameEn: 'Osaka-Kobe-Kyoto (Keihanshin)', nameJa: '京阪神大都市圏 (大阪)', countryEn: 'Japan', countryJa: '日本', region: 'Asia', lat: 34.6937, lon: 135.5023, popM: 19.1, density: 3820, hub: false },
  { id: 'nagoya', nameEn: 'Chukyo Metropolitan Area (Nagoya)', nameJa: '中京大都市圏 (名古屋)', countryEn: 'Japan', countryJa: '日本', region: 'Asia', lat: 35.1815, lon: 136.9066, popM: 9.5, density: 2950, hub: false },
  { id: 'fukuoka', nameEn: 'Fukuoka-Kitakyushu', nameJa: '福岡・北九州都市圏', countryEn: 'Japan', countryJa: '日本', region: 'Asia', lat: 33.5904, lon: 130.4017, popM: 5.5, density: 2600, hub: false },
  { id: 'sapporo', nameEn: 'Greater Sapporo', nameJa: '札幌都市圏', countryEn: 'Japan', countryJa: '日本', region: 'Asia', lat: 43.0618, lon: 141.3545, popM: 2.7, density: 2100, hub: false },
  { id: 'delhi', nameEn: 'Delhi NCR', nameJa: 'デリー首都圏', countryEn: 'India', countryJa: 'インド', region: 'Asia', lat: 28.6139, lon: 77.2090, popM: 32.9, density: 11300, hub: true },
  { id: 'shanghai', nameEn: 'Shanghai Metro', nameJa: '上海都市圏', countryEn: 'China', countryJa: '中国', region: 'Asia', lat: 31.2304, lon: 121.4737, popM: 29.2, density: 6800, hub: true },
  { id: 'dhaka', nameEn: 'Greater Dhaka', nameJa: 'ダッカ都市圏', countryEn: 'Bangladesh', countryJa: 'バングラデシュ', region: 'Asia', lat: 23.8103, lon: 90.4125, popM: 23.2, density: 19400, hub: false },
  { id: 'beijing', nameEn: 'Beijing Metro', nameJa: '北京都市圏', countryEn: 'China', countryJa: '中国', region: 'Asia', lat: 39.9042, lon: 116.4074, popM: 21.3, density: 5200, hub: true },
  { id: 'mumbai', nameEn: 'Mumbai Metropolitan Region', nameJa: 'ムンバイ都市圏', countryEn: 'India', countryJa: 'インド', region: 'Asia', lat: 19.0760, lon: 72.8777, popM: 21.3, density: 20400, hub: true },
  { id: 'seoul', nameEn: 'Seoul Capital Area', nameJa: 'ソウル首都圏', countryEn: 'South Korea', countryJa: '韓国', region: 'Asia', lat: 37.5665, lon: 126.9780, popM: 24.8, density: 10200, hub: true },
  { id: 'jakarta', nameEn: 'Jakarta (Jabodetabek)', nameJa: 'ジャカルタ首都圏', countryEn: 'Indonesia', countryJa: 'インドネシア', region: 'Asia', lat: -6.2088, lon: 106.8456, popM: 33.4, density: 9600, hub: true },
  { id: 'manila', nameEn: 'Metro Manila', nameJa: 'マニラ首都圏', countryEn: 'Philippines', countryJa: 'フィリピン', region: 'Asia', lat: 14.5995, lon: 120.9842, popM: 24.9, density: 14500, hub: false },
  { id: 'guangzhou', nameEn: 'Guangzhou-Shenzhen (Pearl River)', nameJa: '広州・深圳 (珠江デルタ)', countryEn: 'China', countryJa: '中国', region: 'Asia', lat: 23.1291, lon: 113.2644, popM: 26.9, density: 6100, hub: false },
  { id: 'bangkok', nameEn: 'Bangkok Metropolitan Region', nameJa: 'バンコク首都圏', countryEn: 'Thailand', countryJa: 'タイ', region: 'Asia', lat: 13.7563, lon: 100.5018, popM: 17.1, density: 5400, hub: true },
  { id: 'kolkata', nameEn: 'Greater Kolkata', nameJa: 'コルカタ都市圏', countryEn: 'India', countryJa: 'インド', region: 'Asia', lat: 22.5726, lon: 88.3639, popM: 15.3, density: 11800, hub: false },
  { id: 'singapore', nameEn: 'Singapore Urban Area', nameJa: 'シンガポール都市圏', countryEn: 'Singapore', countryJa: 'シンガポール', region: 'Asia', lat: 1.3521, lon: 103.8198, popM: 6.0, density: 8350, hub: true },
  { id: 'taipei', nameEn: 'Taipei-Keelung Metro', nameJa: '台北・基隆都市圏', countryEn: 'Taiwan', countryJa: '台湾', region: 'Asia', lat: 25.0330, lon: 121.5654, popM: 7.1, density: 6400, hub: false },
  { id: 'hongkong', nameEn: 'Hong Kong SAR', nameJa: '香港特別行政区', countryEn: 'China / Hong Kong', countryJa: '中国・香港', region: 'Asia', lat: 22.3193, lon: 114.1694, popM: 7.5, density: 6900, hub: true },

  // Americas
  { id: 'saopaulo', nameEn: 'Greater São Paulo', nameJa: 'サンパウロ大都市圏', countryEn: 'Brazil', countryJa: 'ブラジル', region: 'Americas', lat: -23.5505, lon: -46.6333, popM: 22.6, density: 7200, hub: true },
  { id: 'mexicocity', nameEn: 'Valley of Mexico (Mexico City)', nameJa: 'メキシコシティ都市圏', countryEn: 'Mexico', countryJa: 'メキシコ', region: 'Americas', lat: 19.4326, lon: -99.1332, popM: 22.3, density: 8900, hub: true },
  { id: 'newyork', nameEn: 'New York Tri-State Area', nameJa: 'ニューヨーク大都市圏', countryEn: 'United States', countryJa: 'アメリカ', region: 'Americas', lat: 40.7128, lon: -74.0060, popM: 18.9, density: 4200, hub: true },
  { id: 'buenosaires', nameEn: 'Greater Buenos Aires', nameJa: 'ブエノスアイレス都市圏', countryEn: 'Argentina', countryJa: 'アルゼンチン', region: 'Americas', lat: -34.6037, lon: -58.3816, popM: 15.5, density: 5800, hub: false },
  { id: 'losangeles', nameEn: 'Greater Los Angeles', nameJa: 'ロサンゼルス都市圏', countryEn: 'United States', countryJa: 'アメリカ', region: 'Americas', lat: 34.0522, lon: -118.2437, popM: 12.5, density: 3100, hub: true },
  { id: 'rio', nameEn: 'Rio de Janeiro Metro', nameJa: 'リオデジャネイロ都市圏', countryEn: 'Brazil', countryJa: 'ブラジル', region: 'Americas', lat: -22.9068, lon: -43.1729, popM: 13.7, density: 6400, hub: false },
  { id: 'bogota', nameEn: 'Bogotá Savanna', nameJa: 'ボゴタ首都圏', countryEn: 'Colombia', countryJa: 'コロンビア', region: 'Americas', lat: 4.7110, lon: -74.0721, popM: 11.5, density: 13200, hub: false },
  { id: 'lima', nameEn: 'Lima Metropolitan Area', nameJa: 'リマ都市圏', countryEn: 'Peru', countryJa: 'ペルー', region: 'Americas', lat: -12.0464, lon: -77.0428, popM: 11.2, density: 9100, hub: false },
  { id: 'chicago', nameEn: 'Chicagoland (Greater Chicago)', nameJa: 'シカゴ都市圏', countryEn: 'United States', countryJa: 'アメリカ', region: 'Americas', lat: 41.8781, lon: -87.6298, popM: 8.9, density: 2800, hub: false },
  { id: 'toronto', nameEn: 'Greater Toronto Area (GTA)', nameJa: 'トロント都市圏', countryEn: 'Canada', countryJa: 'カナダ', region: 'Americas', lat: 43.6532, lon: -79.3832, popM: 6.4, density: 3400, hub: false },
  { id: 'sanfrancisco', nameEn: 'San Francisco Bay Area', nameJa: 'サンフランシスコ・ベイエリア', countryEn: 'United States', countryJa: 'アメリカ', region: 'Americas', lat: 37.7749, lon: -122.4194, popM: 4.7, density: 3600, hub: true },

  // Europe
  { id: 'moscow', nameEn: 'Moscow Metropolitan Area', nameJa: 'モスクワ都市圏', countryEn: 'Russia', countryJa: 'ロシア', region: 'Europe', lat: 55.7558, lon: 37.6173, popM: 12.7, density: 4900, hub: false },
  { id: 'paris', nameEn: 'Paris (Île-de-France)', nameJa: 'パリ都市圏 (イル＝ド＝フランス)', countryEn: 'France', countryJa: 'フランス', region: 'Europe', lat: 48.8566, lon: 2.3522, popM: 11.2, density: 3900, hub: true },
  { id: 'london', nameEn: 'Greater London Urban Area', nameJa: 'ロンドン大都市圏', countryEn: 'United Kingdom', countryJa: 'イギリス', region: 'Europe', lat: 51.5074, lon: -0.1278, popM: 9.6, density: 5600, hub: true },
  { id: 'madrid', nameEn: 'Madrid Metropolitan Area', nameJa: 'マドリード都市圏', countryEn: 'Spain', countryJa: 'スペイン', region: 'Europe', lat: 40.4168, lon: -3.7038, popM: 6.7, density: 4800, hub: false },
  { id: 'barcelona', nameEn: 'Metropolitan Area of Barcelona', nameJa: 'バルセロナ都市圏', countryEn: 'Spain', countryJa: 'スペイン', region: 'Europe', lat: 41.3874, lon: 2.1686, popM: 5.7, density: 5300, hub: false },
  { id: 'berlin', nameEn: 'Berlin-Brandenburg', nameJa: 'ベルリン都市圏', countryEn: 'Germany', countryJa: 'ドイツ', region: 'Europe', lat: 52.5200, lon: 13.4050, popM: 4.7, density: 4100, hub: false },
  { id: 'frankfurt', nameEn: 'Frankfurt Rhine-Main', nameJa: 'フランクフルト・ライン＝マイン圏', countryEn: 'Germany', countryJa: 'ドイツ', region: 'Europe', lat: 50.1109, lon: 8.6821, popM: 5.8, density: 3200, hub: true },
  { id: 'rome', nameEn: 'Rome Metropolitan City', nameJa: 'ローマ首都圏', countryEn: 'Italy', countryJa: 'イタリア', region: 'Europe', lat: 41.9028, lon: 12.4964, popM: 4.3, density: 3400, hub: false },

  // Middle East, Africa & Oceania
  { id: 'cairo', nameEn: 'Greater Cairo', nameJa: '大カイロ都市圏', countryEn: 'Egypt', countryJa: 'エジプト', region: 'MEA_Oceania', lat: 30.0444, lon: 31.2357, popM: 21.8, density: 9800, hub: true },
  { id: 'lagos', nameEn: 'Lagos Metropolitan Area', nameJa: 'ラゴス都市圏', countryEn: 'Nigeria', countryJa: 'ナイジェリア', region: 'MEA_Oceania', lat: 6.5244, lon: 3.3792, popM: 15.9, density: 13700, hub: true },
  { id: 'kinshasa', nameEn: 'Kinshasa Urban Area', nameJa: 'キンシャサ都市圏', countryEn: 'DR Congo', countryJa: 'コンゴ民主共和国', region: 'MEA_Oceania', lat: -4.4419, lon: 15.2663, popM: 16.3, density: 14200, hub: false },
  { id: 'istanbul', nameEn: 'Istanbul Metropolitan Area', nameJa: 'イスタンブール都市圏', countryEn: 'Turkey', countryJa: 'トルコ', region: 'MEA_Oceania', lat: 41.0082, lon: 28.9784, popM: 15.8, density: 6200, hub: true },
  { id: 'johannesburg', nameEn: 'Greater Johannesburg (Gauteng)', nameJa: 'ヨハネスブルグ都市圏', countryEn: 'South Africa', countryJa: '南アフリカ', region: 'MEA_Oceania', lat: -26.2041, lon: 28.0473, popM: 6.2, density: 3500, hub: true },
  { id: 'dubai', nameEn: 'Dubai-Sharjah-Ajman Metro', nameJa: 'ドバイ・シャルジャ都市圏', countryEn: 'United Arab Emirates', countryJa: 'アラブ首長国連邦', region: 'MEA_Oceania', lat: 25.2048, lon: 55.2708, popM: 3.6, density: 2800, hub: true },
  { id: 'sydney', nameEn: 'Greater Sydney', nameJa: 'シドニー都市圏', countryEn: 'Australia', countryJa: 'オーストラリア', region: 'MEA_Oceania', lat: -33.8688, lon: 151.2093, popM: 5.1, density: 2400, hub: true },
  { id: 'melbourne', nameEn: 'Greater Melbourne', nameJa: 'メルボルン都市圏', countryEn: 'Australia', countryJa: 'オーストラリア', region: 'MEA_Oceania', lat: -37.8136, lon: 144.9631, popM: 5.0, density: 2200, hub: false }
];

export const GLOBAL_ARCS_DATA = [
  ['tokyo', 'sanfrancisco', '#38bdf8'],
  ['tokyo', 'losangeles', '#38bdf8'],
  ['tokyo', 'newyork', '#7dd3fc'],
  ['tokyo', 'london', '#38bdf8'],
  ['tokyo', 'paris', '#a78bfa'],
  ['tokyo', 'singapore', '#34d399'],
  ['tokyo', 'sydney', '#34d399'],
  ['tokyo', 'seoul', '#fbbf24'],
  ['tokyo', 'shanghai', '#fbbf24'],
  ['tokyo', 'dubai', '#f472b6'],
  ['london', 'newyork', '#38bdf8'],
  ['london', 'paris', '#fbbf24'],
  ['london', 'dubai', '#a78bfa'],
  ['london', 'singapore', '#38bdf8'],
  ['london', 'johannesburg', '#34d399'],
  ['newyork', 'saopaulo', '#34d399'],
  ['newyork', 'sanfrancisco', '#fbbf24'],
  ['newyork', 'mexicocity', '#fb923c'],
  ['newyork', 'frankfurt', '#38bdf8'],
  ['singapore', 'sydney', '#34d399'],
  ['singapore', 'dubai', '#f472b6'],
  ['singapore', 'mumbai', '#fbbf24'],
  ['singapore', 'jakarta', '#34d399'],
  ['dubai', 'cairo', '#fbbf24'],
  ['dubai', 'istanbul', '#fb923c'],
  ['cairo', 'lagos', '#34d399'],
  ['saopaulo', 'buenosaires', '#fbbf24'],
  ['shanghai', 'frankfurt', '#a78bfa']
];

export const CONTINENT_POLYGONS = [
  [
    [130.0, 31.3], [131.6, 32.0], [132.5, 33.8], [134.8, 34.5], [136.9, 34.6],
    [138.9, 34.9], [139.8, 35.5], [140.8, 35.8], [141.0, 38.3], [141.9, 40.0],
    [140.8, 41.4], [139.9, 40.5], [138.9, 37.9], [136.7, 37.3], [135.2, 35.6],
    [132.5, 35.3], [130.9, 34.0], [130.0, 31.3]
  ]
];
