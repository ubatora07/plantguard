/* global __dirname, Buffer, fetch, process */
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.resolve(__dirname, '../assets/images/plantvillage');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

function safeKey(key) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

async function run() {
  console.log('Fetching PlantVillage classes list from GitHub...');
  const res = await fetch('https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/raw/color', {
    headers: { 'User-Agent': 'PlantGuard-Downloader' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch class folders: ${res.status} ${res.statusText}`);
  }

  const folders = await res.json();
  console.log(`Found ${folders.length} classes. Fetching 1 authentic image for each...`);

  const results = [];

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const className = folder.name;
    const safeName = safeKey(className) + '.jpg';
    const localFilePath = path.join(TARGET_DIR, safeName);

    console.log(`[${i + 1}/${folders.length}] Processing ${className}...`);

    try {
      // Get files in this class folder
      const folderRes = await fetch(`https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/raw/color/${encodeURIComponent(className)}`, {
        headers: { 'User-Agent': 'PlantGuard-Downloader' },
      });

      if (!folderRes.ok) {
        console.error(`  Failed to list folder ${className}: ${folderRes.status}`);
        continue;
      }

      const files = await folderRes.json();
      const imageFile = files.find(f => f.name.toLowerCase().endsWith('.jpg') || f.name.toLowerCase().endsWith('.jpeg'));

      if (!imageFile) {
        console.error(`  No image found for ${className}`);
        continue;
      }

      // Download image
      const imgRes = await fetch(imageFile.download_url);
      if (!imgRes.ok) {
        console.error(`  Failed to download image ${imageFile.name}: ${imgRes.status}`);
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(localFilePath, buffer);

      console.log(`  Saved ${safeName} (${buffer.length} bytes)`);

      results.push({
        classKey: className,
        safeName,
        fileName: imageFile.name,
        downloadUrl: imageFile.download_url,
        fileSize: buffer.length,
      });
    } catch (err) {
      console.error(`  Error downloading ${className}:`, err.message);
    }
  }

  console.log(`\nSuccessfully downloaded ${results.length} authentic PlantVillage images!`);

  // Write JSON metadata
  const metaPath = path.resolve(__dirname, '../src/data/plantvillage-image-manifest.json');
  fs.writeFileSync(metaPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved manifest to ${metaPath}`);
}

run().catch(console.error);
