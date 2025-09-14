// lib/useProgram.ts
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import idl from '@/idl/gone_token_sale.json.json';
import { GoneTokenSale } from '@/types/gone_token_sale';
import { PublicKey } from '@solana/web3.js';

export function useProgram() {
  const wallet = useWallet();

  return useMemo(() => {
    const conn      = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, 'confirmed');
    const provider  = new AnchorProvider(conn, wallet as any, {});
    // Cast Program with the concrete IDL interface so TS knows `account.sale`
    return new Program<GoneTokenSale>(
      idl as Idl,
      provider
    );
  }, [wallet]);
}
