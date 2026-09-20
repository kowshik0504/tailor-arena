import os
import re

with open("frontend/src/routes/customer.orders.tsx", "r", encoding="utf-8") as f:
    code = f.read()

if "import api from" not in code:
    code = code.replace(
        'import { useState, useEffect } from "react";',
        'import { useState, useEffect } from "react";\nimport api from "@/lib/api";'
    )

newLogic = """
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/customer').then(res => {
      if (res.data) {
        setAllBookings(res.data.map((b: any) => ({
          id: b._id,
          tailor: b.tailor?.businessName || b.tailor?.user?.name || "Tailor",
          service: b.workType || "Stitching",
          garment: b.dressType || "Custom",
          bookedOn: new Date(b.createdAt).toLocaleDateString(),
          delivery: b.deliveryDate || "TBD",
          status: b.status === "handed_over" ? "Completed" : b.status === "New" ? "Pending Approval" : b.status,
        })));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);
"""

code = re.sub(r'  const \[allBookings, setAllBookings\] = useState<Booking\[\]>\(\(\) => \{[\s\S]*?\}, \[\]\);', newLogic.replace("\\", "\\\\"), code)

with open("frontend/src/routes/customer.orders.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("Done")
