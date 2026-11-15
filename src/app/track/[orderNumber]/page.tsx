import OrderTrackClient from "@/components/OrderTrackClient";

export function generateStaticParams() {
  return [
    { orderNumber: "ZAN-20261115-001" },
    { orderNumber: "ZAN-20261115-002" },
    { orderNumber: "demo" },
  ];
}

export default function Page({ params }: { params: { orderNumber: string } }) {
  return <OrderTrackClient orderNumber={params.orderNumber} />;
}
