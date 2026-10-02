const DottedMap = require('dotted-map').default;
const fs = require('fs');

const map = new DottedMap({ height: 60, grid: 'diagonal', countries: ['IND'] });

const cities = [
  { id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, isFeatured: true },
  { id: 'chandigarh', name: 'Chandigarh / Punjab', lat: 30.7333, lng: 76.7794 },
  { id: 'jaipur', name: 'Jaipur / Pilani', lat: 26.9124, lng: 75.7873 },
  { id: 'lucknow', name: 'Lucknow / Kanpur', lat: 26.8467, lng: 80.9462 },
  { id: 'mumbai', name: 'Mumbai / Pune', lat: 19.0760, lng: 72.8777 },
  { id: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { id: 'kolkata', name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { id: 'chennai', name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { id: 'guwahati', name: 'Guwahati / Assam', lat: 26.1445, lng: 91.7362 }
];

const pinCoords = {};
cities.forEach(c => {
  const pin = map.getPin({ lat: c.lat, lng: c.lng });
  pinCoords[c.id] = pin;
});

const svg = map.getSVG({
  radius: 0.28,
  color: '#A0D3F8',
  shape: 'circle',
  backgroundColor: 'transparent'
});

const match = svg.match(/viewBox="([^"]+)"/);
const viewBox = match ? match[1] : '0 0 58 60';
const [minX, minY, width, height] = viewBox.split(' ').map(Number);

console.log('ViewBox:', viewBox);
console.log('Pin Coords:', JSON.stringify(pinCoords, null, 2));

// Calculate percentage for each pin relative to viewBox
const pinPercentages = {};
Object.keys(pinCoords).forEach(id => {
  const p = pinCoords[id];
  pinPercentages[id] = {
    xPercent: ((p.x - minX) / width) * 100,
    yPercent: ((p.y - minY) / height) * 100
  };
});

console.log('Pin Percentages:', JSON.stringify(pinPercentages, null, 2));

// Save output
fs.writeFileSync('./src/data/indiaDottedMap.json', JSON.stringify({
  svg,
  viewBox,
  pinPercentages
}, null, 2));
