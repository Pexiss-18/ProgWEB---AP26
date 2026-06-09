type Status = "PENDENTE" | "CONFIRMADO" | "CANCELADO";

const config: Record<Status, { label: string; classes: string }> = {
  PENDENTE: {
    label: "PENDENTE",
    classes: "border border-yellow-700/60 text-yellow-500 bg-yellow-900/10",
  },
  CONFIRMADO: {
    label: "CONFIRMADO",
    classes: "border border-green-700/60 text-green-400 bg-green-900/10",
  },
  CANCELADO: {
    label: "CANCELADO",
    classes: "border border-red-900/60 text-red-500 bg-red-900/10",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = (status as Status) in config ? (status as Status) : "PENDENTE";
  const { label, classes } = config[s];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${classes}`}
    >
      {label}
    </span>
  );
}
