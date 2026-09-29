// Generate icon PNGs from SVG source with configurable arrow thickness
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const colors = {
  green: { fill: '#4CAF50', stroke: '#388E3C', arrowColor: 'black' },
  yellow: { fill: '#FFEB3B', stroke: '#FBC02D', arrowColor: 'black' },
  orange: { fill: '#FF9800', stroke: '#F57C00', arrowColor: 'white' },
  red: { fill: '#F44336', stroke: '#D32F2F', arrowColor: 'white' }
};

const arrows = {
  'up': { rotation: 0, label: 'up' },
  'right-up': { rotation: 45, label: 'right-up' },
  'right': { rotation: 90, label: 'right' },
  'right-down': { rotation: 135, label: 'right-down' },
  'down': { rotation: 180, label: 'down' }
};

const ARROW_THICKNESS = 15; // Increase this for thicker arrows
const ARROW_LENGTH = 35;
const ARROW_HEAD_WIDTH = 50;

// Chrome extension icon sizes
const ICON_SIZES = [16, 48, 128];

function generateArrowSVG(colorName, arrowName) {
  const color = colors[colorName];
  const arrow = arrows[arrowName];
  
  const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="60" fill="${color.fill}" stroke="${color.stroke}" stroke-width="3"/>
  <g transform="translate(64, 64) rotate(${arrow.rotation})">
    <line x1="0" y1="${ARROW_LENGTH - 10}" x2="0" y2="-${ARROW_LENGTH - 10}" stroke="${color.arrowColor}" stroke-width="${ARROW_THICKNESS}" stroke-linecap="round"/>
    <polygon points="-${ARROW_HEAD_WIDTH/2},-${ARROW_LENGTH - 20} 0,-${ARROW_LENGTH} ${ARROW_HEAD_WIDTH/2},-${ARROW_LENGTH - 20}" fill="${color.arrowColor}"/>
  </g>
</svg>`;

  return Buffer.from(svg);
}

async function generateIcons() {
  const svgOutputDir = path.join(__dirname, '..', 'assets', 'icons-svg');
  const pngOutputDir = path.join(__dirname, '..', 'assets', 'icons');
  
  // Create directories if they don't exist
  [svgOutputDir, pngOutputDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Clean existing icon files
  console.log('Cleaning existing icon files...');
  [pngOutputDir, svgOutputDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.png') || file.endsWith('.svg')) {
          fs.unlinkSync(path.join(dir, file));
        }
      });
    }
  });
  
  console.log('Generating icons with arrow thickness:', ARROW_THICKNESS);
  
  for (const colorName of Object.keys(colors)) {
    for (const arrowName of Object.keys(arrows)) {
      const svgBuffer = generateArrowSVG(colorName, arrowName);
      const filename = `${colorName}-${arrows[arrowName].label}`;
      
      try {
        // Save SVG source file (for easy editing)
        const svgPath = path.join(svgOutputDir, `${filename}.svg`);
        fs.writeFileSync(svgPath, svgBuffer);
        
        // Generate PNG files for Chrome extension (only required sizes)
        for (const size of ICON_SIZES) {
          const pngBuffer = await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toBuffer();
          
          const pngPath = path.join(pngOutputDir, `${filename}-${size}.png`);
          fs.writeFileSync(pngPath, pngBuffer);
        }
        
        console.log(`✓ ${filename}`);
      } catch (error) {
        console.error(`✗ Error creating ${filename}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ Generated 20 icons × 3 sizes = 60 PNG files');
  console.log('📁 SVG source:', svgOutputDir);
  console.log('📁 PNG output:', pngOutputDir);
  console.log('\n💡 To change arrow thickness, edit ARROW_THICKNESS in scripts/generate-icons.js');
}

generateIcons();