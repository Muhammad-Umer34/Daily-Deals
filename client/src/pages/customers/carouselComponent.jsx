import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ImageCarousel({ images = [] }) {
  const imageList = images.length > 0 ? images : ["/images/placeholder.png"];

  return (
    <Carousel className="w-full max-w-md relative">
      <CarouselContent>
        {imageList.map((imgUrl, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-0 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="bg-black text-white hover:bg-gray-900" />
      <CarouselNext className="bg-black text-white hover:bg-gray-900" />
    </Carousel>
  );
}
