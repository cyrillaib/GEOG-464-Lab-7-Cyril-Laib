/* GEOG 464 – Lab 7 Web Atlas */

let myMap = null;
let currentDataLayer = null;

// Final URLs for datasets
const STATIONS_URL  = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-7/refs/heads/main/DATA/train-stations.geojson";
const MEGACITIES_URL = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-7/refs/heads/main/DATA/megacities.geojson";

function fetchData(url){
  return fetch(url)
    .then(r => r.json())
    .then(json => {
      if (currentDataLayer) currentDataLayer.remove();
      currentDataLayer = L.geoJSON(json, {style: styleAll, pointToLayer: generateCircles, onEachFeature: addPopups});
      currentDataLayer.addTo(myMap);
    })
    .catch(err => console.error('fetchData error:', err));
}

function generateCircles(feature, latlng){ return L.circleMarker(latlng); }

function styleAll(feature, latlng){
  var styles = {stroke:true, color:'#000', opacity:1, weight:1, fillColor:'#fff', fillOpacity:0.5, radius:9};
  if (feature.geometry && feature.geometry.type === "Point"){ styles.stroke=true; }
  const props = feature.properties || {};
  const hasPostal = Object.keys(props).some(k => /postal/i.test(k) && props[k]);
  if (hasPostal) styles.fillColor = 'cyan';
  const pop = Number(props.population);
  if (!isNaN(pop)) styles.radius = Math.max(6, Math.min(22, Math.sqrt(pop)/300));
  return styles;
}

function addPopups(feature, layer){
  const props = feature.properties || {};
  const nameKey = Object.keys(props).find(k => /name|station/i.test(k));
  const title = nameKey ? props[nameKey] : 'Feature';
  const list = Object.entries(props).map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  const html = `<strong>${title}</strong><br/><dl class='props'>${list}</dl>`;
  layer.bindPopup(html, {maxWidth:300});
}

function loadMap(mapid){
  try{ if (myMap) myMap.remove(); } catch(e){ console.log('no map to delete'); }
  finally{
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'});
    const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'&copy; OpenStreetMap & CARTO'});
    myMap = L.map('map',{center:[20,0],zoom:2,layers:[cartoLight]});
    L.control.layers({'CARTO Light':cartoLight,'OpenStreetMap':osm},{}).addTo(myMap);
    if (mapid==='mapa'){ myMap.setView([45.5,-73.6],10); fetchData(STATIONS_URL); }
    else if (mapid==='mapb'){ myMap.setView([20,0],2); fetchData(MEGACITIES_URL); }
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const sel=document.getElementById('mapdropdown');
  if(!sel)return;
  sel.addEventListener('change',e=>{
    const val=e.target.value;
    if(val!=='map0') loadMap(val);
  });
});
