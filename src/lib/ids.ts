import { prisma } from "./db";

export async function nextReadableId(prefix: "STU" | "TCH"): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;

  const counter = await prisma.idCounter.upsert({
    where: { prefix: key },
    create: { prefix: key, value: 1 },
    update: { value: { increment: 1 } },
  });

  return `${prefix}-${year}-${String(counter.value).padStart(5, "0")}`;
}
