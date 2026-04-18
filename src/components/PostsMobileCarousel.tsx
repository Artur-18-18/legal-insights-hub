import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/** Поля поста для карточки + опциональный _id с API */
export type PostsCarouselItem = Parameters<typeof PostCard>[0]["post"] & {
  _id?: string;
};

export function PostsMobileCarousel({
  posts,
  ariaLabel,
  className,
}: {
  posts: PostsCarouselItem[];
  ariaLabel: string;
  className?: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSnapCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  if (posts.length === 0) return null;

  return (
    <div className={cn("md:hidden w-full", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: posts.length > 1,
          containScroll: "trimSnaps",
          dragFree: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {posts.map((post) => {
            const ext = post as PostsCarouselItem;
            const key = ext._id ?? ext.id ?? post.slug;
            return (
              <CarouselItem key={key} className="pl-3 basis-full min-w-0">
                <PostCard post={post} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      {snapCount > 1 && (
        <div
          className="flex justify-center items-center gap-1.5 mt-4"
          role="tablist"
          aria-label={ariaLabel}
        >
          {Array.from({ length: snapCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={current === i}
              className={cn(
                "h-2 rounded-full transition-all duration-300 touch-manipulation",
                current === i ? "w-6 bg-gold" : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/50",
              )}
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
