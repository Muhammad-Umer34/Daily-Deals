import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ImageCarousel({ images = [], name = "Product" }) {
  const imageList = images.length > 0 ? images : ["/images/daily_deals.png"];
  const several = imageList.length > 1;

  return (
    <Carousel className="w-full max-w-md relative">
      <CarouselContent>
        {imageList.map((imgUrl, index) => (
          <CarouselItem key={index}>
            <div className="aspect-[3/4] overflow-hidden bg-parchment">
              <img src={imgUrl} alt={`${name} – image ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Arrows sit inside the image so they never hang off narrow screens. */}
      {several && (
        <>
          <CarouselPrevious className="left-3 bg-paper/90 text-ink hover:bg-paper shadow" />
          <CarouselNext className="right-3 bg-paper/90 text-ink hover:bg-paper shadow" />
        </>
      )}
    </Carousel>
  );
}
