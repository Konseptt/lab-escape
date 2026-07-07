import "dotenv/config";
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { ROOMS, WINGS, ACHIEVEMENTS } from "../src/lib/content/rooms";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/lab_escape",
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Lab Escape…");

  const institution = await db.institution.upsert({
    where: { domain: "demo.edu" },
    update: {},
    create: {
      name: "Demonstration University",
      domain: "demo.edu",
      seats: 500,
      plan: "research",
    },
  });

  for (const wing of WINGS) {
    await db.wing.upsert({
      where: { slug: wing.slug },
      update: { name: wing.name, ordinal: wing.ordinal, mapX: wing.mapX, mapY: wing.mapY },
      create: wing,
    });
  }

  // Two passes so unlockAfter references resolve.
  for (const room of ROOMS) {
    const wing = await db.wing.findUniqueOrThrow({ where: { slug: room.wing } });
    const data = {
      code: room.code,
      title: room.title,
      domain: room.domain,
      paradigm: room.paradigm,
      engine: room.engine,
      summary: room.summary,
      concept: room.concept,
      background: room.background,
      difficulty: room.difficulty,
      durationMin: room.durationMin,
      ordinal: room.ordinal,
      wingId: wing.id,
      learningGoals: room.learningGoals,
      skills: room.skills,
      originalStudy: room.originalStudy as object,
      applications: room.applications,
      config: room.config as object,
    };
    await db.room.upsert({
      where: { slug: room.slug },
      update: data,
      create: { slug: room.slug, ...data },
    });
  }
  for (const room of ROOMS.filter((r) => r.unlockAfter)) {
    const prev = await db.room.findUniqueOrThrow({ where: { slug: room.unlockAfter! } });
    await db.room.update({ where: { slug: room.slug }, data: { unlockAfterId: prev.id } });
  }

  for (const a of ACHIEVEMENTS) {
    const room = a.roomSlug
      ? await db.room.findUnique({ where: { slug: a.roomSlug } })
      : null;
    await db.achievement.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        slug: a.slug,
        title: a.title,
        description: a.description,
        xpReward: a.xpReward,
        secret: a.secret ?? false,
        roomId: room?.id,
        criterion: {},
      },
    });
  }

  if (process.env.SEED_DEMO_ACCOUNTS === "true") {
    const demoPassword = process.env.SEED_DEMO_PASSWORD;
    if (!demoPassword || demoPassword.length < 10) {
      throw new Error(
        "SEED_DEMO_PASSWORD must be set (min 10 chars) when SEED_DEMO_ACCOUNTS=true"
      );
    }
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    for (const user of [
      {
        email: "demo@labescape.app",
        name: "Demo Participant",
        role: "PLAYER" as const,
        xp: 480,
        level: 3,
      },
      {
        email: "admin@labescape.app",
        name: "Facility Admin",
        role: "ADMIN" as const,
        xp: 0,
        level: 1,
      },
    ]) {
      await db.user.upsert({
        where: { email: user.email },
        update: { passwordHash },
        create: {
          email: user.email,
          name: user.name,
          passwordHash,
          emailVerified: new Date(),
          role: user.role,
          institutionId: institution.id,
          xp: user.xp,
          level: user.level,
          settings: { create: {} },
        },
      });
    }
    console.log("Demo accounts created (SEED_DEMO_ACCOUNTS=true).");
  } else {
    console.log("Skipped demo accounts (set SEED_DEMO_ACCOUNTS=true for local demos).");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
