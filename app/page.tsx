'use client'
import BuySection from "./_components/home/BuySection";
import HeroSection from "./_components/home/HeroSection";
import { AdminControls } from './_components/web3/AdminControls';
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from '@/lib/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { salePda } from '@/lib/findPda';
import InfoSection from "./_components/home/InfoSection";

export default function Home() {
  const [adminKey, setAdminKey] = useState<PublicKey | null>(null);
  const program = useProgram();
  const wallet = useWallet();

  useEffect(() => {
    if (!wallet.publicKey || !program) return;

    const fetchAdminKey = async () => {
      try {
        const adminPubkey = new PublicKey(process.env.NEXT_PUBLIC_ADMIN_PUBKEY!);
        console.log('Admin PublicKey:', adminPubkey.toBase58());

        const [salePdaKey] = salePda(adminPubkey, program.programId);
        console.log('Derived Sale PDA Key:', salePdaKey.toBase58());


        const acc = await program.account.sale.fetch(salePdaKey);
        console.log('Fetched Sale Account:', acc);

        setAdminKey(acc.admin);
      } catch (error) {
        console.error("Error fetching sale account:", error);
        setAdminKey(null);
      }
    };

    fetchAdminKey();
  }, [wallet.publicKey, program]);

  return (
    <div className="relative mx-auto max-w-7xl font-sans flex flex-col items-center justify-items-center py-8 pb-20 gap-16">
      <HeroSection />
      <InfoSection />
      <BuySection />
      <AdminControls adminKey={adminKey} />
    </div>
  );
}
