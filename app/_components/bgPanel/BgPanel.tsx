import { SparklesCore } from "@/app/_ui/sparkles";
import GlassPanes from "./GlassPanes";

export default function BgPannel({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative">

            {/* Background Panel */}
            <div className="panel absolute inset-0 rounded-[20px] h-screen pt-10 -z-50">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1.3}
                    particleDensity={12}
                    speed={0.7}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
                {/* Glow Gradients */}
                <div className="absolute top-0 -translate-y-1/2 h-full w-2/3 rounded-full bg-glow-left/80 mix-blend-screen blur-[150px] filter" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[80%] h-2/3 w-2/3 rounded-full bg-glow-center/70 mix-blend-screen blur-[150px] filter" />
                <div className="absolute top-0 left-1/2 -translate-x-4/12 -translate-y-1/2 h-full w-2/3 rounded-full bg-glow-right/90 mix-blend-screen blur-[150px] filter" />
                {/* Cliped Nothch */}
                <svg className="clippy absolute w-0 h-0">
                    <defs>
                        <clipPath id='clip-frame' clipPathUnits="objectBoundingBox">
                            <path d="M0.233245 0C0.238426 1.56293e-07 0.243199 0.00398585 0.245715 0.0104121L0.278377 0.093839C0.280893 0.100265 0.285667 0.104251 0.290847 0.104251H0.713432C0.718613 0.104251 0.723386 0.100265 0.725902 0.093839L0.758565 0.0104121C0.761081 0.00398583 0.765854 1.33969e-07 0.771034 0H0.985735C0.993613 1.78018e-08 1 0.00906307 1 0.0202429V0.979757C1 0.990937 0.993613 1 0.985735 1H0.0142653C0.00638682 1 0 0.990937 0 0.979757V0.0202429C5.51468e-09 0.00906307 0.00638681 0 0.0142653 0H0.233245Z" fill="#000000" />
                        </clipPath>
                    </defs>
                </svg>
                <GlassPanes />
            </div>
            {/* Content Layer */}
            <div className="relative">
                {children}
            </div>
        </div>
    )
}