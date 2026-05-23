const fs = require('fs');
let f = 'src/components/dashboard/AdminDashboard.tsx';
let c = fs.readFileSync(f, 'utf8');
let b = Buffer.from(c, 'latin1');
fs.writeFileSync(f, b.toString('utf8'), 'utf8');
console.log('Fixed encoding for AdminDashboard.tsx');
