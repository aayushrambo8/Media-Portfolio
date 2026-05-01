const fs = require('fs');
const path = './src/data/gallery.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

for (let i = data.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [data[i], data[j]] = [data[j], data[i]];
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Shuffled gallery.json successfully!');
