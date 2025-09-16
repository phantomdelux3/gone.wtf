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
    public signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>,
    public signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>
  ) {}

  get payer() {
    return Keypair.generate();
  }
}

// Read-only wallet for cases where no real wallet is connected
class ReadonlyWallet implements Wallet {
  public publicKey: PublicKey;
  constructor() {
    this.publicKey = Keypair.generate().publicKey;
  }
  get payer() {
    return Keypair.generate();
  }
  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    throw new Error('Readonly wallet cannot sign transactions');
  }
  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    throw new Error('Readonly wallet cannot sign transactions');
  }
}

export function useProgram() {
  const wallet = useWallet();

  return useMemo(() => {
    const conn = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, 'confirmed');
    const provider = new AnchorProvider(
      conn,
      wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions
        ? new CustomWallet(wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions)
        : new ReadonlyWallet(),
      {}
    );
    
    return new Program<GoneTokenSale>(
      idl as Idl,
      provider
    );
  }, [wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);
}
