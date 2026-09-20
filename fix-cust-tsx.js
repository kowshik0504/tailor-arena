const fs = require('fs');
let code = fs.readFileSync('frontend/src/routes/customer.order.$id.tsx', 'utf8');

code = code.replace(
  'CreditCard, FileText, Image, Tag, ArrowLeft, Loader2',
  'CreditCard, FileText, Image, Tag, ArrowLeft, Loader2, Printer, Check'
);

code = code.replace(
  '(booking.paymentStatus || "pending").replace(/\\b\\w/g, (c) => c.toUpperCase())',
  '(booking.paymentStatus || "pending").replace(/\\b\\w/g, (c: string) => c.toUpperCase())'
);

code = code.replace(
  '(booking.paymentStatus || "pending").replace(/ \\w/g, (c) => c.toUpperCase())',
  '(booking.paymentStatus || "pending").replace(/\\b\\w/g, (c: string) => c.toUpperCase())'
);

fs.writeFileSync('frontend/src/routes/customer.order.$id.tsx', code);
