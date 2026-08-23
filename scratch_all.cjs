const fs = require('fs');
const path = 'C:\\Users\\admin\\.gemini\\antigravity-ide\\brain\\e434b73d-73cb-4cf4-9a70-d1e74ec522b8\\.system_generated\\logs\\transcript_full.jsonl';

const lines = fs.readFileSync(path, 'utf-8').split('\n');
let allInputs = [];
for (const line of lines) {
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.type === 'USER_INPUT') {
            allInputs.push(data.content);
        }
    } catch (e) {}
}
fs.writeFileSync('d:\\Ky9-FPT\\HCM202\\scratch_all_inputs.txt', allInputs.join('\n\n---===---\n\n'), 'utf-8');
