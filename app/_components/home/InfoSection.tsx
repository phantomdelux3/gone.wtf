import { BentoGrid, BentoGridItem } from "@/app/_ui/bento-grid";
import BlurBackdrop from "@/app/_ui/BlurBackdrop";
import React from "react";
import GlobalStatsChart from "@/app/_ui/GlobalStatsChart";


const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
);
const items = [
  {
    title: "Protocol Value Over Time",
    description: "Daily value from global stats history",
    header: (
      <div className="p-2 w-full h-full">
        <GlobalStatsChart metric="value" colorVar="var(--foreground)" />
      </div>
    ),
    className: "md:col-span-2",
  },
  {
    title: "The Digital Revolution",
    description: "Dive into the transformative power of technology.",
    header: <Skeleton />,
    className: "md:col-span-1",
  },
  {
    title: "The Art of Design",
    description: "Discover the beauty of thoughtful and functional design.",
    header: <Skeleton />,
    className: "md:col-span-1",
  },
  {
    title: "Transactions Over Time",
    description: "Daily transactions from global stats history",
    header: (
      <div className="p-2 w-full h-full">
        <GlobalStatsChart metric="transactions" colorVar="var(--foreground)" />
      </div>
    ),
    className: "md:col-span-2",
  },
];

export default function InfoSection() {
    return (
        <div className="relative w-full h-dvh">
            <div className="w-full absolute -top-[7.5%] sm:-top[7%] md:-top-[7.5%] lg:-top-[8.5%] xl:-top-[9%] inset-0 justify-items-center items-center text-center 
            text-[5rem] sm:text-[7rem] md:text-9xl lg:text-[9rem] xl:text-[10rem] font-bold text-white">
                $GONE
            </div>
            <BlurBackdrop className="w-full h-full">
                <BentoGrids/>
            </BlurBackdrop>
        </div>
    )
}



 
export function BentoGrids() {
  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
        />
      ))}
    </BentoGrid>
  );}
