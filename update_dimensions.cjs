const fs = require('fs');
const sizeOf = require('image-size');

const galleryFile = './src/data/gallery.json';
const data = JSON.parse(fs.readFileSync(galleryFile, 'utf8'));

async function getDimensions(url) {
  return new Promise((resolve, reject) => {
    import('node-fetch').then(({ default: fetch }) => {
      fetch(url)
        .then(res => res.buffer())
        .then(buffer => {
          try {
            const dimensions = sizeOf(buffer);
            resolve(dimensions);
          } catch (e) {
            reject(e);
          }
        })
        .catch(reject);
    }).catch(reject);
  });
}

async function run() {
  console.log(`Processing ${data.length} images...`);
  let updated = false;
  for (let i = 0; i < data.length; i++) {
    if (!data[i].aspectRatio) {
      try {
        const dims = await getDimensions(data[i].url);
        data[i].aspectRatio = dims.width / dims.height;
        updated = true;
      } catch (e) {
        console.error(`Failed for ${data[i].url}: ${e.message}`);
        data[i].aspectRatio = 1;
      }
    }
  }

  if (updated) {
    fs.writeFileSync(galleryFile, JSON.stringify(data, null, 2));
    console.log('Saved dimensions to gallery.json');
  } else {
    console.log('No updates needed');
  }
}

run();
