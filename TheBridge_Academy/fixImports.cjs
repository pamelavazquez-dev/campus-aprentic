const fs = require('fs');
const path = require('path');

const walk = dir => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./src').filter(f => f.endsWith('.jsx'));

let fixed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('toast.') && !content.includes('import toast from')) {
    content = "import toast from 'react-hot-toast';\n" + content;
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed ' + f);
    fixed++;
  }
});

console.log('Total fixed: ' + fixed);
