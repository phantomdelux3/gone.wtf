#!/usr/bin/env node

const { PublicKey, Connection } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');
const { AnchorProvider, Program, Wallet } = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Program ID from the IDL
const PROGRAM_ID = new PublicKey('7CaNmSTwdReV7HTPQo8k2AKrKjhF8FhmQERMPBoUyT7z');

// PDA functions
function salePda(admin, programId) {
  return PublicKey.findProgramAddressSync([Buffer.from('sale'), admin.toBuffer()], programId);
}

function vaultPda(sale, programId) {
  return PublicKey.findProgramAddressSync([Buffer.from('vault'), sale.toBuffer()], programId);
}

function vaultAuthPda(programId) {
  return PublicKey.findProgramAddressSync([Buffer.from('vault-authority')], programId);
}

async function findVaultPdaAndAta() {
  try {
    console.log('🔍 Finding Vault PDA and ATA...\n');

    // Use environment variables or fallback to hardcoded values for demonstration
    const adminPubkeyStr = process.env.NEXT_PUBLIC_ADMIN_PUBKEY || '2H2XuPmph9PWVmiKdQdWJky8gYyZb7FEoosKW4mLc5WD';
    const tokenMintStr = process.env.NEXT_PUBLIC_TOKEN_MINT || '9LbEuKtcZEN66hBEAe6Hjx1Fxg9FiMfg2gzKM1NBpWXa';
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

    console.log('📋 Using Admin Public Key:', adminPubkeyStr);
    console.log('🪙 Using Token Mint:', tokenMintStr);
    console.log('🌐 Using RPC URL:', rpcUrl);
    console.log('');

    // Get admin public key
    const adminPubkey = new PublicKey(adminPubkeyStr);
    console.log('📋 Admin Public Key:', adminPubkey.toBase58());

    // Find sale PDA
    const [salePdaKey] = salePda(adminPubkey, PROGRAM_ID);
    console.log('🏪 Sale PDA:', salePdaKey.toBase58());

    // Find vault PDA
    const [vaultPdaKey] = vaultPda(salePdaKey, PROGRAM_ID);
    console.log('🏦 Vault PDA:', vaultPdaKey.toBase58());

    // Find vault authority PDA
    const [vaultAuthKey] = vaultAuthPda(PROGRAM_ID);
    console.log('🔐 Vault Authority PDA:', vaultAuthKey.toBase58());

    // Get token mint
    const tokenMint = new PublicKey(tokenMintStr);
    console.log('🪙 Token Mint:', tokenMint.toBase58());

    // Note: Vault PDA cannot have an ATA since it's a PDA, not a wallet
    // The vault is typically a token account created by the program
    console.log('⚠️  Note: Vault PDA cannot have an ATA (PDA cannot be token owner)');
    console.log('💡 The vault should be a token account created by the program, not an ATA');

    // Create connection
    const connection = new Connection(rpcUrl, 'confirmed');
    
    // Check vault PDA account
    const vaultPdaInfo = await connection.getAccountInfo(vaultPdaKey);
    console.log('📊 Vault PDA Exists:', vaultPdaInfo ? 'Yes' : 'No');

    // Check sale account
    const saleInfo = await connection.getAccountInfo(salePdaKey);
    console.log('📊 Sale Account Exists:', saleInfo ? 'Yes' : 'No');
    
    // If sale account exists, try to fetch its data
    if (saleInfo) {
      try {
        // Note: This would require the program to be loaded to decode the account data
        console.log('📊 Sale Account Data Size:', saleInfo.data.length, 'bytes');
        console.log('📊 Sale Account Owner:', saleInfo.owner.toBase58());
        console.log('📊 Sale Account Executable:', saleInfo.executable);
        console.log('📊 Sale Account Rent Epoch:', saleInfo.rentEpoch);
      } catch (error) {
        console.log('⚠️  Could not decode sale account data:', error.message);
      }
    }

    // Show program instructions from IDL
    console.log('\n📋 Program Instructions:');
    console.log('=======================');
    console.log('1. initializeSale - Initialize a new token sale');
    console.log('2. buyTokens - Buy tokens with SOL');
    console.log('3. syncTokens - Sync token balances');
    console.log('4. updateSale - Update sale parameters');
    console.log('5. withdrawRemaining - Withdraw remaining tokens');

    // Show buy_tokens instruction accounts
    console.log('\n📋 Buy Tokens Instruction Accounts:');
    console.log('===================================');
    console.log('• sale (writable) - The sale account');
    console.log('• vault (writable, PDA) - Token vault account');
    console.log('• vault_authority (PDA) - Vault authority');
    console.log('• buyer (writable, signer) - Buyer wallet');
    console.log('• buyer_token_account (writable) - Buyer\'s token account');
    console.log('• admin_treasury (writable) - Admin treasury for SOL');
    console.log('• token_program - SPL Token program');
    console.log('• system_program - System program');

    // Summary
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log(`Admin: ${adminPubkey.toBase58()}`);
    console.log(`Sale PDA: ${salePdaKey.toBase58()}`);
    console.log(`Vault PDA: ${vaultPdaKey.toBase58()}`);
    console.log(`Vault Authority: ${vaultAuthKey.toBase58()}`);
    console.log(`Token Mint: ${tokenMint.toBase58()}`);
    console.log(`Program ID: ${PROGRAM_ID.toBase58()}`);

    // Save to file for reference
    const addresses = {
      admin: adminPubkey.toBase58(),
      salePda: salePdaKey.toBase58(),
      vaultPda: vaultPdaKey.toBase58(),
      vaultAuthority: vaultAuthKey.toBase58(),
      tokenMint: tokenMint.toBase58(),
      programId: PROGRAM_ID.toBase58(),
      note: "Vault PDA cannot have ATA - it should be a token account created by the program"
    };

    fs.writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));
    console.log('\n💾 Addresses saved to addresses.json');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the function
findVaultPdaAndAta();
