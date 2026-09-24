const fs = require('fs');

// Read files as buffers and compare header/dimensions
function getPngDimensions(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const userBuf = fs.readFileSync('C:\\Users\\admin\\OneDrive\\Hình ảnh\\Ảnh chụp màn hình\\Screenshot 2026-09-24 151614.png');
const allianceBuf = fs.readFileSync('.playwright-cli/crop-alliance.png');
const manuscriptsBuf = fs.readFileSync('.playwright-cli/crop-manuscripts.png');

console.log('User:', getPngDimensions(userBuf));
console.log('Alliance:', getPngDimensions(allianceBuf));
console.log('Manuscripts:', getPngDimensions(manuscriptsBuf));
