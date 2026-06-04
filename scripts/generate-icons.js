#!/usr/bin/env node

/**
 * Generate icon files in various formats and sizes from a source PNG
 * Usage: node scripts/generate-icons.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');
const { promisify } = require('node:util');

const execAsync = promisify(exec);

const SOURCE_ICON = path.join(__dirname, '../apps/desktop/resources/icon-source.png');
const DESKTOP_RESOURCES = path.join(__dirname, '../apps/desktop/resources');
const WEBSITE_PUBLIC = path.join(__dirname, '../website/public');

// Icon sizes needed
const ICON_SIZES = {
  desktop: [
    { size: 1024, name: 'icon.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 256, name: 'icon-256.png' },
  ],
  website: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 512, name: 'logo.png' },
    { size: 512, name: 'logo-mark.png' },
    { size: 1024, name: 'logo-hero.png' },
    { size: 1200, name: 'og.png' },
  ],
};

async function checkSharp() {
  try {
    require('sharp');
    return true;
  } catch {
    return false;
  }
}

async function installSharp() {
  console.log('Installing sharp for image processing...');
  await execAsync('pnpm add -D sharp', { cwd: path.join(__dirname, '..') });
}

async function generateWithSharp() {
  const sharp = require('sharp');
  
  console.log('Reading source icon...');
  const sourceBuffer = fs.readFileSync(SOURCE_ICON);
  
  // Generate desktop icons
  console.log('\nGenerating desktop app icons...');
  for (const { size, name } of ICON_SIZES.desktop) {
    const outputPath = path.join(DESKTOP_RESOURCES, name);
    await sharp(sourceBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Created ${name} (${size}x${size})`);
  }
  
  // Generate website icons
  console.log('\nGenerating website icons...');
  for (const { size, name } of ICON_SIZES.website) {
    const outputPath = path.join(WEBSITE_PUBLIC, name);
    await sharp(sourceBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Created ${name} (${size}x${size})`);
  }
  
  console.log('\n✅ PNG icons generated successfully!');
  console.log('\n⚠️  Note: .ico and .icns formats need special tools:');
  console.log('  - For .ico: Use online converter or png2icons tool');
  console.log('  - For .icns: Use iconutil on macOS or online converter');
  console.log(`\nSource file for manual conversion: ${path.join(DESKTOP_RESOURCES, 'icon.png')}`);
}

async function main() {
  try {
    if (!fs.existsSync(SOURCE_ICON)) {
      console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
      console.error('Please copy your icon to apps/desktop/resources/icon-source.png');
      process.exit(1);
    }
    
    const hasSharp = await checkSharp();
    if (!hasSharp) {
      await installSharp();
    }
    
    await generateWithSharp();
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

main();
