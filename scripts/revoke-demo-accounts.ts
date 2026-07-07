import "dotenv/config";
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const db = new PrismaClient({ adapter });

const DEMO_EMAILS = ["demo@labescape.app", "admin@labescape.app"];

async function main() {
  const randomHash = await bcrypt.hash(crypto.randomUUID(), 12);
  const result = await db.user.updateMany({
    where: { email: { in: DEMO_EMAILS } },
    data: { passwordHash: randomHash, role: "PLAYER" },
  });
  console.log(`Revoked ${result.count} demo account(s). Passwords rotated; admin demoted to PLAYER.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
