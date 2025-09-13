'use client';

import BlurBackdrop from "@/app/_ui/BlurBackdrop";
import Button from "@/app/_ui/Button";

export default function HeroSection() {
    const handleLaunchApp = () => {
        window.open('https://gone.wtf/mixer', '_blank');
    };
    return (
        <div className="absolute inset-0 w-full h-dvh flex justify-center items-center">
            <div className="text-center space-y-8">
                <div>
                    <h1 className="text-5xl mb-2 font-bold md:font-semibold md:text-8xl lg:text-9xl
                     bg-gradient-to-r from-white to-dark-violet/80 bg-clip-text text-transparent"
                    >
                        Solana Mixer
                    </h1>
                    <h2 className="text-white/60 text-sm md:text-base mx-auto mb-8 max-w-xl px-10 md:px-0">Regain your privacy on Solana by using our simple and secure protocol.</h2>
                </div>
                <div className="flex justify-center">
                    <BlurBackdrop className="rounded-2xl p-0" fixed={false}>
                        <Button
                            variant="outline"
                            size="md"
                            className="rounded-2xl cursor-pointer"
                            onClick={handleLaunchApp}
                        >
                            <span className="bg-gradient-to-r from-dark-text-from to-dark-text-to bg-clip-text text-transparent">
                                Launch App
                            </span>
                        </Button>
                    </BlurBackdrop>
                </div>
            </div>


        </div>
    )
}