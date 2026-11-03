// Pre-renders the background formulas in index.html and 404.html with KaTeX, so the pages need no math JavaScript at runtime.
// Every element carrying a data-tex="..." attribute gets its contents replaced by the typeset formula.
// Usage (from the repository root):
//   npm install --no-save katex@0.16.11 && node tools/render-math.js
const fs = require('fs');
const path = require('path');
const katex = require('katex');

const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

for (const name of ['index.html', '404.html']) {
    const file = path.join(__dirname, '..', name);
    const html = fs.readFileSync(file, 'utf8');

    let count = 0;
    // Formula holders are <div>s; KaTeX output contains only <span>s, so the first </div> closes the holder
    const out = html.replace(/(<div\b[^>]*\sdata-tex="([^"]*)"[^>]*>)[\s\S]*?(<\/div>)/g, (m, open, tex, close) => {
        count++;
        const rendered = katex.renderToString('\\displaystyle ' +unescape(tex), { output: 'html', throwOnError: true });
        return open + rendered + close;
    });

    fs.writeFileSync(file, out);
    console.log(`${name}: rendered ${count} formulas with KaTeX ${katex.version}`);
}
