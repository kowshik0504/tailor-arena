import os
import re

with open("frontend/src/routes/customer.order.$id.tsx", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(
    '{(booking.paymentStatus || "pending").replace(/ \w/g, (c) => c.toUpperCase())}',
    '{(booking.paymentStatus || "pending").replace(/\\b\\w/g, (c: string) => c.toUpperCase())}'
)

code = code.replace(
    '{(booking.paymentStatus || "pending").replace(/\b\w/g, (c) => c.toUpperCase())}',
    '{(booking.paymentStatus || "pending").replace(/\\b\\w/g, (c: string) => c.toUpperCase())}'
)

with open("frontend/src/routes/customer.order.$id.tsx", "w", encoding="utf-8") as f:
    f.write(code)
