const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'public', 'images', 'sources');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const downloads = [
  {
    url: 'https://cdn.nhandan.vn/images/lP2YXaAYzKCeXSgaAYl-0QIqk0agpFPfKfHwbvnTriRwdnLVjQ9gZA7DAkUTi9IqU3lRo00JSsaZSXbFt4nPJ2OomdwNWYqIKKRCZDN0QOg/picture1-8606-3854.jpg.webp',
    dest: 'nong_nghiep_cong_nghe_cao.webp'
  },
  {
    url: 'https://cdn.nhandan.vn/images/ucioGWhuJkThBNzVh1f0kKYHMkWZx3q39d0GPYYRGLm20-VjahZArqpQEBOq1MghcJF4rCp9iiR52vgY-QzPHucBUhbpjuLzHc2xDFs_PnSEe_vCwOmr8VwpD4Cx0cb3/z7116915885742-4d087fe2c0920639221733ee39335272.jpg.avif',
    dest: 'ton_vinh_nong_dan_tri_thuc.avif'
  },
  {
    url: 'https://www.nso.gov.vn/wp-content/uploads/2026/01/image001.jpg',
    dest: 'doanh_nghiep_gso_2025.jpg'
  }
];

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

(async () => {
  for (const item of downloads) {
    const target = path.join(outDir, item.dest);
    try {
      console.log('Downloading', item.url, '...');
      await download(item.url, target);
      const stat = fs.statSync(target);
      console.log('Successfully saved', item.dest, '(', stat.size, 'bytes )');
    } catch (e) {
      console.error('Error downloading', item.dest, e.message);
    }
  }
})();
