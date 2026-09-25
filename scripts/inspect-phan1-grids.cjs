const fs = require('fs');
const html = fs.readFileSync('scripts/vnr_phan1.html', 'utf8');
const regex = /<div[^>]*style="[^"]*grid[^"]*"[^>]*>[\s\S]*?<\/div>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  if (m[0].includes('<img')) {
    console.log('--- GRID WITH IMG ---');
    console.log(m[0].slice(0, 600));
  }
}
