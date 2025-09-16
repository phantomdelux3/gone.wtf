'use client';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useProgram } from '@/lib/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { BN } from '@coral-xyz/anchor';
import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  salePda,
  vaultPda,
  vaultAuthPda,
} from '@/lib/findPda';

type SaleState = {
  rate: BN;
  min: BN;
  max: BN;
  remaining: BN;
  isActive: boolean;
  admin: PublicKey;
};

interface BuyTokenAccounts {
  sale: PublicKey;
  vault: PublicKey;
  vaultAuthority: PublicKey;
  buyer: PublicKey;
  buyerTokenAccount: PublicKey;
  adminTreasury: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export const BuyForm: FC = () => {
  const wallet = useWallet();
  const program = useProgram();
  const { setVisible } = useWalletModal();
  const [sale, setSale] = useState<SaleState | null>(null);
  const [isFetchingSale, setIsFetchingSale] = useState<boolean>(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [solInput, setSolInput] = useState('');
  const goneOut = sale && solInput
    ? new BN(Number(solInput) * LAMPORTS_PER_SOL).div(sale.rate)
    : new BN(0);

  // --- 1. pull sale account whenever program is ready ---
  useEffect(() => {
    (async () => {
      try {
        setSaleError(null);
        if (!program) {
          // Program not ready yet; keep showing loading state
          return;
        }
        setIsFetchingSale(true);

        const adminPubkey = new PublicKey(process.env.NEXT_PUBLIC_ADMIN_PUBKEY!);
        console.log('Admin PublicKey:', adminPubkey.toBase58());

        const [salePdaKey] = salePda(adminPubkey, program.programId);
        console.log('Derived Sale PDA Key:', salePdaKey.toBase58());

        const acc = await program.account.sale.fetch(salePdaKey);
        console.log('Fetched Sale Account:', acc);
        setSale({
          rate: acc.rate,
          min: acc.minPurchase,
          max: acc.maxPurchase,
          remaining: acc.tokensRemaining,
          isActive: acc.isActive,
          admin: acc.admin,
        });
      } catch (e) {
        console.error(e);
        setSaleError('Sale not found or failed to load.');
        toast.error('Sale not found for this admin.');
      } finally {
        setIsFetchingSale(false);
      }
    })();
  }, [program]);

  // --- 2. handler ---
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !program || !sale) return;
    const solBN = new BN(Number(solInput) * LAMPORTS_PER_SOL);
    if (solBN.lt(sale.min) || solBN.gt(sale.max)) {
      toast.error(`Must be between ${sale.min.div(new BN(LAMPORTS_PER_SOL)).toString()} – ${sale.max.div(new BN(LAMPORTS_PER_SOL)).toString()} SOL`);
      return;
    }
    try {
      const [saleKey] = salePda(sale.admin, program.programId);
      const [vaultKey] = vaultPda(saleKey, program.programId);
      const [vauthKey] = vaultAuthPda(program.programId);
      const buyerAta = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(process.env.NEXT_PUBLIC_TOKEN_MINT!),
        wallet.publicKey
      );

      const ix: TransactionInstruction[] = [];
      // create ATA if not exist
      const info = await program.provider.connection.getAccountInfo(buyerAta);
      if (!info) {
        ix.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            new PublicKey(process.env.NEXT_PUBLIC_TOKEN_MINT!),
            buyerAta,
            wallet.publicKey,
            wallet.publicKey
          )
        );
      }

      const lamports = new BN(Number(solInput) * LAMPORTS_PER_SOL);
      const accounts: BuyTokenAccounts = {
        sale: saleKey,
        vault: vaultKey,
        vaultAuthority: vauthKey,
        buyer: wallet.publicKey,
        buyerTokenAccount: buyerAta,
        adminTreasury: sale.admin,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      };

      // whitelist PDA only if whitelist enabled
      // Removed whitelist functionality as per user's request.
      // if (sale.whitelistCount > 0) {
      //   const [wlKey] = whitelistPda(saleKey, wallet.publicKey, program.programId);
      //   accounts.whitelistEntry = wlKey;
      // }
      if (!program.methods.buyTokens) {
        console.error("buyTokens method is not available on program.");
        toast.error("Program not ready. Please try again.");
        return;
      }
      const tx = await program.methods
        .buyTokens(lamports)
        .accounts(accounts)
        .preInstructions(ix)
        .rpc();

      toast.success(`Success! Tx: ${tx.slice(0, 6)}…`);
      setSolInput('');
    } catch (err: unknown) {
      console.error(err);
      toast.error(parseAnchorError(err));
    }
  };

  const handleConnect = async () => {
    try {
      if (!wallet.wallet) {
        setVisible(true);
        return;
      }
      await wallet.connect();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form id='buytoken' onSubmit={submit} className="max-w-md space-y-4 z-40">
      <div className="p-4 rounded">
        {sale ? (
          <>
            <p>Price&nbsp;<b>{sale.rate.div(new BN(LAMPORTS_PER_SOL)).toString()} GONE/SOL</b></p>
            <p>Min&nbsp;{sale.min.div(new BN(LAMPORTS_PER_SOL)).toString()} SOL • Max&nbsp;{sale.max.div(new BN(LAMPORTS_PER_SOL)).toString()} SOL</p>
            <p>{sale.remaining.toLocaleString()} GONE remaining</p>
            {!sale.isActive && <p className="text-red-500">Sale inactive</p>}
          </>
        ) : isFetchingSale ? (
          <>
            <p>Loading sale…</p>
          </>
        ) : saleError ? (
          <>
            <p className="text-red-500">{saleError}</p>
          </>
        ) : null}
      </div>

      <label className="block">
        <span className="text-sm">Amount in SOL</span>
        <input
          type="number"
          min={sale ? sale.min.div(new BN(LAMPORTS_PER_SOL)).toNumber() : 0}
          max={sale ? sale.max.div(new BN(LAMPORTS_PER_SOL)).toNumber() : 0}
          step="0.01"
          value={solInput}
          onChange={e => setSolInput(e.target.value)}
          className="mt-1 w-full border rounded p-2"
          required
          disabled={!wallet.connected || !sale}
        />
      </label>

      <p>
        You will receive&nbsp;
        <b>{goneOut.toLocaleString()}</b>&nbsp;GONE
      </p>

      {!wallet.connected ? (
        <button
          type="button"
          onClick={handleConnect}
          className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50">
          Connect Wallet
        </button>
      ) : (
        <button
          type="submit"
          disabled={!sale || !sale.isActive}
          className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50">
          Buy Tokens
        </button>
      )}
    </form>
  );
};

// ---------- helpers ----------
function parseAnchorError(e: unknown) {
  const err = e as { error?: { errorMessage?: string }; message?: string };
  const msg = err.error?.errorMessage || err.message || 'Transaction failed';
  if (msg.includes('saleInactive')) return 'Sale is not active';
  if (msg.includes('belowMinPurchase')) return 'Below minimum purchase';
  if (msg.includes('aboveMaxPurchase')) return 'Above maximum purchase';
  if (msg.includes('insufficientTokens')) return 'Sold out';
  return msg;
}
