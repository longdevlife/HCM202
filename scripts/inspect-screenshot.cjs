const fs = require('fs');
const path = require('path');

const imgPath = 'C:\\Users\\admin\\OneDrive\\Hình ảnh\\Ảnh chụp màn hình\\Screenshot 2026-09-24 151614.png';
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log('Exists, size:', stat.size);
  // Read first few chunks or header
  const buf = fs.readFileSync(imgPath);
  console.log('PNG width/height:', buf.readUInt32BE(16), 'x', buf.readUInt32BE(20));
} else {
  console.log('File not found at:', imgPath);
}
