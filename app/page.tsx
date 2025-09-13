import HeroSection from "./_components/home/HeroSection";

export default function Home() {
  return (
    <div className="relative font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <HeroSection></HeroSection>

      {/* Glass Panes */}
      <div className="absolute inset-0 flex justify-center">
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="mx-[8%]bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="mx-[8%]bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="mx-[8%]bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="mx-[8%]bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[5%] h-screen hidden md:block" />
        {/* <span className="mx-[8%]bg-gradient-to-b from-white/5 to-white/0 w-[10%] h-screen md:hidden" />
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[10%] h-screen md:hidden" />
        <span className="mx-[8%]bg-gradient-to-b from-white/5 to-white/0 w-[10%] h-screen md:hidden" />
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[10%] h-screen md:hidden" />
        <span className="mx-[8%]bg-gradient-to-b from-white/5 to-white/0 w-[10%] h-screen md:hidden" />
        <span className="bg-gradient-to-b from-white/5 to-white/0 w-[10%] h-screen md:hidden" /> */}
      </div>
    </div>
  );
}
