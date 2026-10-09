const places = [
  { name: 'Yaşamkent Mahallesi', lon: 32.6515, lat: 39.8655, type: 'home', label_tr: '🏠 Ev', label_en: '🏠 Home' },
  { name: 'Hacettepe Üniversitesi - Harita Mühendisliği', lon: 32.7350, lat: 39.8665, type: 'school', label_tr: '🎓 Okul', label_en: '🎓 School' },
  { name: 'Anıtkabir', lon: 32.8369, lat: 39.9250, type: 'monument', label_tr: '🏛️ Anıtkabir', label_en: '🏛️ Anıtkabir' },
  { name: 'Kızılay Meydanı', lon: 32.8543, lat: 39.9208, type: 'square', label_tr: '📍 Kızılay', label_en: '📍 Kızılay' }
];

const MIN_MARKER_ZOOM = 8;

const olFeatures = places.map(p => new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([p.lon, p.lat])),
  name: p.name,
  type: p.type,
  label_tr: p.label_tr,
  label_en: p.label_en
}));

function createPinStyle(feature) {
  const type = feature.get('type');
  const lang = localStorage.getItem('site_lang') || 'en';
  const label = lang === 'tr' ? feature.get('label_tr') : feature.get('label_en');
  
  let bgColor = '#58a6ff';
  if (type === 'home') bgColor = '#1f6beb';      
  if (type === 'school') bgColor = '#238636';    
  if (type === 'monument') bgColor = '#d29922';  
  if (type === 'square') bgColor = '#da3633';    

  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: 10,
      fill: new ol.style.Fill({ color: bgColor }),
      stroke: new ol.style.Stroke({ color: '#ffffff', width: 2.5 })
    }),
    text: new ol.style.Text({
      text: label,
      font: 'bold 12px "Space Grotesk", sans-serif',
      offsetY: -20,
      fill: new ol.style.Fill({ color: '#ffffff' }),
      stroke: new ol.style.Stroke({ color: '#0d1117', width: 3 })
    })
  });
}

const olVectorSource = new ol.source.Vector({ features: olFeatures, wrapX: false });
const olVectorLayer = new ol.layer.Vector({
  source: olVectorSource,
  style: createPinStyle
});

const olMap = new ol.Map({
  target: 'ol-map',
  layers: [
    new ol.layer.Tile({ source: new ol.source.OSM({ wrapX: false }) }),
    olVectorLayer
  ],
  view: new ol.View({ center: ol.proj.fromLonLat([32.78, 39.90]), zoom: 11, minZoom: 2, maxZoom: 19, multiWorld: false })
});

function updateOLMarkers() {
  olVectorLayer.setVisible(olMap.getView().getZoom() >= MIN_MARKER_ZOOM);
}

olMap.getView().on('change:resolution', updateOLMarkers);
updateOLMarkers();

const leafletMap = L.map('leaflet-map', {
  worldCopyJump: false,
  maxBounds: [[-85, -180], [85, 180]],
  maxBoundsViscosity: 1.0,
  minZoom: 2
}).setView([39.90, 32.78], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  noWrap: true,
  bounds: [[-85, -180], [85, 180]],
  minZoom: 2,
  maxZoom: 19
}).addTo(leafletMap);

const leafletMarkers = L.layerGroup();
let leafletMarkerObjects = [];

places.forEach(p => {
  const marker = L.marker([p.lat, p.lon]);
  leafletMarkerObjects.push({ marker, place: p });
  marker.addTo(leafletMarkers);
});

function updateLeafletPopups() {
  const lang = localStorage.getItem('site_lang') || 'en';
  leafletMarkerObjects.forEach(item => {
    const label = lang === 'tr' ? item.place.label_tr : item.place.label_en;
    item.marker.bindPopup(`<strong>${label} - ${item.place.name}</strong>`);
  });
}
updateLeafletPopups();

function updateLeafletMarkers() {
  if (leafletMap.getZoom() >= MIN_MARKER_ZOOM) {
    if (!leafletMap.hasLayer(leafletMarkers)) leafletMarkers.addTo(leafletMap);
  } else if (leafletMap.hasLayer(leafletMarkers)) {
    leafletMap.removeLayer(leafletMarkers);
  }
}

leafletMap.on('zoomend', updateLeafletMarkers);
updateLeafletMarkers();

window.addEventListener('resize', () => { 
  olMap.updateSize(); 
  leafletMap.invalidateSize(); 
});

window.addEventListener('languageChanged', () => {
  olVectorLayer.changed();
  updateLeafletPopups();
});
