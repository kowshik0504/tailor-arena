const fs = require('fs');
let content = fs.readFileSync('frontend/src/routes/wallet.tsx', 'utf8');
content = content.replace(
  "const recentActivities = [...withdrawals.map(w => ({ ...w, type: 'withdrawal' })), ...payments.filter(p => p.type === 'cash_handover' || (p.type === 'online_payment' && p.status === 'pending'))]",
  "const recentActivities = [...withdrawals.map(w => ({ ...w, type: 'withdrawal' })), ...payments.filter(p => p.type === 'cash_handover' || p.type === 'online_payment')]"
);
fs.writeFileSync('frontend/src/routes/wallet.tsx', content);
