const fs = require('fs');
const readline = require('readline');

const path = 'C:\\Users\\admin\\.gemini\\antigravity-ide\\brain\\e434b73d-73cb-4cf4-9a70-d1e74ec522b8\\.system_generated\\logs\\transcript_full.jsonl';
const outPath = 'C:\\Users\\admin\\.gemini\\antigravity-ide\\brain\\e434b73d-73cb-4cf4-9a70-d1e74ec522b8\\scratch\\vnr_content.txt';

const fileStream = fs.createReadStream(path, { encoding: 'utf-8' });
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let found = false;

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.content.includes('VNR-T17') && data.content.includes('Sản xuất bung ra')) {
      fs.mkdirSync('C:\\Users\\admin\\.gemini\\antigravity-ide\\brain\\e434b73d-73cb-4cf4-9a70-d1e74ec522b8\\scratch', { recursive: true });
      fs.writeFileSync(outPath, data.content, 'utf-8');
      found = true;
    }
  } catch (e) {}
});

rl.on('close', () => {
    if (found) {
        console.log('Saved');
    } else {
        console.log('Not found');
    }
});
