import { BentoGrid, BentoGridItem } from "@/app/_ui/bento-grid";
import BlurBackdrop from "@/app/_ui/BlurBackdrop";
import React from "react";
import GlobalStatsChart from "@/app/_ui/GlobalStatsChart";
import { CHART_DATA } from "@/app/_constants/ChartData";
import { div } from "motion/react-client";
import { EvervaultCard } from "@/app/_ui/evervault-card";


const ZKCard = () => (
  <div>
    <EvervaultCard text="Zk"/>
  </div>
);

const items = [
  {
    title: "Total Shielded (SOL)",
    description: CHART_DATA.totalValueInPools,
    header: (
      <div className="p-2 w-full h-full">
        <GlobalStatsChart metric="value" colorVar="var(--foreground)" />
      </div>
    ),
    className: "md:col-span-2",
  },
  {
    title: "Zero Knowledge Tech",
    description: "Even we don't know who holds what.",
    header: <ZKCard />,
    className: "md:col-span-1",
  },
  {
    title: "$GONE",
    description: "Discover the privacy on solana.",
    header: <ZKCard />,
    className: "md:col-span-1",
  },
  {
    title: "Total Pool Transactions",
    description: CHART_DATA.totalTransactions,
    header: (
      <div className="p-2 w-full h-full">
        <GlobalStatsChart metric="transactions" colorVar="var(--foreground) " />
      </div>
    ),
    className: "md:col-span-2",
  },
];

export default function InfoSection() {
  return (
    <div className="relative w-full h-fit">
      <div className="w-full absolute -top-[7.5%] sm:-top[7%] md:-top-[7.5%] lg:-top-[8.5%] xl:-top-[9%] inset-0 justify-items-center items-center text-center 
            text-[5rem] sm:text-[7rem] md:text-9xl lg:text-[9rem] xl:text-[10rem] font-bold text-white">
        $GONE
      </div>
      <BlurBackdrop className="w-full h-full pt-32">
        <BentoGrids />
      </BlurBackdrop>
    </div>
  )
}




export function BentoGrids() {
  return (
    <BentoGrid className="mx-auto md:auto-rows-[20rem]">
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
  );
}
