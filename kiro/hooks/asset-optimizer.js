/**
 * Kiro Hook: Auto-optimize images added to assets folder
 * Converts to WebP, generates thumbnails
 */

const sharp = require('sharp');
const path = require('path');

module.exports = {
  name: 'asset-optimizer',
  trigger: 'on-file-add',
  pattern: /assets\/.*\.(png|jpg|jpeg)$/,
  
  async execute(context) {
    const filePath = context.getFilePath();
    const fileName = path.basename(filePath, path.extname(filePath));
    const dir = path.dirname(filePath);
    
    // Convert to WebP
    await sharp(filePath)
      .webp({ quality: 85 })
      .toFile(`${dir}/${fileName}.webp`);
    
    // Generate thumbnail
    await sharp(filePath)
      .resize(150, 150, { fit: 'cover' })
      .toFile(`${dir}/${fileName}_thumb.webp`);
    
    console.log(`✓ Optimized ${fileName}`);
    
    // Update asset manifest
    await context.updateFile('src/app/utils/assetManifest.ts', (content) => {
      return content + `\nexport const ${fileName} = '${dir}/${fileName}.webp';`;
    });
  }
};