const fs = require('fs');
let code = fs.readFileSync('frontend/src/routes/customer.orders.tsx', 'utf8');

if (!code.includes("import api from")) {
  code = code.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect } from "react";\nimport api from "@/lib/api";'
  );
}

const newLogic = 
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/customer').then(res => {
      if (res.data) {
        setAllBookings(res.data.map((b: any) => ({
          id: b._id,
          tailor: b.tailor?.businessName || "Tailor",
          service: b.workType || "Stitching",
          garment: b.dressType || "Custom",
          bookedOn: new Date(b.createdAt).toLocaleDateString(),
          delivery: b.deliveryDate || "TBD",
          status: b.status === "handed_over" ? "Completed" : b.status === "New" ? "Pending Approval" : b.status,
        })));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);
;

code = code.replace(/const \[allBookings, setAllBookings\] = useState<Booking\[\]>\(\(\) => \{[\s\S]*?\}, \[\]\);/m, newLogic);
fs.writeFileSync('frontend/src/routes/customer.orders.tsx', code);
