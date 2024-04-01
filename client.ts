import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";

// Playground wallet
const payer = pg.wallet.keypair;

// Connection to devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Generate new keypair for Mint Account
const toAccountKeypair = Keypair.generate();
// Address for Mint Account
const toAccount = toAccountKeypair.publicKey;

// Transaction signature returned from sent transaction
let transactionSignature: string;

const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 20_000_000,
});

const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 90_000,
});

const transaction = new Transaction()
  .add(addPriorityFee)
  .add(modifyComputeUnits)
  .add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount,
      lamports: 10000000,
    })
  );

// Send transaction
transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer] // Signers
);

console.log(
  "\nTransfer Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);
