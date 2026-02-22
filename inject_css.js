const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'header.html');

let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Inject header.css link if it's not already there
    if (!content.includes('header.css')) {
        // Insert after <link rel="stylesheet" ... styles.css ...>  OR just before </head>
        const headLink = '<link rel="stylesheet" href="header.css">';
        if (content.includes('styles.css"')) {
            content = content.replace(
                /(<link[^>]+styles\.css[^>]*>)/,
                `$1\n    ${headLink}`
            );
        } else {
            content = content.replace('</head>', `    ${headLink}\n</head>`);
        }
    }

    // Make sure load_header.js is there
    if (!content.includes('load_header.js')) {
        content = content.replace('</body>', '    <script src="load_header.js"></script>\n</body>');
    }

    fs.writeFileSync(file, content, 'utf8');
    updated++;
});

console.log(`Updated ${updated} files with header.css + load_header.js links.`);
