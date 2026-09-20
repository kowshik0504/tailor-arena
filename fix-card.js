const fs = require('fs');
let code = fs.readFileSync('frontend/src/routes/customer.order.$id.tsx', 'utf8');
code = code.replace(
  '{/* Design image */}',
  '</Card>\n\n        {/* Design image */}'
);
fs.writeFileSync('frontend/src/routes/customer.order.$id.tsx', code);
