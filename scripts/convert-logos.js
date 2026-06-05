const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logosDir = 'C:\\Users\\fortizce\\Downloads\\logos';
const logo1Svg = path.join(logosDir, 'logo 1.svg');
const logoFondoSvg = path.join(logosDir, 'logo fondo.svg');

async function run() {
  // Position 1: App icon - needs multiple PNG sizes + .ico + .icns
  // Generate icon.png (512x512 source)
  await sharp(logo1Svg)
    .resize(512, 512)
    .png()
    .toFile('apps/desktop/resources/icon.png');
  console.log('Generated apps/desktop/resources/icon.png');

  await sharp(logo1Svg)
    .resize(512, 512)
    .png()
    .toFile('apps/desktop/resources/icon-512.png');
  console.log('Generated apps/desktop/resources/icon-512.png');

  await sharp(logo1Svg)
    .resize(256, 256)
    .png()
    .toFile('apps/desktop/resources/icon-256.png');
  console.log('Generated apps/desktop/resources/icon-256.png');

  await sharp(logo1Svg)
    .resize(512, 512)
    .png()
    .toFile('apps/desktop/resources/icon-source.png');
  console.log('Generated apps/desktop/resources/icon-source.png');

  // Position 2: UI logo (Wordmark in app)
  await sharp(logo1Svg)
    .resize(512, 512)
    .png()
    .toFile('packages/ui/src/assets/logo.png');
  console.log('Generated packages/ui/src/assets/logo.png');

  // Position 3: Website hero
  await sharp(logoFondoSvg)
    .resize(1200, 1200)
    .png()
    .toFile('website/public/logo-hero.png');
  console.log('Generated website/public/logo-hero.png');

  // Also update website logo.png and logo-mark.png with logo1
  await sharp(logo1Svg)
    .resize(512, 512)
    .png()
    .toFile('website/public/logo.png');
  console.log('Generated website/public/logo.png');

  await sharp(logo1Svg)
    .resize(512, 512)
    .png()
    .toFile('website/public/logo-mark.png');
  console.log('Generated website/public/logo-mark.png');

  // Website favicons
  await sharp(logo1Svg).resize(180, 180).png().toFile('website/public/apple-touch-icon.png');
  await sharp(logo1Svg).resize(32, 32).png().toFile('website/public/favicon-32x32.png');
  await sharp(logo1Svg).resize(16, 16).png().toFile('website/public/favicon-16x16.png');
  console.log('Generated website favicons');

  // og.png with logo fondo
  await sharp(logoFondoSvg)
    .resize(1200, 630)
    .png()
    .toFile('website/public/og.png');
  console.log('Generated website/public/og.png');

  console.log('\nAll logos converted successfully!');
  console.log('Next step: regenerate .ico and .icns using png2icons');
}

run().catch(console.error);
