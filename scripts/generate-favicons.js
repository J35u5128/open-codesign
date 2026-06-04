const sharp = require('sharp');
const path = require('path');

const sizes = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

const inputFile = path.join(__dirname, '..', 'apps', 'desktop', 'resources', 'icon.png');
const outputDir = path.join(__dirname, '..', 'website', 'public');

async function generateFavicons() {
  for (const { size, name } of sizes) {
    const outputFile = path.join(outputDir, name);
    await sharp(inputFile)
      .resize(size, size)
      .toFile(outputFile);
    console.log(`Generated ${name}`);
  }
}

generateFavicons().catch(console.error);
