'use client';
import Link from "next/link";
import Navigation , { NavItem } from "../_constants/Navigation";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

export default function Header() {
    return (
        <div className="absolute top-0 left-0 md:mt-5 p-8 md:p-[1.7vw] md:px-[8.5vw] w-full flex justify-between items-center z-10">
            {/* LOGO */}
            <div className="text-base md:text-2xl font-bold text-white">
                GONE.WTF
            </div>
            
            {/* Navigation Menu */}
            <ul className="hidden space-x-[4.5vw] -translate-x-[2vw] lg:flex">
                {Navigation.map((item:NavItem, index:number) => (
                    <li key={index}>
                        <Link 
                            href={item.href}
                            className="text-white/50 hover:text-white transition-colors duration-200"
                            target={item.href.startsWith('http') ? '_blank' : '_self'}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : ''}
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Wallet Connect Button */}
            <div className="flex gap-2 z-10">
                <WalletMultiButtonDynamic></WalletMultiButtonDynamic>
            </div>
        </div>
    )
}