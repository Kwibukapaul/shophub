export default function OrderStatusBadge({ status }: { status: string }) {
  const classes =
    status === "delivered"
      ? "bg-green-100 text-green-800"
      : status === "processing"
        ? "bg-blue-100 text-blue-800"
        : status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${classes}`}
    >
      {status}
    </span>
  );
}
