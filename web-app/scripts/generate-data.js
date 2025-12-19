import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_DIR = path.resolve(__dirname, '../../repo/leetcode-company-wise-problems');
const OUTPUT_FILE = path.resolve(__dirname, '../public/data.json');

function parseCSVLine(text) {
    const result = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
             if (inQuotes && text[i+1] === '"') {
                 cell += '"';
                 i++;
             } else {
                 inQuotes = !inQuotes;
             }
        } else if (char === ',' && !inQuotes) {
            result.push(cell.trim());
            cell = '';
        } else {
            cell += char;
        }
    }
    result.push(cell.trim());
    return result;
}

function generateData() {
    if (!fs.existsSync(REPO_DIR)) {
        console.error('Repo directory not found:', REPO_DIR);
        process.exit(1);
    }

    const companies = fs.readdirSync(REPO_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const questionsMap = new Map();

    console.log(`Found ${companies.length} companies. Processing...`);

    companies.forEach(company => {
        const companyDir = path.join(REPO_DIR, company);
        const files = fs.readdirSync(companyDir);
        const allCsvFile = files.find(f => f.toLowerCase().endsWith('all.csv'));

        if (!allCsvFile) return;

        const content = fs.readFileSync(path.join(companyDir, allCsvFile), 'utf-8');
        const lines = content.split('\n');
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const cols = parseCSVLine(line);
            if (cols.length < 5) continue; 

            const difficulty = cols[0];
            const title = cols[1];
            const frequency = cols[2];
            const acceptanceRate = cols[3];
            const link = cols[4];
            const topicsRaw = cols[5] || '';
            
            if (!questionsMap.has(title)) {
                questionsMap.set(title, {
                    title,
                    difficulty,
                    acceptanceRate: parseFloat(acceptanceRate) || 0,
                    link,
                    topics: topicsRaw ? topicsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
                    companies: []
                });
            }
            
            const q = questionsMap.get(title);
            
            if (!q.companies.find(c => c.name === company)) {
                q.companies.push({
                    name: company,
                    frequency: parseFloat(frequency) || 0
                });
            }
        }
    });

    const questions = Array.from(questionsMap.values());
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questions, null, 2));
    console.log(`Generated data for ${questions.length} unique questions.`);
}

generateData();

