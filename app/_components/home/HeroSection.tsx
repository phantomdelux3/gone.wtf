'use client';

import BlurBackdrop from "@/app/_ui/BlurBackdrop";
import Button from "@/app/_ui/Button";

export default function HeroSection() {
    const handleLaunchApp = () => {
        window.open('https://gone.wtf/mixer', '_blank');
    };
    return (
        <div className="flex justify-center items-center w-full min-h-screen">
            <div className="text-center space-y-8">
                <div>
                    <div className="flex justify-center mb-1">
                        <BlurBackdrop className="space-x-3 items-center justify-center text-[10px] md:text-sm lg:text-base">
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-off h-3 w-3 text-muted-foreground"><path d="m2 2 20 20"></path><path d="M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71"></path><path d="M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264"></path></svg>
                                Non-Custodial
                            </span>
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ghost h-3 w-3 text-muted-foreground"><path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path></svg>
                                Untraceable
                            </span>
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-3 w-3 text-muted-foreground"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                Fast
                            </span>
                        </BlurBackdrop>
                    </div>
                    <h1 className="text-5xl mb-2 font-bold md:font-semibold sm:text-7xl md:text-8xl lg:text-9xl
                     bg-gradient-to-r from-white to-dark-violet bg-clip-text text-transparent"
                    >
                        Solana Mixer
                    </h1>
                    <h2 className="text-white/60 text-sm md:text-base mx-auto mb-8 max-w-xl px-10 md:px-0">Regain your privacy on Solana by using our simple and secure protocol.</h2>
                </div>
                <div className="flex justify-center">
                    <BlurBackdrop className="rounded-2xl p-0">
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