import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const searchDir = '../src';
const searchTerm = 'Conectado al Cerebro IA';

walkDir(searchDir, filePath => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(searchTerm)) {
            console.log(`Found "${searchTerm}" in: ${filePath}`);
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                if (line.includes(searchTerm)) {
                    console.log(`  Line ${idx + 1}: ${line.trim()}`);
                }
            });
        }
    }
});
