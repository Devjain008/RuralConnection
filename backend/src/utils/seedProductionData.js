const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Business = require('../models/Business');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Job = require('../models/Job');
const { addProductToTrie } = require('../utils/productTrie');

async function seedProductionData() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('Connected!');

    // 1. Ensure Retailer User exists
    let retailer = await User.findOne({ email: 'retailer@ruralconnect.in' });
    if (!retailer) {
        retailer = await User.create({
            name: 'Ramesh Agro Traders',
            username: 'ramesh_agro',
            email: 'retailer@ruralconnect.in',
            password: 'Password123',
            role: 'retailer',
            phone: '9876543210'
        });
        console.log('Created retailer user');
    }

    // 2. Ensure Business exists with approved status, coordinates and delivery radius
    let business = await Business.findOne({ owner: retailer._id });
    if (!business) {
        business = await Business.create({
            owner: retailer._id,
            businessName: 'Kisan Agro & Seeds Kendra',
            description: 'Premier supplier of certified seeds, organic fertilizers, grains and agri tools.',
            category: 'Agriculture & Fertilizer',
            phone: '9876543210',
            address: { street: 'Station Road, Near Grain Mandi', city: 'Rampur', state: 'Uttar Pradesh', pincode: '244901' },
            location: { type: 'Point', coordinates: [79.02, 28.80] },
            deliveryRadiusKm: 25,
            verificationStatus: 'APPROVED',
            isActive: true
        });
        console.log('Created approved business profile with 25 km delivery radius');
    } else {
        business.verificationStatus = 'APPROVED';
        business.deliveryRadiusKm = 25;
        business.location = { type: 'Point', coordinates: [79.02, 28.80] };
        await business.save();
    }

    // 3. Create Diverse Categories
    const categoryData = [
        { name: 'Grains & Cereals', slug: 'grains-cereals', description: 'Fresh local grains, wheat, rice & pulses', icon: '🌾' },
        { name: 'Seeds & Fertilizers', slug: 'seeds-fertilizers', description: 'Certified seeds, bio-fertilizers & manure', icon: '🌱' },
        { name: 'Farm Tools & Hardware', slug: 'tools-hardware', description: 'Agricultural equipment, hand tools and pumps', icon: '🛠️' },
        { name: 'Dairy & Animal Feed', slug: 'dairy-feed', description: 'Pure desi dairy products and nutritious cattle feed', icon: '🥛' },
        { name: 'Organic & Natural Produce', slug: 'organic-produce', description: 'Chemical-free natural produce, honey and jaggery', icon: '🍯' },
        { name: 'Spices & Edible Oils', slug: 'spices-oils', description: 'Pure mustard oil, turmeric, spices and seeds', icon: '🌶️' }
    ];

    const categoryMap = {};
    for (const c of categoryData) {
        let cat = await Category.findOne({ name: c.name });
        if (!cat) {
            cat = await Category.create(c);
        }
        categoryMap[c.name] = cat._id;
    }
    console.log('Categories synchronized:', Object.keys(categoryMap).length);

    // 4. Seed 25 Diverse Products (if count < 25)
    const currentCount = await Product.countDocuments();
    console.log(`Current products count: ${currentCount}`);

    if (currentCount < 25) {
        const sampleProducts = [
            { name: 'Sharbati Wheat (शरबती गेहूँ)', description: 'Premium grade golden wheat grain harvested from certified fields in Western UP.', cat: 'Grains & Cereals', price: 38, wPrice: 32, moq: 50, stock: 800, pType: 'BOTH' },
            { name: 'Organic Basmati Rice (बासमती चावल)', description: 'Aromatic long-grain basmati rice aged for 1 year, zero chemicals.', cat: 'Grains & Cereals', price: 85, wPrice: 72, moq: 40, stock: 650, pType: 'BOTH' },
            { name: 'Mustard Oil Kachi Ghani (शुद्ध सरसों तेल)', description: 'Cold-pressed traditional wood-press mustard oil with authentic aroma.', cat: 'Spices & Edible Oils', price: 145, wPrice: 130, moq: 20, stock: 300, pType: 'BOTH' },
            { name: 'Certified Mustard Seeds Pusa Bold (सरसों बीज)', description: 'High yield Pusa Bold certified mustard seeds with 42% oil content.', cat: 'Seeds & Fertilizers', price: 120, wPrice: 105, moq: 25, stock: 200, pType: 'BOTH' },
            { name: 'Desi Cow Ghee (शुद्ध देसी गाय का घी)', description: 'Traditional bilona method A2 cow ghee with golden granulated texture.', cat: 'Dairy & Animal Feed', price: 650, wPrice: 580, moq: 10, stock: 95, pType: 'BOTH' },
            { name: 'Organic Vermicompost Fertilizer (केंचुआ खाद)', description: '100% pure organic earthworm compost rich in nitrogen and micronutrients.', cat: 'Seeds & Fertilizers', price: 15, wPrice: 11, moq: 100, stock: 2500, pType: 'BOTH' },
            { name: 'High-Yield Hybrid Maize Seeds (मक्का बीज)', description: 'Drought-resistant high germination hybrid corn seeds for all seasons.', cat: 'Seeds & Fertilizers', price: 90, wPrice: 78, moq: 30, stock: 150, pType: 'BOTH' },
            { name: 'Nutritious Cattle Feed Pellets (पशु आहार चुरी)', description: 'Balanced protein and mineral pellets for enhanced milk yield in milch cattle.', cat: 'Dairy & Animal Feed', price: 35, wPrice: 28, moq: 50, stock: 1200, pType: 'BOTH' },
            { name: 'Traditional Hand Iron Sickle (लोहे की दरांती)', description: 'Forged high-carbon steel sickle with ergonomic hardwood handle for crop harvesting.', cat: 'Farm Tools & Hardware', price: 120, wPrice: 95, moq: 15, stock: 80, pType: 'BOTH' },
            { name: 'Neem Oil Bio-Pesticide (नीम तेल कीटनाशक)', description: 'Pure 10,000 PPM cold-pressed neem seed oil for organic crop insect protection.', cat: 'Seeds & Fertilizers', price: 240, wPrice: 200, moq: 12, stock: 110, pType: 'BOTH' },
            { name: 'Pure Turmeric Powder (शुद्ध देसी हल्दी पाउडर)', description: 'Stone-ground Salem variety turmeric with high curcumin content and medicinal purity.', cat: 'Spices & Edible Oils', price: 180, wPrice: 155, moq: 20, stock: 220, pType: 'BOTH' },
            { name: 'Organic Green Gram / Moong Dal (मूंग दाल)', description: 'Unpolished split green gram directly sourced from organic farmer clusters.', cat: 'Grains & Cereals', price: 110, wPrice: 96, moq: 30, stock: 340, pType: 'BOTH' },
            { name: 'Knapsack Farm Sprayer Pump 16L (स्प्रेयर पंप)', description: 'Durable manual pressure backpack sprayer with brass lance for crop spraying.', cat: 'Farm Tools & Hardware', price: 1250, wPrice: 1050, moq: 5, stock: 45, pType: 'BOTH' },
            { name: 'Solar Portable Farm Lantern (सोलर लालटेन)', description: 'Rechargeable LED solar light with mobile charging port for field night watch.', cat: 'Farm Tools & Hardware', price: 450, wPrice: 380, moq: 10, stock: 60, pType: 'BOTH' },
            { name: 'Drip Irrigation Pipe 100m Roll (ड्रिप पाइप)', description: 'UV stabilized 16mm inline drip lateral pipe with 40cm emitter spacing.', cat: 'Farm Tools & Hardware', price: 850, wPrice: 720, moq: 5, stock: 75, pType: 'BOTH' },
            { name: 'Black Mustard / Rai Seeds (काली राई)', description: 'Cleaned, bold-seeded black mustard for culinary and pickling applications.', cat: 'Spices & Edible Oils', price: 80, wPrice: 68, moq: 25, stock: 180, pType: 'BOTH' },
            { name: 'Organic Desi Jaggery / Gur (देसी गुड़)', description: 'Chemical-free natural sugarcane jaggery blocks with rich molasses sweetness.', cat: 'Organic & Natural Produce', price: 55, wPrice: 46, moq: 40, stock: 420, pType: 'BOTH' },
            { name: 'Brown Chickpeas / Desi Chana (देसी चना)', description: 'High protein unpolished brown gram ideal for sprouts and flour making.', cat: 'Grains & Cereals', price: 75, wPrice: 64, moq: 50, stock: 500, pType: 'BOTH' },
            { name: 'Raw Groundnut Pods (कच्ची मूंगफली)', description: 'Sun-dried fresh groundnut pods with double bold kernels.', cat: 'Grains & Cereals', price: 68, wPrice: 58, moq: 40, stock: 290, pType: 'BOTH' },
            { name: 'Heavy Duty Farm Hoe / Kodali (फावड़ा / कुदाल)', description: 'Reinforced iron blade hoe for tilling, weeding and digging farm soil.', cat: 'Farm Tools & Hardware', price: 280, wPrice: 230, moq: 10, stock: 65, pType: 'BOTH' },
            { name: 'Red Chili Powder Grade-A (लाल मिर्च पाउडर)', description: 'Sun-dried Mathania red chillies ground to vibrant color and medium pungency.', cat: 'Spices & Edible Oils', price: 210, wPrice: 185, moq: 15, stock: 160, pType: 'BOTH' },
            { name: 'Raw Forest Wild Honey (प्राकृतिक शहद)', description: 'Unprocessed natural multifloral raw honey filtered directly from local bee colonies.', cat: 'Organic & Natural Produce', price: 350, wPrice: 300, moq: 10, stock: 85, pType: 'BOTH' },
            { name: 'Pearl Millet / Desi Bajra (देसी बाजरा)', description: 'Nutrient-dense winter bajra grain rich in iron and dietary fiber.', cat: 'Grains & Cereals', price: 32, wPrice: 26, moq: 60, stock: 750, pType: 'BOTH' },
            { name: 'Cow Dung Fertilizer Cakes (गोबर के उपले)', description: 'Sun-dried natural cow dung cakes for organic smoking and bio-enrichment.', cat: 'Organic & Natural Produce', price: 50, wPrice: 38, moq: 20, stock: 300, pType: 'BOTH' },
            { name: 'Waterproof Tarpaulin Sheet 15x12 ft (तिरपाल)', description: 'High-density heavy gauge waterproof sheet for safe grain and crop protection.', cat: 'Farm Tools & Hardware', price: 620, wPrice: 530, moq: 6, stock: 50, pType: 'BOTH' }
        ];

        for (const p of sampleProducts) {
            const exists = await Product.findOne({ name: p.name });
            if (!exists) {
                const doc = await Product.create({
                    name: p.name,
                    description: p.description,
                    category: categoryMap[p.cat] || categoryMap['Grains & Cereals'],
                    price: p.price,
                    wholesalePrice: p.wPrice,
                    minimumWholesaleQuantity: p.moq,
                    stock: p.stock,
                    purchaseType: p.pType,
                    seller: retailer._id,
                    business: business._id,
                    location: business.location,
                    isActive: true
                });
                addProductToTrie(doc);
            }
        }
        console.log('Seeded 25 production-grade products successfully!');
    }

    const finalCount = await Product.countDocuments();
    console.log(`Final total products in database: ${finalCount}`);
    process.exit(0);
}

seedProductionData().catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
});
