import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
}

export default function Carousel({ items }: { items: CarouselItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4500);

    return () => clearInterval(t);
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((it) => (
          <div key={it.id} className="min-w-full">
            <div className="relative h-56 md:h-72 lg:h-96">
              <img
                src={it.image}
                alt={it.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-6 bottom-6 rounded bg-black/50 px-4 py-2 text-white">
                <h3 className="text-lg font-bold">{it.title}</h3>
                {it.subtitle && <p className="text-sm">{it.subtitle}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute left-4 top-1/2 flex -translate-y-1/2 gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-8 rounded-full transition-all ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
        onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
        aria-label="Previous slide"
      >
        <ChevronLeft />
      </button>

      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
        onClick={() => setIndex((i) => (i + 1) % items.length)}
        aria-label="Next slide"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
