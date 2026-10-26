require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const usersData = [
    {
      username: "sarthak",
      email: "sarthak@example.com",
      fullname: "Sarthak Jaiswal",
      bio: "Building cool things",
    },
    {
      username: "rahul",
      email: "rahul@example.com",
      fullname: "Rahul Sharma",
      bio: "Photography enthusiast",
    },
    {
      username: "priya",
      email: "priya@example.com",
      fullname: "Priya Verma",
      bio: "Travel and lifestyle",
    },
  ];

  const users = [];

  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: userData,
      create: userData,
    });

    users.push(user);
  }

  const postsData = [
    {
      imageUrl: "https://picsum.photos/id/1011/600/400",
      caption: "Mountain vibes",
      location: "Manali",
      authorId: users[0].id,
    },
    {
      imageUrl: "https://picsum.photos/id/1015/600/400",
      caption: "Nature is beautiful",
      location: "Goa",
      authorId: users[0].id,
    },
    {
      imageUrl: "https://picsum.photos/id/1025/600/400",
      caption: "A perfect day",
      location: "Mumbai",
      authorId: users[1].id,
    },
    {
      imageUrl: "https://picsum.photos/id/1039/600/400",
      caption: "Exploring new places",
      location: "Goa",
      authorId: users[2].id,
    },
  ];

  const posts = [];

  for (const postData of postsData) {
    const post = await prisma.post.create({
      data: postData,
    });

    posts.push(post);
  }

  const likesData = [
    { userId: users[1].id, postId: posts[0].id },
    { userId: users[2].id, postId: posts[0].id },
    { userId: users[0].id, postId: posts[2].id },
    { userId: users[0].id, postId: posts[3].id },
    { userId: users[1].id, postId: posts[3].id },
  ];

  for (const likeData of likesData) {
    await prisma.like.upsert({
      where: {
        userId_postId: {
          userId: likeData.userId,
          postId: likeData.postId,
        },
      },
      update: {},
      create: likeData,
    });
  }

  console.log("Seed completed successfully!");
  console.log(`Users: ${users.length}`);
  console.log(`New posts created: ${posts.length}`);
  console.log(`Likes ensured: ${likesData.length}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });