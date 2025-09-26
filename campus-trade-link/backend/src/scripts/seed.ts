import { db } from '../db';
import { users, userStats, posts, products } from '../db/schema';
import { hashPassword } from '../lib/auth';
import logger from '../lib/logger';

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Create demo users
    const demoUsers = [
      {
        email: 'john.doe@st.ug.edu.gh',
        username: 'johndoe',
        displayName: 'John Doe',
        bio: 'Computer Science student at UG. Love coding and tech!',
        password: await hashPassword('Password123'),
        isVerified: true,
      },
      {
        email: 'jane.smith@st.ug.edu.gh',
        username: 'janesmith',
        displayName: 'Jane Smith',
        bio: 'Business student and entrepreneur. Selling quality items!',
        password: await hashPassword('Password123'),
        isVerified: true,
      },
      {
        email: 'mike.wilson@st.ug.edu.gh',
        username: 'mikewilson',
        displayName: 'Mike Wilson',
        bio: 'Sports enthusiast and fitness lover.',
        password: await hashPassword('Password123'),
        isVerified: true,
      }
    ];

    const createdUsers = [];
    for (const userData of demoUsers) {
      const [user] = await db.insert(users).values({
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        bio: userData.bio,
        passwordHash: userData.password,
        isVerified: userData.isVerified,
      }).returning();
      
      createdUsers.push(user);

      // Create user stats
      await db.insert(userStats).values({
        userId: user.id,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        productsCount: 0,
      });
    }

    logger.info(`Created ${createdUsers.length} demo users`);

    // Create demo posts
    const demoPosts = [
      {
        userId: createdUsers[0].id,
        content: 'Welcome to Campus Trade Link! 🎉 Excited to connect with fellow UG students.',
        imageUrls: [],
      },
      {
        userId: createdUsers[1].id,
        content: 'Just set up my new dorm room! Check out these amazing finds from the marketplace 📚✨',
        imageUrls: [],
      },
      {
        userId: createdUsers[2].id,
        content: 'Great workout session at the campus gym today! 💪 Who wants to join me tomorrow?',
        imageUrls: [],
      },
    ];

    for (const postData of demoPosts) {
      await db.insert(posts).values(postData);
    }

    logger.info(`Created ${demoPosts.length} demo posts`);

    // Create demo products
    const demoProducts = [
      {
        userId: createdUsers[1].id,
        title: 'MacBook Pro 2021 - Like New',
        description: 'Selling my MacBook Pro 2021 (M1 chip, 16GB RAM, 512GB SSD). Barely used, comes with original charger and box.',
        price: '2500.00',
        imageUrls: [],
        category: 'Electronics',
        condition: 'LIKE_NEW',
        location: 'Commonwealth Hall',
        isAvailable: true,
      },
      {
        userId: createdUsers[0].id,
        title: 'Data Structures and Algorithms Textbook',
        description: 'Introduction to Algorithms by Cormen, Leiserson, Rivest, and Stein. Great condition, no highlighting.',
        price: '45.00',
        imageUrls: [],
        category: 'Books',
        condition: 'GOOD',
        location: 'Computer Science Department',
        isAvailable: true,
      },
      {
        userId: createdUsers[2].id,
        title: 'Nike Running Shoes - Size 10',
        description: 'Comfortable Nike running shoes, size 10. Used for about 3 months, still in great shape!',
        price: '80.00',
        imageUrls: [],
        category: 'Sports',
        condition: 'GOOD',
        location: 'Akuafo Hall',
        isAvailable: true,
      },
    ];

    for (const productData of demoProducts) {
      await db.insert(products).values(productData);
    }

    logger.info(`Created ${demoProducts.length} demo products`);

    logger.info('Database seeding completed successfully');
    logger.info('Demo login credentials:');
    logger.info('Email: john.doe@st.ug.edu.gh, Password: Password123');
    logger.info('Email: jane.smith@st.ug.edu.gh, Password: Password123');
    logger.info('Email: mike.wilson@st.ug.edu.gh, Password: Password123');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();