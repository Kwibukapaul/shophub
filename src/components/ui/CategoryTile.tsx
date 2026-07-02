interface CategoryTileProps {
  name: string;
  image?: string | null;
  onClick?: () => void;
  subtitle?: string;
}

export default function CategoryTile({
  name,
  image,
  onClick,
  subtitle,
}: CategoryTileProps) {
  return (
    <button
      onClick={onClick}
      className="group relative h-40 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_-30px_rgba(15,23,42,0.45)]"
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-stone-200 via-stone-300 to-stone-500 dark:from-stone-700 dark:via-stone-800 dark:to-stone-900" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-900/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-start justify-end px-5 py-5 text-left">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        {subtitle && <p className="mt-1 text-sm text-white/85">{subtitle}</p>}
      </div>
    </button>
  );
}
