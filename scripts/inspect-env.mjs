import fs from 'fs'
const content = fs.readFileSync('.env.local', 'utf8')
content.split('\n').forEach((line, i) => {
    console.log(`Line ${i + 1}: [${line}] (Length: ${line.length})`)
    for (let j = 0; j < line.length; j++) {
        const charCode = line.charCodeAt(j)
        if (charCode < 32 || charCode > 126) {
            console.log(`  Char at ${j}: code ${charCode}`)
        }
    }
})
