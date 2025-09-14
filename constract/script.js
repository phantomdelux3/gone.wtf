const anchor = require('@coral-xyz/anchor');
const { PublicKey } = anchor.web3;

async function setupCompleteTokenSale() {
    const anchor = require('@coral-xyz/anchor');
    const { Connection, PublicKey } = anchor.web3;

    // Force provider to devnet
    const provider = new anchor.AnchorProvider(
        new Connection("https://api.devnet.solana.com", "confirmed"),
        anchor.Wallet.local(),
        {}
    );

    anchor.setProvider(provider);

    const program = anchor.workspace.SolanaContract; // uses Anchor.toml name

    console.log("Program ID:", program.programId.toString());
    // 2. Token mint address (replace with your actual mint)
    const goneMint = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

    // 3. Find PDAs
    const [salePDA] = await PublicKey.findProgramAddress(
        [Buffer.from("sale"), provider.wallet.publicKey.toBuffer()],
        program.programId
    );

    const [vaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("vault"), salePDA.toBuffer()],
        program.programId
    );

    const [vaultAuthorityPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("vault-authority")],
        program.programId
    );

    // 4. Initialize the sale
    console.log("Initializing token sale...");
    const tx = await program.methods
        .initializeSale(
            new anchor.BN(100000000000), // 100 SOL = 1B GONE
            new anchor.BN(10000000),     // 0.01 SOL min
            new anchor.BN(10000000000)   // 10 SOL max
        )
        .accounts({
            admin: provider.wallet.publicKey,
            sale: salePDA,
            tokenMint: goneMint,
            vault: vaultPDA,
            vaultAuthority: vaultAuthorityPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

    console.log("✅ Sale initialized! TX:", tx);
    console.log("📊 Sale PDA:", salePDA.toString());
    console.log("💰 Vault PDA:", vaultPDA.toString());

    return { salePDA, vaultPDA, vaultAuthorityPDA };
}

// Run the initialization
setupCompleteTokenSale().catch(console.error);
