import prisma from "../src/config/prisma.js";

const topics = [
  {
    name: "Housing",
    description: "Discuss on-campus and off-campus housing options",
  },
  { name: "Modules", description: "Share advice and review on NUS modules" },
  { name: "Campus Life", description: "Everything about life at NUS" },
  {
    name: "Internships",
    description: "Intership experiences, tips, and opportunities",
  },
  { name: "Research", description: "Research opportunities and experiences" },
  { name: "Events", description: "NUS events and activities" },
  {
    name: "Collaboration",
    description: "Find project collaborators and teammates",
  },
];

const seed = async () => {
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: {},
      create: topic,
    });
  }
  console.log("Topics seeded successfully");
  await prisma.$disconnect();
};

seed();
