const db = require('../config/db');
const { uploadImage } = require('../utils/cloudinary');
const bcrypt = require('bcryptjs');

// Constants
const USER_COUNT = 30; // Number of users to seed
const INDIAN_NAMES_MALE = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Reyansh', 'Vivaan', 'Krishna', 'Ishaan', 'Shaurya'];
const INDIAN_NAMES_FEMALE = ['Aadhya', 'Diya', 'Saanvi', 'Ananya', 'Kiara', 'Pari', 'Riya', 'Anvi', 'Myra', 'Ira'];
const BIOS = [
    "Coffee lover & bibliophile ☕📚",
    "Looking for my traveling partner ✈️",
    "Foodie at heart. Let's get tacos! 🌮",
    "Tech geek and gamer 🎮",
    "Just here for the vibes ✨",
    "Sapiosexual. Impress me with your mind 🧠",
    "Dog mom 🐶",
    "Gym rat 💪",
    "Artist & Dreamer 🎨",
    "Software Engineer by day, DJ by night 🎧"
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
    console.log('🌱 Starting Seeding Process...');

    try {
        // 1. Create Users
        const users = [];
        // Base location: New Delhi (28.6139, 77.2090)
        // We will scatter users around this point
        const BASE_LAT = 28.6139;
        const BASE_LONG = 77.2090;

        for (let i = 0; i < USER_COUNT; i++) {
            const isMale = Math.random() > 0.5;
            const firstName = isMale ? getRandom(INDIAN_NAMES_MALE) : getRandom(INDIAN_NAMES_FEMALE);
            const lastName = "Kumar"; // Placeholder
            const gender = isMale ? 'Man' : 'Woman';
            const lookingFor = isMale ? 'Woman' : 'Man';
            const mobile = `9${getRandomInt(100000000, 999999999)}`;

            // Random Location within ~50km
            // 1 deg lat ~ 111km. 0.5 deg ~ 55km.
            const lat = BASE_LAT + (Math.random() - 0.5);
            const long = BASE_LONG + (Math.random() - 0.5);

            // DOB: 18 to 35
            const age = getRandomInt(18, 35);
            const dobYear = new Date().getFullYear() - age;
            const dob = `${dobYear}-${getRandomInt(1, 12)}-${getRandomInt(1, 28)}`;

            const query = `
                INSERT INTO users (
                    mobile_number, first_name, last_name, date_of_birth, gender, 
                    relationship_goals, lifestyle, bio, latitude, longitude, 
                    gender_preference, is_profile_completed
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
                ON CONFLICT (mobile_number) DO NOTHING
                RETURNING id, first_name, gender;
            `;

            const values = [
                mobile, firstName, lastName, dob, gender,
                'Long-term', JSON.stringify(['Travel', 'Food']), getRandom(BIOS),
                lat, long, lookingFor
            ];

            const res = await db.query(query, values);
            if (res.rows[0]) {
                users.push(res.rows[0]);
                console.log(`Created user: ${firstName} (${gender})`);
            }
        }

        console.log(`✅ Created ${users.length} users.`);

        // 2. Add Photos
        // Using Lorem Picsum or Unsplash source
        for (const user of users) {
            const photoCount = getRandomInt(2, 4);
            // Gender specific keywords? Unsplash source allows keywords
            const keyword = user.gender === 'Man' ? 'man' : 'woman';

            for (let j = 0; j < photoCount; j++) {
                // Determine source
                const rand = Math.floor(Math.random() * 1000);
                // We use unsplash source URL which redirects to a real image
                // In a real seed with Cloudinary, we'd fetch this, get buffer, upload.
                // Our mock Cloudinary util will just pass this URL through if no creds.
                // To get unique images, we append a random query param or sig
                const imageUrl = `https://randomuser.me/api/portraits/${user.gender === 'Man' ? 'men' : 'women'}/${getRandomInt(1, 90)}.jpg`;

                // Upload (or Mock Upload)
                const uploaded = await uploadImage(imageUrl);

                await db.query(`
                    INSERT INTO user_photos (user_id, url, is_primary)
                    VALUES ($1, $2, $3)
                `, [user.id, uploaded.secure_url, j === 0]);
            }
        }
        console.log('✅ Added Photos.');

        // 3. Generate Swipes & Matches (Optional but good for testing)
        // Let's make user[0] match with user[1]
        if (users.length > 1) {
            const u1 = users[0];
            const u2 = users[1];

            // Swipe Right on each other
            await db.query(`INSERT INTO swipes (swiper_id, swiped_id, action) VALUES ($1, $2, 'like')`, [u1.id, u2.id]);
            await db.query(`INSERT INTO swipes (swiper_id, swiped_id, action) VALUES ($1, $2, 'like')`, [u2.id, u1.id]);

            // Create Match
            const minId = Math.min(u1.id, u2.id);
            const maxId = Math.max(u1.id, u2.id);
            await db.query(`INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2)`, [minId, maxId]);
            console.log(`✅ Created Match between ${u1.first_name} and ${u2.first_name}`);
        }

    } catch (err) {
        console.error('Seeding Error:', err);
    } finally {
        process.exit();
    }
};

seed();
