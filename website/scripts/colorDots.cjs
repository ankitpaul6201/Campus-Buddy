const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/indiaDottedMap.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Target point: SVIET Chandigarh (x: 17.5, y: 12.12435565298214)
const targetX = 17.5;
const targetY = 12.12435565298214;

let updatedSvg = data.svg.replace(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)" fill="[^"]+" \/>/g, (match, cxStr, cyStr, rStr) => {
  const cx = parseFloat(cxStr);
  const cy = parseFloat(cyStr);
  const dist = Math.hypot(cx - targetX, cy - targetY);

  if (dist < 0.2) {
    // Exact center dot
    return `<circle cx="${cxStr}" cy="${cyStr}" r="0.34" fill="#FF7A29" />`;
  } else if (dist < 1.1) {
    // Immediate ring (hexagonal cluster)
    return `<circle cx="${cxStr}" cy="${cyStr}" r="0.32" fill="#FFA56A" />`;
  } else if (dist < 2.0) {
    // Outer ring
    return `<circle cx="${cxStr}" cy="${cyStr}" r="0.30" fill="#FFC49F" />`;
  } else if (dist < 3.0) {
    // Faint halo
    return `<circle cx="${cxStr}" cy="${cyStr}" r="${rStr}" fill="#FFE0CC" />`;
  }
  return match;
});

data.svg = updatedSvg;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Successfully updated SVG with orange dot shades around SVIET Chandigarh!');
