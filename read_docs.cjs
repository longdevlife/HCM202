const mammoth = require('mammoth');
const fs = require('fs');

async function readDocs() {
  const file1 = 'd:\\Ky9-FPT\\HCM202\\docs\\Thiết kế Dự án VNR-T17_ “Sản xuất bung ra” (1979–1981) - Slide, Website & Game Mô phỏng (1).docx';
  const file2 = 'd:\\Ky9-FPT\\HCM202\\docs\\Thiết kế Dự án VNR-T17_ “Sản xuất bung ra” (1979–1981) - Slide, Website & Game Mô phỏng.docx';

  try {
    const res1 = await mammoth.extractRawText({ path: file1 });
    fs.writeFileSync('d:\\Ky9-FPT\\HCM202\\scratch_doc1.txt', res1.value, 'utf8');
    console.log('Doc 1 extracted.');
  } catch (e) {
    console.error('Error Doc 1:', e);
  }

  try {
    const res2 = await mammoth.extractRawText({ path: file2 });
    fs.writeFileSync('d:\\Ky9-FPT\\HCM202\\scratch_doc2.txt', res2.value, 'utf8');
    console.log('Doc 2 extracted.');
  } catch (e) {
    console.error('Error Doc 2:', e);
  }
}

readDocs();
