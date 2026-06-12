import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.dataSource.upsert({
    where: { key: "mock" },
    update: {},
    create: {
      key: "mock",
      name: "Soccer Intelligence Development Dataset",
      category: "football",
      priority: 1,
      enabled: true
    }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
