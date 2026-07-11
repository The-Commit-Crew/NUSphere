import prisma from "../src/config/prisma.js";
import bcrypt from "bcrypt";

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
  { name: "Events", description: "NUS events and activities" },
];

const seed = async () => {
  try {
    const createdTopics = [];
    for (const topic of topics) {
      const t = await prisma.topic.upsert({
        where: { name: topic.name },
        update: {},
        create: topic,
      });
      createdTopics.push(t);
    }
    console.log("Topics seeded successfully");

    const password = await bcrypt.hash("Password123!", 10);
    const sampleUser = await prisma.user.upsert({
      where: { email: "admin@u.nus.edu" },
      update: {},
      create: {
        firstName: "NUSphere",
        lastName: "Admin",
        email: "admin@u.nus.edu",
        username: "nusphere_admin",
        password,
        isVerified: true,
      }
    });

    for (const topic of createdTopics) {
      const postTitle = `Welcome to ${topic.name}!`;
      let post = await prisma.post.findFirst({
        where: { title: postTitle, topicId: topic.id }
      });

      if (!post) {
        post = await prisma.post.create({
          data: {
            title: postTitle,
            content: `This is a sample post to kick off the ${topic.name} topic. Feel free to start discussing!`,
            topicId: topic.id,
            authorId: sampleUser.id,
            isAnonymous: false
          }
        });

        await prisma.comment.create({
          data: {
            content: "Great to see this topic created! Looking forward to the discussions.",
            postId: post.id,
            authorId: sampleUser.id,
            isAnonymous: false
          }
        });
      }
    }
    console.log("Sample posts and comments seeded successfully");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
