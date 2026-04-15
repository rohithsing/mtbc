const prisma = require('./prismaClient');

async function ensureUserExists() {
  try {
    // Check if any user exists
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found, creating a new one...');
      user = await prisma.user.create({
        data: {
          name: 'Demo User',
          email: 'demo@mtbc.local',
          phone: '1234567890'
        }
      });
      console.log('Created User ID:', user.user_id);
    } else {
      console.log('Using existing User ID:', user.user_id);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ensureUserExists();
