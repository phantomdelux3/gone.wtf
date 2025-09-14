// lib/findPda.ts
import { PublicKey } from '@solana/web3.js';

export function salePda(admin: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from('sale'), admin.toBuffer()], programId);
}
export function vaultPda(sale: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from('vault'), sale.toBuffer()], programId);
}
export function vaultAuthPda(programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from('vault-authority')], programId);
}
export function whitelistPda(sale: PublicKey, buyer: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('whitelist'), sale.toBuffer(), buyer.toBuffer()],
    programId
  );
}
