import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

const content = fs.readFileSync('src/views/UniversoView.vue', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
    if (line.includes('</script>')) console.log(`Script end at line ${idx + 1}`);
    if (line.includes('<style')) console.log(`Style start at line ${idx + 1}`);
    if (line.includes('onMounted')) console.log(`onMounted at line ${idx + 1}`);
});
