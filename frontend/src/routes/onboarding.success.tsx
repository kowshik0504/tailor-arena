import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ReceiptAnimation } from "@/components/ReceiptAnimation";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/onboarding/success")({ component: Success });

function Success() {
  const [data, setData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Try to get the tailor profile details for the receipt
    api.get("/tailors/profile")
      .then(res => {
        const p = res.data;
        setData({
          name: p?.user?.name || user?.name || "Tailor Arena Member",
          shopName: p?.shopName || "My Atelier",
          address: p?.address ? `${p.address.street || ""}, ${p.address.city || ""}` : "Not provided",
          gstin: p?.gstin || "Not provided",
          phone: p?.user?.phone || user?.phone || "Not provided",
          email: p?.user?.email || user?.email || "Not provided",
          amount: p?.registrationFee || 1499,
          txId: "TX-" + Math.floor(Math.random() * 10000000)
        });
      })
      .catch(err => {
         console.error(err);
         setData({
            name: user?.name || "New Tailor",
            shopName: "Atelier",
            address: "Pending",
            gstin: "Pending",
            phone: user?.phone || "",
            email: user?.email || "",
            amount: 1499,
            txId: "TX-" + Math.floor(Math.random() * 10000000)
         });
      });
  }, [user]);

  if (!data) return <div className="h-screen flex items-center justify-center bg-[#f4f3ff]">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-[#f4f3ff]">
      <ReceiptAnimation data={data} />
    </div>
  );
}

