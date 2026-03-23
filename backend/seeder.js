const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');


const PRODUCTS = [
  { name: 'Apple MacBook Pro M3', description: 'The most powerful MacBook ever, with Apple M3 chip for incredible performance and battery life.', price: 199999, originalPrice: 229999, category: 'Electronics', brand: 'Apple', images: ['https://picsum.photos/seed/mac/600/500'], countInStock: 15, rating: 4.8, numReviews: 124, featured: true, tags: ['laptop', 'apple', 'pro'] },
  { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise canceling headphones with 30-hour battery life and premium sound quality.', price: 24999, originalPrice: 34999, category: 'Electronics', brand: 'Sony', images: ['https://picsum.photos/seed/sony/600/500'], countInStock: 30, rating: 4.7, numReviews: 89, featured: true, tags: ['headphones', 'wireless', 'sony'] },
  { name: 'Samsung 4K OLED TV 55"', description: 'Stunning 4K OLED display with Quantum HDR and built-in smart features.', price: 79999, originalPrice: 99999, category: 'Electronics', brand: 'Samsung', images: ['https://picsum.photos/seed/tv/600/500'], countInStock: 8, rating: 4.6, numReviews: 56, featured: true, tags: ['tv', 'samsung', '4k'] },
  { name: 'Nike Air Max 270', description: 'Iconic silhouette with Max Air cushioning for all-day comfort and bold style.', price: 10999, originalPrice: 13999, category: 'Fashion', brand: 'Nike', images: ['https://picsum.photos/seed/nike/600/500'], countInStock: 50, rating: 4.5, numReviews: 210, featured: true, tags: ['shoes', 'nike', 'sports'] },
  { name: "Levi's 511 Slim Fit Jeans", description: 'Classic slim fit jeans with a modern cut. Made from premium stretch denim for maximum comfort.', price: 3499, originalPrice: 4999, category: 'Fashion', brand: "Levi's", images: ['https://picsum.photos/seed/jeans/600/500'], countInStock: 80, rating: 4.3, numReviews: 178, featured: false, tags: ['jeans', 'fashion', 'casual'] },
  { name: 'BoAt Airdopes 411', description: 'True wireless earbuds with 20 hours total playback, deep bass and touch controls.', price: 2499, originalPrice: 3999, category: 'Electronics', brand: 'Boát', images: ['https://picsum.photos/seed/boat/600/500'], countInStock: 100, rating: 4.1, numReviews: 345, featured: false, tags: ['earbuds', 'wireless', 'music'] },
  { name: 'Dyson V15 Detect Vacuum', description: 'Laser-powered vacuum that reveals hidden dust. Powerful suction for a truly deep clean.', price: 54999, originalPrice: 64999, category: 'Home', brand: 'Dyson', images: ['https://picsum.photos/seed/dyson/600/500'], countInStock: 12, rating: 4.9, numReviews: 67, featured: true, tags: ['vacuum', 'cleaning', 'home'] },
  { name: 'Instant Pot Duo 7-in-1', description: 'Pressure cooker, slow cooker, rice cooker, steamer, saute pan, yogurt maker, and warmer in one device.', price: 7999, originalPrice: 10999, category: 'Home', brand: 'Instant Pot', images: ['https://picsum.photos/seed/pot/600/500'], countInStock: 25, rating: 4.6, numReviews: 423, featured: false, tags: ['kitchen', 'cooking', 'home'] },
  { name: 'The Alchemist - Paulo Coelho', description: 'A magical story about following your dreams, beloved worldwide. Paperback edition.', price: 299, originalPrice: 399, category: 'Books', brand: 'HarperCollins', images: ['https://picsum.photos/seed/book/600/500'], countInStock: 200, rating: 4.8, numReviews: 1204, featured: false, tags: ['book', 'fiction', 'bestseller'] },
  { name: 'Fitbit Charge 6', description: 'Advanced fitness tracker with built-in GPS, heart rate monitoring, stress management and 7-day battery.', price: 14999, originalPrice: 18999, category: 'Electronics', brand: 'Fitbit', images: ['https://picsum.photos/seed/fitbit/600/500'], countInStock: 40, rating: 4.4, numReviews: 98, featured: true, tags: ['fitness', 'tracker', 'health'] },
  { name: 'IKEA POÄNG Armchair', description: 'Classic armchair with birch veneer frame and cushioned seat. Timeless Scandinavian design.', price: 8999, originalPrice: 11999, category: 'Home', brand: 'IKEA', images: ['https://picsum.photos/seed/chair/600/500'], countInStock: 18, rating: 4.3, numReviews: 145, featured: false, tags: ['furniture', 'chair', 'home'] },
  { name: 'MAC Studio Fix Powder', description: 'Full-coverage powder foundation with SPF 15. Matte finish that lasts all day.', price: 2950, originalPrice: 3200, category: 'Beauty', brand: 'MAC', images: ['https://picsum.photos/seed/mac2/600/500'], countInStock: 60, rating: 4.5, numReviews: 287, featured: false, tags: ['makeup', 'powder', 'beauty'] },
];

const ADMIN_USER = { name: 'Admin User', email: 'admin@luxeshop.com', password: 'admin123', isAdmin: true };

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔗 Connected to MongoDB');

  await Product.deleteMany();
  await User.deleteMany();
  await Order.deleteMany();
  console.log('🗑  Cleared existing data');

  const admin = await User.create(ADMIN_USER);
  console.log(`👤 Admin created: ${admin.email}`);

  await Product.insertMany(PRODUCTS);
  console.log(`📦 ${PRODUCTS.length} products seeded`);

  console.log('\n✅ Database seeded successfully!');
  console.log('📧 Admin login: admin@luxeshop.com');
  console.log('🔑 Password: admin123');
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
