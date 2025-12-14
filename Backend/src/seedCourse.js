// const mongoose = require('mongoose');
// const Course = require('./models/Course'); // adjust path
// const Category = require('./models/Category');

// const MONGO_URI = "mongodb+srv://skillUp-Admin:uq3vy0psdZjtDtOv@cluster0.mjaeo8l.mongodb.net/skillUp-db";
// const instructorId = '692a0e3cf5574176e191308b';

// const levels = ['beginner', 'intermediate', 'advanced'];

// async function seedCourses() {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log('Connected to MongoDB');

//         // Fetch all categories
//         const categories = await Category.find();
//         console.log(`Found ${categories.length} categories`);

//         let count = 0;

//         for (let category of categories) {
//             // Generate 1-2 courses per category
//             const numCourses = Math.floor(Math.random() * 2) + 1;
//             for (let i = 1; i <= numCourses; i++) {
//                 const title = `${category.name} Course ${i}`;
//                 const slug = title.toLowerCase().replace(/\s+/g, '-');

//                 const description = `This is a comprehensive ${category.name} course designed to teach you essential skills.`;

//                 const price = Math.floor(Math.random() * 100) + 20; // price between 20-120
//                 const level = levels[Math.floor(Math.random() * levels.length)];

//                 await Course.create({
//                     title,
//                     slug,
//                     description,
//                     price,
//                     level,
//                     status: 'published',
//                     category: category._id,
//                     instructor: instructorId
//                 });

//                 count++;
//                 console.log(`Created course: ${title}`);
//             }
//         }

//         console.log(`Inserted ${count} courses successfully`);
//         mongoose.disconnect();
//     } catch (err) {
//         console.error(err);
//         mongoose.disconnect();
//     }
// }

// seedCourses();
