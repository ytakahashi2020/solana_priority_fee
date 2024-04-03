import {
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionMessage,
  Connection,
  clusterApiUrl,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";

import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

// Playground wallet
const payer = pg.wallet.keypair;

// Connection to devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Generate new keypair for Mint Account
const toAccountKeypair = Keypair.generate();
// Address for Mint Account
const toAccount = toAccountKeypair.publicKey;

const testInstructions = [
  ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 400 }),
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
    newAccountPubkey: toAccount, // Address of the account to create
    space: 100, // Amount of bytes to allocate to the created account
    lamports: 100, // Amount of lamports transferred to created account
    programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
  }),
  SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: toAccount,
    lamports: 10000000,
  }),
];
// get the latest recent blockhash
let recentBlockhash = await connection
  .getLatestBlockhash()
  .then((res) => res.blockhash);

const testVersionedTxn = new VersionedTransaction(
  new TransactionMessage({
    instructions: testInstructions,
    payerKey: payer.publicKey,
    recentBlockhash: recentBlockhash,
  }).compileToV0Message()
);

const simulation = await connection.simulateTransaction(testVersionedTxn, {
  replaceRecentBlockhash: true,
  sigVerify: false,
});

console.log("simulation", simulation);
