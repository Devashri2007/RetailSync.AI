const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Customer = require('../models/Customer');
const CustomerIdentity = require('../models/CustomerIdentity');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Return = require('../models/Return');
const SupportTicket = require('../models/SupportTicket');
const Sale = require('../models/Sale');
const Recommendation = require('../models/Recommendation');
const ActivityLog = require('../models/ActivityLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/retailsync_ai');
    console.log('[MongoDB Connected for Seeder]');
  } catch (err) {
    console.error('Seeder DB Connection Error:', err);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Clearing Existing Collections]...');
    await User.deleteMany();
    await Customer.deleteMany();
    await CustomerIdentity.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Inventory.deleteMany();
    await Return.deleteMany();
    await SupportTicket.deleteMany();
    await Sale.deleteMany();
    await Recommendation.deleteMany();
    await ActivityLog.deleteMany();

    // 1. Create Staff Users for all 5 Roles
    console.log('[Seeding User Accounts]...');
    const demoPassword = 'Password@123';

    const users = await User.create([
      {
        name: 'Sarah Chen (Admin)',
        email: 'admin@retailsync.ai',
        password: demoPassword,
        role: 'admin',
        department: 'Executive Operations',
        phone: '+1 (555) 101-2020',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      },
      {
        name: 'Marcus Vance (Inventory)',
        email: 'inventory@retailsync.ai',
        password: demoPassword,
        role: 'inventory_manager',
        department: 'Supply Chain & Warehousing',
        phone: '+1 (555) 202-3030',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        name: 'Elena Rostova (Sales)',
        email: 'sales@retailsync.ai',
        password: demoPassword,
        role: 'sales_manager',
        department: 'Omnichannel Merchandising',
        phone: '+1 (555) 303-4040',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      {
        name: 'David Kim (Support)',
        email: 'support@retailsync.ai',
        password: demoPassword,
        role: 'support_staff',
        department: 'Customer Experience',
        phone: '+1 (555) 404-5050',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
      {
        name: 'Priya Patel (Analyst)',
        email: 'analyst@retailsync.ai',
        password: demoPassword,
        role: 'analyst',
        department: 'Business Intelligence',
        phone: '+1 (555) 505-6060',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      },
    ]);
    console.log(`Created ${users.length} staff accounts.`);

    // 2. Seed 32 Products across 7 Categories
    console.log('[Seeding Products & Inventory]...');
    const productCatalog = [
      // Electronics
      {
        sku: 'ELEC-101',
        name: 'Aura Wireless Noise-Cancelling Headphones',
        category: 'Electronics',
        price: 189.99,
        costPrice: 85.0,
        stockQuantity: 42,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        supplier: { name: 'SoundCore Dynamics', leadTimeDays: 4 },
        returnRate: 2.8,
        returnRiskLevel: 'Low',
        returnRiskScore: 18,
      },
      {
        sku: 'ELEC-102',
        name: 'Pulse Pro Fitness Smartwatch',
        category: 'Electronics',
        price: 149.5,
        costPrice: 62.0,
        stockQuantity: 8, // Low Stock & Imminent Stockout!
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        supplier: { name: 'BioTech Hardware', leadTimeDays: 6 },
        returnRate: 3.5,
        returnRiskLevel: 'Low',
        returnRiskScore: 22,
      },
      {
        sku: 'ELEC-103',
        name: 'Titanium Fast-Charging MagSafe Dock',
        category: 'Electronics',
        price: 69.99,
        costPrice: 24.5,
        stockQuantity: 65,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600',
        supplier: { name: 'VoltLink Global', leadTimeDays: 3 },
        returnRate: 1.5,
        returnRiskLevel: 'Low',
        returnRiskScore: 12,
      },
      {
        sku: 'ELEC-104',
        name: 'ClearSound Ultra Bluetooth Speaker',
        category: 'Electronics',
        price: 89.0,
        costPrice: 38.0,
        stockQuantity: 5, // Low stock!
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600',
        supplier: { name: 'SoundCore Dynamics', leadTimeDays: 4 },
        returnRate: 4.1,
        returnRiskLevel: 'Medium',
        returnRiskScore: 38,
      },

      // Apparel (Sizing return risks)
      {
        sku: 'APP-201',
        name: 'Merino Wool Minimalist Crewneck Sweater',
        category: 'Apparel',
        price: 120.0,
        costPrice: 45.0,
        stockQuantity: 34,
        lowStockThreshold: 12,
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
        supplier: { name: 'Nordic Knitwear Ltd.', leadTimeDays: 8 },
        returnRate: 9.8, // High return rate due to sizing!
        returnRiskLevel: 'High',
        returnRiskScore: 78,
      },
      {
        sku: 'APP-202',
        name: 'All-Weather Waterproof Technical Parka',
        category: 'Apparel',
        price: 249.0,
        costPrice: 95.0,
        stockQuantity: 18,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600',
        supplier: { name: 'Alpine Outdoor Apparel', leadTimeDays: 7 },
        returnRate: 7.2,
        returnRiskLevel: 'Medium',
        returnRiskScore: 54,
      },
      {
        sku: 'APP-203',
        name: 'Relaxed Fit Linen Resort Shirt',
        category: 'Apparel',
        price: 65.0,
        costPrice: 22.0,
        stockQuantity: 55,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        supplier: { name: 'Breeze Textiles', leadTimeDays: 5 },
        returnRate: 8.5,
        returnRiskLevel: 'High',
        returnRiskScore: 72,
      },
      {
        sku: 'APP-204',
        name: 'Tailored Slim Stretch Chinos',
        category: 'Apparel',
        price: 85.0,
        costPrice: 30.0,
        stockQuantity: 40,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
        supplier: { name: 'Breeze Textiles', leadTimeDays: 5 },
        returnRate: 11.2, // Frequent waist sizing returns!
        returnRiskLevel: 'High',
        returnRiskScore: 84,
      },

      // Footwear
      {
        sku: 'FOOT-301',
        name: 'AeroCloud Engineered Running Shoes',
        category: 'Footwear',
        price: 155.0,
        costPrice: 58.0,
        stockQuantity: 9, // Critical low stock!
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        supplier: { name: 'Strider Sports Lab', leadTimeDays: 7 },
        returnRate: 8.9,
        returnRiskLevel: 'High',
        returnRiskScore: 75,
      },
      {
        sku: 'FOOT-302',
        name: 'Artisan Tuscan Leather Loafers',
        category: 'Footwear',
        price: 195.0,
        costPrice: 80.0,
        stockQuantity: 28,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600',
        supplier: { name: 'Firenze Craft', leadTimeDays: 10 },
        returnRate: 6.4,
        returnRiskLevel: 'Medium',
        returnRiskScore: 48,
      },
      {
        sku: 'FOOT-303',
        name: 'Urban Canvas Low-Top Sneakers',
        category: 'Footwear',
        price: 75.0,
        costPrice: 28.0,
        stockQuantity: 62,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600',
        supplier: { name: 'Strider Sports Lab', leadTimeDays: 5 },
        returnRate: 3.8,
        returnRiskLevel: 'Low',
        returnRiskScore: 28,
      },

      // Home & Living
      {
        sku: 'HOME-401',
        name: 'Nordic Ceramic Drip Coffee Set',
        category: 'Home & Living',
        price: 58.0,
        costPrice: 19.0,
        stockQuantity: 44,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
        supplier: { name: 'Hygge Ceramics', leadTimeDays: 4 },
        returnRate: 2.1,
        returnRiskLevel: 'Low',
        returnRiskScore: 16,
      },
      {
        sku: 'HOME-402',
        name: 'Ultrasonic Essential Oil Aromatherapy Diffuser',
        category: 'Home & Living',
        price: 49.99,
        costPrice: 16.5,
        stockQuantity: 70,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
        supplier: { name: 'Botanica Home', leadTimeDays: 3 },
        returnRate: 3.0,
        returnRiskLevel: 'Low',
        returnRiskScore: 20,
      },
      {
        sku: 'HOME-403',
        name: 'Ergonomic Memory Foam Lumbar Cushion',
        category: 'Home & Living',
        price: 45.0,
        costPrice: 15.0,
        stockQuantity: 38,
        lowStockThreshold: 12,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
        supplier: { name: 'ErgoComfort Inc.', leadTimeDays: 4 },
        returnRate: 4.8,
        returnRiskLevel: 'Medium',
        returnRiskScore: 36,
      },
      {
        sku: 'HOME-404',
        name: 'Weighted Bamboo Cooling Blanket',
        category: 'Home & Living',
        price: 119.0,
        costPrice: 48.0,
        stockQuantity: 6, // Low Stock!
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
        supplier: { name: 'Botanica Home', leadTimeDays: 6 },
        returnRate: 5.5,
        returnRiskLevel: 'Medium',
        returnRiskScore: 42,
      },

      // Beauty & Personal Care
      {
        sku: 'BEAUTY-501',
        name: 'Botanical Hyaluronic Acid Hydrating Serum',
        category: 'Beauty',
        price: 42.0,
        costPrice: 11.0,
        stockQuantity: 88,
        lowStockThreshold: 25,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        supplier: { name: 'DermaPure Organics', leadTimeDays: 3 },
        returnRate: 1.2,
        returnRiskLevel: 'Low',
        returnRiskScore: 10,
      },
      {
        sku: 'BEAUTY-502',
        name: 'Antioxidant Vitamin C Glow Moisturizer',
        category: 'Beauty',
        price: 38.0,
        costPrice: 9.5,
        stockQuantity: 95,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600',
        supplier: { name: 'DermaPure Organics', leadTimeDays: 3 },
        returnRate: 1.8,
        returnRiskLevel: 'Low',
        returnRiskScore: 14,
      },
      {
        sku: 'BEAUTY-503',
        name: 'Sonic Cleansing Facial Massage Wand',
        category: 'Beauty',
        price: 79.0,
        costPrice: 26.0,
        stockQuantity: 30,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
        supplier: { name: 'GlowTech Beauty', leadTimeDays: 5 },
        returnRate: 4.5,
        returnRiskLevel: 'Medium',
        returnRiskScore: 35,
      },

      // Accessories
      {
        sku: 'ACC-601',
        name: 'Full-Grain Leather Minimalist Cardholder',
        category: 'Accessories',
        price: 48.0,
        costPrice: 15.0,
        stockQuantity: 80,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
        supplier: { name: 'Crafted Goods Co.', leadTimeDays: 4 },
        returnRate: 1.4,
        returnRiskLevel: 'Low',
        returnRiskScore: 11,
      },
      {
        sku: 'ACC-602',
        name: 'Polarized Aviator Sunglasses (Titanium)',
        category: 'Accessories',
        price: 135.0,
        costPrice: 42.0,
        stockQuantity: 24,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600',
        supplier: { name: 'OpticShade Studios', leadTimeDays: 5 },
        returnRate: 6.8,
        returnRiskLevel: 'Medium',
        returnRiskScore: 52,
      },
      {
        sku: 'ACC-603',
        name: 'Waterproof Commuter Backpack (25L)',
        category: 'Accessories',
        price: 110.0,
        costPrice: 38.0,
        stockQuantity: 45,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
        supplier: { name: 'Crafted Goods Co.', leadTimeDays: 4 },
        returnRate: 2.9,
        returnRiskLevel: 'Low',
        returnRiskScore: 21,
      },

      // Sports & Outdoors
      {
        sku: 'SPORT-701',
        name: 'Pro Grip Non-Slip Natural Rubber Yoga Mat',
        category: 'Sports & Outdoors',
        price: 68.0,
        costPrice: 21.0,
        stockQuantity: 50,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600',
        supplier: { name: 'Zenith Athletics', leadTimeDays: 4 },
        returnRate: 2.4,
        returnRiskLevel: 'Low',
        returnRiskScore: 18,
      },
      {
        sku: 'SPORT-702',
        name: 'Insulated Stainless Steel Sport Bottle (1L)',
        category: 'Sports & Outdoors',
        price: 34.99,
        costPrice: 10.5,
        stockQuantity: 110,
        lowStockThreshold: 30,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
        supplier: { name: 'Zenith Athletics', leadTimeDays: 3 },
        returnRate: 1.1,
        returnRiskLevel: 'Low',
        returnRiskScore: 9,
      },
      {
        sku: 'SPORT-703',
        name: 'Speed Rope Ball-Bearing Jump Rope',
        category: 'Sports & Outdoors',
        price: 24.5,
        costPrice: 6.5,
        stockQuantity: 90,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
        supplier: { name: 'Zenith Athletics', leadTimeDays: 3 },
        returnRate: 1.6,
        returnRiskLevel: 'Low',
        returnRiskScore: 12,
      },
      {
        sku: 'ELEC-105',
        name: '4K Ultra HD Dual Dash Camera',
        category: 'Electronics',
        price: 129.99,
        costPrice: 52.0,
        stockQuantity: 28,
        lowStockThreshold: 12,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600',
        supplier: { name: 'VoltLink Global', leadTimeDays: 4 },
        returnRate: 3.2,
        returnRiskLevel: 'Low',
        returnRiskScore: 24,
      },
      {
        sku: 'ELEC-106',
        name: 'Apex Pro Mechanical Gaming Keyboard',
        category: 'Electronics',
        price: 119.0,
        costPrice: 48.0,
        stockQuantity: 7, // Low Stock alert!
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
        supplier: { name: 'BioTech Hardware', leadTimeDays: 5 },
        returnRate: 4.0,
        returnRiskLevel: 'Medium',
        returnRiskScore: 35,
      },
      {
        sku: 'APP-205',
        name: 'Thermal Sherpa Quarter-Zip Pullover',
        category: 'Apparel',
        price: 78.0,
        costPrice: 28.0,
        stockQuantity: 32,
        lowStockThreshold: 12,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
        supplier: { name: 'Nordic Knitwear Ltd.', leadTimeDays: 7 },
        returnRate: 9.1,
        returnRiskLevel: 'High',
        returnRiskScore: 76,
      },
      {
        sku: 'FOOT-304',
        name: 'TrailGrip Waterproof Mountain Hiking Boots',
        category: 'Footwear',
        price: 175.0,
        costPrice: 68.0,
        stockQuantity: 19,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600',
        supplier: { name: 'Strider Sports Lab', leadTimeDays: 8 },
        returnRate: 6.2,
        returnRiskLevel: 'Medium',
        returnRiskScore: 49,
      },
      {
        sku: 'HOME-405',
        name: 'Artisan Cast Iron Pre-Seasoned Skillet (12-inch)',
        category: 'Home & Living',
        price: 49.0,
        costPrice: 17.5,
        stockQuantity: 52,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600',
        supplier: { name: 'Hygge Ceramics', leadTimeDays: 5 },
        returnRate: 1.8,
        returnRiskLevel: 'Low',
        returnRiskScore: 14,
      },
      {
        sku: 'BEAUTY-504',
        name: 'Peptide Renewal Firming Eye Cream',
        category: 'Beauty',
        price: 54.0,
        costPrice: 14.0,
        stockQuantity: 64,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
        supplier: { name: 'DermaPure Organics', leadTimeDays: 3 },
        returnRate: 2.0,
        returnRiskLevel: 'Low',
        returnRiskScore: 16,
      },
      {
        sku: 'ACC-604',
        name: 'RFID-Blocking Travel Passport Wallet & Organizer',
        category: 'Accessories',
        price: 36.0,
        costPrice: 10.0,
        stockQuantity: 75,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
        supplier: { name: 'Crafted Goods Co.', leadTimeDays: 4 },
        returnRate: 1.5,
        returnRiskLevel: 'Low',
        returnRiskScore: 12,
      },
      {
        sku: 'SPORT-704',
        name: 'Adjustable Quick-Select Dumbbell Set',
        category: 'Sports & Outdoors',
        price: 169.0,
        costPrice: 65.0,
        stockQuantity: 11, // low stock!
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600',
        supplier: { name: 'Zenith Athletics', leadTimeDays: 6 },
        returnRate: 3.5,
        returnRiskLevel: 'Low',
        returnRiskScore: 24,
      },
    ];

    const createdProducts = [];
    for (const prodData of productCatalog) {
      // Calculate demand forecasts based on product popularity
      const avgDaily = prodData.category === 'Electronics' ? 3.5 : prodData.category === 'Apparel' ? 4.2 : 2.8;
      const demand7d = Math.round(avgDaily * 7);
      const demand15d = Math.round(avgDaily * 15);
      const demand30d = Math.round(avgDaily * 30);

      const daysUntilStockout = prodData.stockQuantity <= 10 ? Math.max(1, Math.floor(prodData.stockQuantity / avgDaily)) : null;

      const product = await Product.create({
        ...prodData,
        predictedDemand7d: demand7d,
        predictedDemand15d: demand15d,
        predictedDemand30d: demand30d,
        predictedStockoutDays: daysUntilStockout,
        recommendedRestockQty: daysUntilStockout ? Math.round(demand30d * 1.3) : 0,
      });

      createdProducts.push(product);

      // Create corresponding inventory record
      await Inventory.create({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        currentStock: product.stockQuantity,
        availableStock: product.stockQuantity,
        reorderPoint: product.lowStockThreshold,
        reorderQuantity: 60,
        predictedStockoutDays: daysUntilStockout,
        predictedDemand7d: demand7d,
        predictedDemand15d: demand15d,
        predictedDemand30d: demand30d,
        recommendedRestockQty: daysUntilStockout ? Math.round(demand30d * 1.3) : 0,
        supplierName: prodData.supplier.name,
        supplierLeadTime: prodData.supplier.leadTimeDays,
      });
    }
    console.log(`Created ${createdProducts.length} products and inventory records.`);

    // 3. Seed 110 Realistic Customers across Web, Mobile, and Store
    // Including deliberate cross-channel duplicate identities to demonstrate Unified Identity Engine
    console.log('[Seeding Customers & Cross-Channel Duplicate Identities]...');

    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
      'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
      'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
      'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
      'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
      'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
      'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
      'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
      'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    ];

    const cities = [
      { city: 'New York', state: 'NY', zip: '10001' },
      { city: 'Los Angeles', state: 'CA', zip: '90001' },
      { city: 'Chicago', state: 'IL', zip: '60601' },
      { city: 'Houston', state: 'TX', zip: '77001' },
      { city: 'Phoenix', state: 'AZ', zip: '85001' },
      { city: 'Philadelphia', state: 'PA', zip: '19101' },
      { city: 'San Antonio', state: 'TX', zip: '78201' },
      { city: 'San Diego', state: 'CA', zip: '92101' },
      { city: 'Dallas', state: 'TX', zip: '75201' },
      { city: 'Seattle', state: 'WA', zip: '98101' },
    ];

    const createdCustomers = [];

    // First: Create 5 intentional duplicate pairs across channels for demonstration:
    // Pair 1: Jonathan Miller (web) vs Johnathan Miller (store) - matching phone, fuzzy name
    // Pair 2: Katherine Smith (mobile) vs Kathryn Smith (web) - matching email, fuzzy name
    // Pair 3: Marcus Vance (store) vs Mark Vance (mobile) - matching phone & zip
    // Pair 4: Elizabeth Taylor (web) vs Liz Taylor (store) - matching email prefix
    // Pair 5: Alexander Wright (mobile) vs Alex Wright (web) - matching phone
    const duplicatePairsConfig = [
      {
        p1: { first: 'Jonathan', last: 'Miller', email: 'jmiller.retail@gmail.com', phone: '555-849-2041', channel: 'web', city: 'Seattle', state: 'WA', zip: '98101' },
        p2: { first: 'Johnathan', last: 'Miller', email: 'johnathan.miller99@yahoo.com', phone: '555-849-2041', channel: 'store', city: 'Seattle', state: 'WA', zip: '98101' },
      },
      {
        p1: { first: 'Katherine', last: 'Smith', email: 'kathy.smith@outlook.com', phone: '555-912-3344', channel: 'mobile', city: 'Chicago', state: 'IL', zip: '60601' },
        p2: { first: 'Kathryn', last: 'Smith', email: 'kathy.smith@outlook.com', phone: '555-912-8822', channel: 'web', city: 'Chicago', state: 'IL', zip: '60601' },
      },
      {
        p1: { first: 'Marcus', last: 'Vance', email: 'm.vance@techcorp.io', phone: '555-334-1199', channel: 'store', city: 'New York', state: 'NY', zip: '10001' },
        p2: { first: 'Mark', last: 'Vance', email: 'mark.vance.ny@gmail.com', phone: '555-334-1199', channel: 'mobile', city: 'New York', state: 'NY', zip: '10001' },
      },
      {
        p1: { first: 'Elizabeth', last: 'Taylor', email: 'liz.taylor@domain.org', phone: '555-772-9011', channel: 'web', city: 'Los Angeles', state: 'CA', zip: '90001' },
        p2: { first: 'Liz', last: 'Taylor', email: 'liz.taylor@domain.org', phone: '555-772-9011', channel: 'store', city: 'Los Angeles', state: 'CA', zip: '90001' },
      },
      {
        p1: { first: 'Alexander', last: 'Wright', email: 'alex.wright92@gmail.com', phone: '555-661-8840', channel: 'mobile', city: 'Houston', state: 'TX', zip: '77001' },
        p2: { first: 'Alex', last: 'Wright', email: 'awright.houston@hotmail.com', phone: '555-661-8840', channel: 'web', city: 'Houston', state: 'TX', zip: '77001' },
      },
    ];

    let custIndex = 1001;

    for (const pair of duplicatePairsConfig) {
      const c1 = await Customer.create({
        unifiedCustomerId: `CUST-${custIndex++}`,
        firstName: pair.p1.first,
        lastName: pair.p1.last,
        email: pair.p1.email,
        phone: pair.p1.phone,
        channel: pair.p1.channel,
        segment: 'Loyal',
        totalSpent: 420.5,
        orderCount: 4,
        avgOrderValue: 105.12,
        lastPurchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        churnRiskScore: 22,
        churnRiskLevel: 'Low',
        address: { street: '124 Market St', city: pair.p1.city, state: pair.p1.state, zipCode: pair.p1.zip },
      });
      createdCustomers.push(c1);

      const c2 = await Customer.create({
        unifiedCustomerId: `CUST-${custIndex++}`,
        firstName: pair.p2.first,
        lastName: pair.p2.last,
        email: pair.p2.email,
        phone: pair.p2.phone,
        channel: pair.p2.channel,
        segment: 'Occasional',
        totalSpent: 185.0,
        orderCount: 2,
        avgOrderValue: 92.5,
        lastPurchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        churnRiskScore: 48,
        churnRiskLevel: 'Medium',
        address: { street: '124 Market St Apt 2', city: pair.p2.city, state: pair.p2.state, zipCode: pair.p2.zip },
      });
      createdCustomers.push(c2);
    }

    // Now generate remaining customers to reach ~105 total
    const channels = ['web', 'mobile', 'store'];
    const segments = ['VIP', 'Loyal', 'At-Risk', 'Occasional', 'New'];

    for (let i = 0; i < 95; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i * 3) % lastNames.length];
      const loc = cities[i % cities.length];
      const ch = channels[i % channels.length];
      const seg = segments[i % segments.length];

      // Simulate churn profile
      const isAtRisk = seg === 'At-Risk';
      const daysAgo = isAtRisk ? 65 + (i % 40) : (i % 30) + 2;
      const churnScore = isAtRisk ? 72 + (i % 24) : seg === 'VIP' ? 12 : 25 + (i % 25);
      const churnLevel = churnScore >= 65 ? 'High' : churnScore >= 35 ? 'Medium' : 'Low';

      const orderCount = isAtRisk ? 3 : seg === 'VIP' ? 12 + (i % 8) : (i % 6) + 1;
      const avgOrder = 60 + (i % 120);
      const totalSpent = Number((orderCount * avgOrder).toFixed(2));

      const customer = await Customer.create({
        unifiedCustomerId: `CUST-${custIndex++}`,
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 10}@example.com`,
        phone: `+1 (555) ${100 + (i % 800)}-${1000 + i}`,
        channel: ch,
        segment: seg,
        totalSpent,
        orderCount,
        avgOrderValue: avgOrder,
        lastPurchaseDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        churnRiskScore: churnScore,
        churnRiskLevel: churnLevel,
        address: {
          street: `${100 + i * 4} Grand Avenue`,
          city: loc.city,
          state: loc.state,
          zipCode: loc.zip,
          country: 'USA',
        },
      });
      createdCustomers.push(customer);
    }
    console.log(`Created ${createdCustomers.length} total customers.`);

    // 4. Seed Historical Orders and Sales Facts
    console.log('[Seeding Orders & Sales Records]...');
    const createdOrders = [];
    let orderNum = 84000;

    for (let i = 0; i < 160; i++) {
      const customer = createdCustomers[i % createdCustomers.length];
      const daysBack = (i % 60) + 1;
      const orderDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      // Select 1 to 3 items
      const item1 = createdProducts[i % createdProducts.length];
      const item2 = createdProducts[(i + 5) % createdProducts.length];

      const qty1 = (i % 2) + 1;
      const qty2 = 1;

      const items = [
        {
          product: item1._id,
          productName: item1.name,
          sku: item1.sku,
          quantity: qty1,
          unitPrice: item1.price,
          totalPrice: Number((item1.price * qty1).toFixed(2)),
          returned: false,
        },
      ];

      if (i % 3 === 0) {
        items.push({
          product: item2._id,
          productName: item2.name,
          sku: item2.sku,
          quantity: qty2,
          unitPrice: item2.price,
          totalPrice: Number((item2.price * qty2).toFixed(2)),
          returned: false,
        });
      }

      const totalAmt = items.reduce((acc, it) => acc + it.totalPrice, 0);
      const taxAmt = Number((totalAmt * 0.08).toFixed(2));
      const finalAmt = Number((totalAmt + taxAmt).toFixed(2));

      const isReturnedOrder = i % 12 === 0; // generate some returned orders

      const order = await Order.create({
        orderNumber: `ORD-${orderNum++}`,
        customer: customer._id,
        unifiedCustomerId: customer.unifiedCustomerId,
        channel: customer.channel,
        items,
        totalAmount: totalAmt,
        taxAmount: taxAmt,
        finalAmount: finalAmt,
        paymentMethod: i % 2 === 0 ? 'Credit Card' : 'UPI',
        orderStatus: isReturnedOrder ? 'Returned' : 'Delivered',
        predictedReturnRisk: item1.returnRiskLevel || 'Low',
        returnRiskScore: item1.returnRiskScore || 20,
        shippingAddress: customer.address,
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      createdOrders.push(order);

      // Create Sales Fact
      for (const item of items) {
        await Sale.create({
          order: order._id,
          orderNumber: order.orderNumber,
          date: orderDate,
          channel: order.channel,
          category: item1.category,
          product: item.product,
          productName: item.productName,
          unitsSold: item.quantity,
          revenue: item.totalPrice,
          cost: Number((item.totalPrice * 0.45).toFixed(2)),
          grossProfit: Number((item.totalPrice * 0.55).toFixed(2)),
        });
      }
    }
    console.log(`Created ${createdOrders.length} orders & sales data.`);

    // 5. Seed Product Returns
    console.log('[Seeding Returns with Profit Impact]...');
    const returnReasons = [
      'Sizing Issues',
      'Defective / Quality',
      'Item Not As Described',
      'Changed Mind',
      'Late Delivery',
    ];

    let retCount = 501;
    for (let i = 0; i < 24; i++) {
      const order = createdOrders[i * 6];
      if (!order || !order.items[0]) continue;

      const item = order.items[0];
      const product = createdProducts.find((p) => p._id.toString() === item.product.toString());
      const reason = product?.category === 'Apparel' || product?.category === 'Footwear'
        ? 'Sizing Issues'
        : returnReasons[i % returnReasons.length];

      const refundAmount = item.totalPrice;
      const impactOnMargin = Number((refundAmount + 14.5).toFixed(2));

      await Return.create({
        returnNumber: `RET-${retCount++}`,
        order: order._id,
        product: item.product,
        productName: item.productName,
        sku: item.sku,
        customer: order.customer,
        unifiedCustomerId: order.unifiedCustomerId,
        channel: order.channel,
        quantity: item.quantity,
        reason,
        reasonDetails:
          reason === 'Sizing Issues'
            ? 'Garment ran substantially smaller than usual sizing specifications.'
            : 'Product arrived damaged or failed initial quality check.',
        refundAmount,
        impactOnMargin,
        refundStatus: i % 3 === 0 ? 'Approved' : i % 3 === 1 ? 'Processed' : 'Pending',
        predictedReturnRisk: product?.returnRiskLevel || 'Medium',
        recommendedAction:
          reason === 'Sizing Issues'
            ? `Update size chart and fit notes for ${item.productName}`
            : 'Inspect supplier batch for manufacturing defects',
        createdAt: new Date(Date.now() - (i * 2 + 1) * 24 * 60 * 60 * 1000),
      });
    }
    console.log('Created product return records.');

    // 6. Seed Support Tickets with Sentiments and Churn Signals
    console.log('[Seeding Support Tickets & Churn Signals]...');
    const ticketSubjects = [
      {
        sub: 'Order significantly delayed beyond promised delivery date',
        desc: 'I ordered this 12 days ago and tracking is completely stuck. I am very frustrated and reconsidering purchasing again.',
        cat: 'Delivery Delay',
        prio: 'High',
        sent: 'Frustrated',
        churnSignal: true,
      },
      {
        sub: 'Sweater does not match sizing guide at all',
        desc: 'I ordered size Large based on your chart and it fits like a Small. Disappointed with the sizing inconsistency.',
        cat: 'Product Complaint',
        prio: 'Medium',
        sent: 'Negative',
        churnSignal: true,
      },
      {
        sub: 'Inquiry regarding corporate discount eligibility',
        desc: 'We are looking to purchase 40 noise-cancelling headphones for our design studio. Please connect us with sales.',
        cat: 'General Inquiry',
        prio: 'Low',
        sent: 'Positive',
        churnSignal: false,
      },
      {
        sub: 'Refund still pending after 8 business days',
        desc: 'I returned the items two weeks ago and have received zero update. This is unacceptable customer service.',
        cat: 'Refund Inquiry',
        prio: 'Urgent',
        sent: 'Frustrated',
        churnSignal: true,
      },
      {
        sub: 'Great experience with mobile app checkout!',
        desc: 'Just wanted to thank your tech team, the new in-store pickup barcode scanner works seamlessly.',
        cat: 'General Inquiry',
        prio: 'Low',
        sent: 'Positive',
        churnSignal: false,
      },
    ];

    let tckNum = 701;
    for (let i = 0; i < 30; i++) {
      const template = ticketSubjects[i % ticketSubjects.length];
      const customer = createdCustomers[i % 40];

      await SupportTicket.create({
        ticketNumber: `TCK-${tckNum++}`,
        customer: customer._id,
        unifiedCustomerId: customer.unifiedCustomerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        channel: customer.channel,
        subject: template.sub,
        description: template.desc,
        category: template.cat,
        priority: template.prio,
        status: i % 4 === 0 ? 'Resolved' : i % 4 === 1 ? 'In Progress' : 'Open',
        sentiment: template.sent,
        sentimentScore: template.sent === 'Frustrated' ? -0.85 : template.sent === 'Negative' ? -0.45 : 0.75,
        churnSignalTriggered: template.churnSignal,
        churnRiskLevel: template.churnSignal ? 'High' : 'Low',
        assignedStaffName: users[3].name, // David Kim
        assignedTo: users[3]._id,
        createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
      });
    }
    console.log('Created customer support tickets.');

    // 7. Seed Initial Action Center Recommendations
    console.log('[Seeding AI Business Action Center Items]...');
    await Recommendation.create([
      {
        title: 'Imminent Stockout Risk: Pulse Pro Fitness Smartwatch',
        description: 'Stock has depleted to 8 units. Predicted 7-day demand is 28 units with lead time of 6 days.',
        category: 'Restock',
        relatedEntityType: 'Product',
        relatedEntityId: createdProducts[1]._id.toString(),
        relatedEntityName: createdProducts[1].name,
        priority: 'Critical',
        evidence: 'Run-rate: 4 units/day. Out of stock in approx 2 days.',
        suggestedAction: 'Issue Purchase Order for 75 units to BioTech Hardware immediately.',
        status: 'Pending',
      },
      {
        title: 'Critical Churn Alert: High-LTV Customer Inactive & Frustrated',
        description: 'VIP Customer with lifetime value $1,420 has not ordered in 75 days and filed a frustrated ticket.',
        category: 'Retention',
        relatedEntityType: 'Customer',
        relatedEntityId: createdCustomers[10]._id.toString(),
        relatedEntityName: `${createdCustomers[10].firstName} ${createdCustomers[10].lastName}`,
        priority: 'Critical',
        evidence: 'Churn risk probability: 84%. Sentiment: Frustrated. Delivery dispute unresolved.',
        suggestedAction: 'Assign Senior Experience Lead, waive shipping fee, and grant $50 store credit.',
        status: 'Pending',
      },
      {
        title: 'Return Margin Protection: Tailored Slim Stretch Chinos',
        description: 'Product return rate is 11.2%, generating $380 in reverse logistics margin loss this month.',
        category: 'Quality Remediation',
        relatedEntityType: 'Product',
        relatedEntityId: createdProducts[7]._id.toString(),
        relatedEntityName: createdProducts[7].name,
        priority: 'High',
        evidence: '82% of return comments cite tight waist sizing inconsistent with size guide.',
        suggestedAction: 'Update product sizing specs, add fit recommendation badge on product page, and alert production.',
        status: 'In Progress',
      },
      {
        title: 'Cross-Channel Identity Merge Recommended',
        description: 'Identical phone and fuzzy name similarity (92%) detected across Web and Physical Store profiles.',
        category: 'Retention',
        relatedEntityType: 'Customer',
        relatedEntityId: createdCustomers[0]._id.toString(),
        relatedEntityName: `${createdCustomers[0].firstName} ${createdCustomers[0].lastName}`,
        priority: 'Medium',
        evidence: 'Same phone number 555-849-2041 with Jonathan Miller (Web) and Johnathan Miller (Store).',
        suggestedAction: 'Approve identity merge in Unified Identity Engine to combine historical purchases and LTV.',
        status: 'Pending',
      },
    ]);
    console.log('Created AI Action Center recommendations.');

    console.log('----------------------------------------------------');
    console.log('[DATABASE SEEDING COMPLETED SUCCESSFULLY!]');
    console.log(`Users: ${users.length} | Products: ${createdProducts.length} | Customers: ${createdCustomers.length} | Orders: ${createdOrders.length}`);
    console.log('Login credentials for demo:');
    console.log('  Admin:             admin@retailsync.ai / Password@123');
    console.log('  Inventory Manager: inventory@retailsync.ai / Password@123');
    console.log('  Sales Manager:     sales@retailsync.ai / Password@123');
    console.log('  Support Staff:     support@retailsync.ai / Password@123');
    console.log('  Business Analyst:  analyst@retailsync.ai / Password@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
