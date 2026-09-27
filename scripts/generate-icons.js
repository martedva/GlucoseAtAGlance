// Generate all icon SVGs with configurable arrow thickness
const fs = require('fs');
const path = require('path');

const colors = {
  green: { fill: '#4CAF50', stroke: '#388E3C' },
  yellow: { fill: '#FFEB3B', stroke: '#FBC02D' },
  orange: { fill: '#FF9800', stroke: '#F57C00' },
  red: { fill: '#F44336', stroke: '#D32F2F' }
};

const arrows = {
  'up': { rotation: 0, label: 'up' },
  'right-up': { rotation: 45, label: 'right-up' },
  'right': { rotation: 90, label: 'right' },
  'right-down': { rotation: 135, label: 'right-down' },
  'down': { rotation: 180, label: 'down' }
};

const ARROW_THICKNESS = 10; // Increase this for thicker arrows
const ARROW_LENGTH = 35;
const ARROW_HEAD_WIDTH = 24;

function generateArrowSVG(colorName, arrowName) {
  const color = colors[colorName];
  const arrow = arrows[arrowName];
  
  const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="64" cy="64" r="60" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>
  
  <!-- Arrow with rotation: ${arrow.rotation}° -->
  <g transform="translate(64, 64) rotate(${arrow.rotation})">
    <!-- Arrow shaft -->
    <line x1="0" y1="${ARROW_LENGTH - 10}" x2="0" y2="-${ARROW_LENGTH - 10}" stroke="white" stroke-width="${ARROW_THICKNESS}" stroke-linecap="round"/>
    <!-- Arrow head -->
    <polygon points="-${ARROW_HEAD_WIDTH/2},-${ARROW_LENGTH - 20} 0,-${ARROW_LENGTH} ${ARROW_HEAD_WIDTH/2},-${ARROW_LENGTH - 20}" fill="white"/>
  </g>
</svg>`;

  return svg;
}

// Generate all icons
const outputDir = path.join(__dirname, '..', 'assets', 'icons');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Object.keys(colors).forEach(colorName => {
  Object.keys(arrows).forEach(arrowName => {
    const svg = generateArrowSVG(colorName, arrowName);
    const filename = `${colorName}-${arrows[arrowName].label}.svg`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, svg);
    console.log(`Created: ${filename}`);
  });
});

console.log('\n✅ All icons generated with arrow thickness:', ARROW_THICKNESS);
console.log('📁 Output directory:', outputDir);