'use client';
import { FC, useState, useEffect } from 'react';
import { useProgram } from '@/lib/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { salePda, vaultPda } from '@/lib/findPda';
// import { InitializeSaleAccounts } from '@/types/gone_token_sale';
// Removed unused import: import { GoneTokenSale } from '@/types/gone_token_sale';
// Removed unused import: import { Program } from '@coral-xyz/anchor';

type UpdateSaleAccountsStrict = {
  sale: anchor.web3.PublicKey;
  admin: anchor.web3.PublicKey;
};

type UpdateSaleArgsStrict = [
  (anchor.BN | null) | undefined,
  (anchor.BN | null) | undefined,
  (anchor.BN | null) | undefined,
  (boolean | null) | undefined,
];

type SyncTokensAccountsStrict = {
  sale: anchor.web3.PublicKey;
  admin: anchor.web3.PublicKey;
  vault: anchor.web3.PublicKey;
};

interface AdminControlsProps {
  adminKey: PublicKey | null;
}

export const AdminControls: FC<AdminControlsProps> = ({ adminKey }) => {
  const wallet = useWallet();
  const program = useProgram();

  const [rate, setRate] = useState<string>('10'); // Default rate
  const [minPurchase, setMinPurchase] = useState<string>('0.01'); // Default min purchase
  const [maxPurchase, setMaxPurchase] = useState<string>('10'); // Default max purchase
  const [isActive, setIsActive] = useState<boolean>(false); // New state for isActive

  const isAdmin = wallet.publicKey && adminKey && wallet.publicKey.equals(adminKey);

  useEffect(() => {
    if (!isAdmin || !wallet.publicKey || !program) return;

    const fetchSaleData = async () => {
      try {
        const adminPubkey = new PublicKey(process.env.NEXT_PUBLIC_ADMIN_PUBKEY!);
        console.log('Admin PublicKey:', adminPubkey.toBase58());

        const [salePdaKey] = salePda(adminPubkey, program.programId);
        console.log('Derived Sale PDA Key:', salePdaKey.toBase58());


        const acc = await program.account.sale.fetch(salePdaKey);
        console.log('Fetched Sale Account:', acc);

        setRate((acc.rate.toNumber() / LAMPORTS_PER_SOL).toString());
        setMinPurchase((acc.minPurchase.toNumber() / LAMPORTS_PER_SOL).toString());
        setMaxPurchase((acc.maxPurchase.toNumber() / LAMPORTS_PER_SOL).toString());
        setIsActive(acc.isActive);
      } catch (error) {
        console.error("Error fetching sale account:", error);
        toast.error('Failed to load sale data.');
      }
    };

    fetchSaleData();
  }, [isAdmin, wallet.publicKey, program]);

  const handleUpdateSale = async () => {
    if (!wallet.publicKey || !program) {
      toast.error('Wallet not connected or program not loaded.');
      return;
    }

    try {
      const [salePdaKey] = salePda(wallet.publicKey, program.programId);

      const rateBN = rate ? new anchor.BN(parseFloat(rate) * LAMPORTS_PER_SOL) : null;
      const minPurchaseBN = minPurchase ? new anchor.BN(parseFloat(minPurchase) * LAMPORTS_PER_SOL) : null;
      const maxPurchaseBN = maxPurchase ? new anchor.BN(parseFloat(maxPurchase) * LAMPORTS_PER_SOL) : null;

      await program.methods.updateSale(
        ...([rateBN, minPurchaseBN, maxPurchaseBN, isActive] as UpdateSaleArgsStrict)
      ).accounts({
        sale: salePdaKey,
        admin: wallet.publicKey,
      } as UpdateSaleAccountsStrict).rpc();

      toast.success('Sale updated successfully!');
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('Failed to update sale.');
    }
  };

  const handleSyncTokensRemaining = async () => {
    if (!wallet.publicKey || !program) {
      toast.error('Wallet not connected or program not loaded.');
      return;
    }

    try {
      const [salePdaKey] = salePda(wallet.publicKey, program.programId);
      const [vaultPdaKey] = vaultPda(salePdaKey, program.programId);

      await program.methods.syncTokens()
        .accounts({
          sale: salePdaKey,
          admin: wallet.publicKey,
          vault: vaultPdaKey,
        } as SyncTokensAccountsStrict).rpc();

      toast.success('Tokens remaining synced successfully!');
    } catch (error) {
      console.error('Error syncing tokens remaining:', error);
      toast.error('Failed to sync tokens remaining.');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Admin Controls</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="rate" className="block text-gray-300 text-sm font-bold mb-2">Rate (GONE per SOL)</label>
          <input
            type="number"
            id="rate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            step="any"
          />
        </div>
        <div>
          <label htmlFor="minPurchase" className="block text-gray-300 text-sm font-bold mb-2">Min Purchase (SOL)</label>
          <input
            type="number"
            id="minPurchase"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={minPurchase}
            onChange={(e) => setMinPurchase(e.target.value)}
            step="any"
          />
        </div>
        <div>
          <label htmlFor="maxPurchase" className="block text-gray-300 text-sm font-bold mb-2">Max Purchase (SOL)</label>
          <input
            type="number"
            id="maxPurchase"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={maxPurchase}
            onChange={(e) => setMaxPurchase(e.target.value)}
            step="any"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            className="mr-2 leading-tight"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive" className="text-gray-300 text-sm font-bold">Sale Is Active</label>
        </div>
        <button
          onClick={handleUpdateSale}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
        >
          Update Sale
        </button>
        <button
          onClick={handleSyncTokensRemaining}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sync Tokens Remaining
        </button>
      </div>
    </div>
  );
};
