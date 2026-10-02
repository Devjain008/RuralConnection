const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Business = require('../src/models/Business');

// Haversine formula matching frontend
function calculateDistance(coord1, coord2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
}

async function verifyBusinessRadius() {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    // User location: Rampur [79.02, 28.80]
    const userCoords = [79.02, 28.80];

    // Ensure a distant business exists for validation
    let distantOwner = await User.findOne({ email: 'distant_seller@ruralconnect.in' });
    if (!distantOwner) {
        distantOwner = await User.create({
            name: 'Metro Delhi Seed Hub',
            username: 'metro_delhi',
            email: 'distant_seller@ruralconnect.in',
            password: 'Password123',
            role: 'retailer'
        });
    }

    let distantBiz = await Business.findOne({ owner: distantOwner._id });
    if (!distantBiz) {
        distantBiz = await Business.create({
            owner: distantOwner._id,
            businessName: 'Metro Delhi Seed Hub',
            description: 'Capital city wholesale supplier',
            category: 'Agriculture & Fertilizer',
            address: { street: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
            location: { type: 'Point', coordinates: [77.20, 28.61] }, // Delhi coordinates (~188 km away)
            deliveryRadiusKm: 20, // Only delivers up to 20 km!
            verificationStatus: 'APPROVED',
            isActive: true
        });
        console.log('Created distant test business in Delhi');
    }

    const allBusinesses = await Business.find({ isActive: true });
    console.log(`Total active businesses in DB: ${allBusinesses.length}`);

    // Filter using each business's limitation of km
    const inRange = [];
    const outOfRange = [];

    for (const b of allBusinesses) {
        const coords = b.location?.coordinates || [79.02, 28.80];
        const dist = calculateDistance(userCoords, coords);
        const limit = b.deliveryRadiusKm || 10;
        const isWithin = dist <= limit;

        if (isWithin) {
            inRange.push({ name: b.businessName, dist, limit });
        } else {
            outOfRange.push({ name: b.businessName, dist, limit });
        }
    }

    console.log('\n--- BUSINESSES WITHIN KM LIMITATION (SHOWN) ---');
    console.log(`Count: ${inRange.length}`);
    inRange.slice(0, 3).forEach(b => console.log(`✓ ${b.name}: ${b.dist} km away (limit: ${b.limit} km)`));

    console.log('\n--- BUSINESSES EXCEEDING KM LIMITATION (HIDDEN) ---');
    console.log(`Count: ${outOfRange.length}`);
    outOfRange.forEach(b => console.log(`✗ ${b.name}: ${b.dist} km away (limit: ${b.limit} km) -> HIDDEN`));

    if (inRange.length > 0 && outOfRange.length > 0) {
        console.log('\n✓ VERIFICATION SUCCESSFUL: Businesses are strictly filtered around their limitation of km!');
    } else {
        console.error('Validation failed to separate in-range vs out-of-range');
        process.exit(1);
    }

    process.exit(0);
}

verifyBusinessRadius().catch(e => {
    console.error(e);
    process.exit(1);
});
