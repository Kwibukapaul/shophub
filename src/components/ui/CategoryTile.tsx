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
      className="relative h-36 overflow-hidden rounded-lg shadow transition hover:shadow-lg"
    >
      {image ? (
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-700 dark:to-gray-800" />
      )}

      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        {subtitle && <p className="mt-1 text-sm text-white/90">{subtitle}</p>}
      </div>
    </button>
  );
}
