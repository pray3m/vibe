import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Seeding users...");

  try {
    const users = [
      {
        email: "alice@vibe.com",
        name: "Alice Johnson",
        password: "password123@",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      },
      {
        email: "bob@vibe.com",
        name: "Bob Smith",
        password: "password123@",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      },
      {
        email: "prem@vibe.com",
        name: "Prem Gautam",
        password: "password123@",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prem",
      },
    ];

    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`✓ User ${userData.email} already exists`);
        continue;
      }

      // Create user with Better Auth's internal utilities
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          image: userData.image,
          emailVerified: true,
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      });

      const hashedPassword = await auth.api
        .signUpEmail({
          body: {
            email: userData.email,
            password: userData.password,
            name: userData.name,
          },
        } as any)
        .catch(() => null);

      if (!hashedPassword) {
        console.log(`✓ User created: ${userData.email}`);
      } else {
        console.log(`✓ User created with auth: ${userData.email}`);
      }
    }

    const totalUsers = await prisma.user.count();
    console.log(
      `\n✨ Database seeded successfully! Total users: ${totalUsers}`,
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
