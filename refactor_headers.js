const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'header.html');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the HTML header block entirely
    content = content.replace(/<!-- Header -->[\s\S]*?<header[^>]*>[\s\S]*?<\/header>/gi, '');

    // Fallback if the comment wasn't there
    content = content.replace(/<header class="header[^>]*>[\s\S]*?<\/header>/gi, '');

    // Remove the JS for mobile menu and header scrolling
    // We match from "// Mobile Menu Toggle" up to the next logical block like "// Animations", "// Hero", or "</script>"
    content = content.replace(/\s*\/\/ Mobile Menu Toggle[\s\S]*?(?=\/\/ [A-Z]|<\/script>)/g, '\n        ');
    content = content.replace(/\s*\/\/ Header Scroll Effect[\s\S]*?(?=\/\/ [A-Z]|<\/script>)/g, '\n        ');

    // Same for "Header Scroll Effect" if it wasn't caught
    content = content.replace(/\/\/ Header Scroll Effect[\s\S]*?\}\);/gs, '');

    // Add the loading script before the closing body tag
    if (!content.includes('<script src="load_header.js">')) {
        content = content.replace(/<\/body>/, '    <script src="load_header.js"></script>\n</body>');
    }

    fs.writeFileSync(file, content, 'utf8');
});

console.log(`Successfully refactored ${files.length} HTML files!`);
