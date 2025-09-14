// lib/useProgram.ts
import { AnchorProvider, Program, Idl, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import idl from '@/idl/gone_token_sale.json.json';
import { GoneTokenSale } from '@/types/gone_token_sale';

// Create a custom wallet adapter that implements Anchor's Wallet interface
class CustomWallet implements Wallet {
  constructor(
    public publicKey: PublicKey,
    public signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>,
    public signAllTransactions: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>
  ) {}

  get payer() {
    return Keypair.generate();
  }
}

export function useProgram() {
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    const conn = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, 'confirmed');
    const customWallet = new CustomWallet(
      wallet.publicKey,
      wallet.signTransaction,
      wallet.signAllTransactions
    );
    const provider = new AnchorProvider(conn, customWallet, {});
    
    return new Program<GoneTokenSale>(
      idl as Idl,
      provider
    );
  }, [wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);
}
