/**
 * init_sale.ts ― initialise the GONE token-sale
 *
 * Prerequisites
 *  - `anchor set-provider` already points at the wallet+cluster you want to use
 *  - vault PDA *must* be funded with the GONE tokens you plan to sell
 *  - gone_token_sale_idl.json (anchor build output) is in the same directory
 */

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import readline from "readline";
import { readFileSync } from 'fs';
import pkg from '@coral-xyz/anchor';
const { BN } = pkg;

// ---------- helper for CLI input ----------
function ask(query: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(query, (ans) => { rl.close(); res(ans); }));
}

(async () => {
  // 1. Provider & program -----------------------------------------------------------------
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const PROGRAM_ID = new PublicKey("7CaNmSTwdReV7HTPQo8k2AKrKjhF8FhmQERMPBoUyT7z");
  
  // Load IDL using fs
  const idl = JSON.parse(readFileSync("./target/idl/gone_token_sale.json", "utf8"));
  
  const program = new anchor.Program(idl as anchor.Idl, provider);

  const admin = provider.wallet;                                 // Signer for this script

  // 2. Derive PDAs ------------------------------------------------------------------------
  const [salePda, saleBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("sale"), admin.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const [vaultAuthPda, vaultAuthBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault-authority")],
    PROGRAM_ID
  );

  const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), salePda.toBuffer()],
    PROGRAM_ID
  );

  // 3. Display everything -----------------------------------------------------------------
  console.log("\n========= GONE Sale Setup =========");
  console.log("Admin             :", admin.publicKey.toBase58());
  console.log("Sale PDA          :", salePda.toBase58(), "bump:", saleBump);
  console.log("Vault PDA         :", vaultPda.toBase58(), "bump:", vaultBump);
  console.log("Vault-Authority   :", vaultAuthPda.toBase58(), "bump:", vaultAuthBump);
  console.log("===================================\n");

  // 4. Prompt for parameters --------------------------------------------------------------
  const mintStr  = (await ask("Token-mint address        : ")).trim();
  const rateStr  = (await ask("Rate (tokens per lamport) : ")).trim();
  const minStr   = (await ask("Min purchase (SOL)        : ")).trim();
  const maxStr   = (await ask("Max purchase (SOL)        : ")).trim();

  const tokenMint     = new PublicKey(mintStr);
  const rate          = new BN(rateStr);
  const minPurchase   = new BN(Math.floor(parseFloat(minStr) * 1e9)); // Convert SOL to lamports
  const maxPurchase   = new BN(Math.floor(parseFloat(maxStr) * 1e9)); // Convert SOL to lamports

  console.log("\nParsed parameters:");
  console.log("Rate (tokens per lamport):", rate.toString());
  console.log("Min purchase (lamports):", minPurchase.toString());
  console.log("Max purchase (lamports):", maxPurchase.toString());
  console.log("Rate (tokens per SOL):", rate.mul(new BN(1e9)).toString());
  console.log("");

  // 5. Send initialise transaction --------------------------------------------------------
  try {
    console.log("\nInitialising sale, please approve the wallet pop-up…");
    const sig = await program.methods
      .initializeSale(rate, minPurchase, maxPurchase)
      .accounts({
        sale:            salePda,
        admin:           admin.publicKey,
        tokenMint:       tokenMint,
        vault:           vaultPda,
        vaultAuthority:  vaultAuthPda,
        systemProgram:   SystemProgram.programId,
        tokenProgram:    anchor.utils.token.TOKEN_PROGRAM_ID,
        rent:            anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    console.log("✅ Sale initialised! Tx signature:", sig);
  } catch (err) {
    console.error("❌ Failed to initialise sale:", err);
  }
})();
