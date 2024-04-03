import {
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionMessage,
  Connection,
  clusterApiUrl,
  SystemProgram,
  Keypair,
  TransactionInstruction,
  PublicKey,
} from "@solana/web3.js";

import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

// Playground wallet
const payer = pg.wallet.keypair;

// Connection to devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function getSimulationUnits(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey
): Promise<number | undefined> {
  const testInstructions = [
    // 最終的にsetComputeUnitLimitも使うので、ここで含めている
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ...instructions,
  ];
  // get the latest recent blockhash
  let recentBlockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  const testVersionedTxn = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payer,
      recentBlockhash: recentBlockhash,
    }).compileToV0Message()
  );

  const simulation = await connection.simulateTransaction(testVersionedTxn, {
    // ポイント
    // 下の二つは両立できない。RecentBlockhashが変わると、Signatureも変わるから
    replaceRecentBlockhash: true,
    sigVerify: false,
  });

  if (simulation.value.err) {
    return undefined;
  }
  // console.log("simulation", simulation);
  return simulation.value.unitsConsumed;
}

// Generate new keypair for Mint Account
const toAccountKeypair = Keypair.generate();
// Address for Mint Account
const toAccount = toAccountKeypair.publicKey;

// instruction 1 ここでは例として、CU価格の設定
const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 400,
});

// instruction 2  ここでは例として、アカウントの作成
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
  newAccountPubkey: toAccount, // Address of the account to create
  space: 100, // Amount of bytes to allocate to the created account
  lamports: 100, // Amount of lamports transferred to created account
  programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
});

// instruction 3  ここでは例として、トークンの送付
const transferInstruction = SystemProgram.transfer({
  fromPubkey: payer.publicKey,
  toPubkey: toAccount,
  lamports: 10000000,
});

const estimateInstructions = [
  addPriorityFee,
  createAccountInstruction,
  transferInstruction,
];

const unitsConsumed = await getSimulationUnits(
  connection,
  estimateInstructions,
  payer.publicKey
);

// ドキュメントに10%アップの例が書かれていたので、10%増量
const unitsForUse = unitsConsumed * 1.1;

console.log("推測されるCU", unitsConsumed);
console.log("設定用CU（10%アップ）", unitsForUse);
