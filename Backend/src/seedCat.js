// const mongoose = require("mongoose");
// const Category = require("./models/Category");

// // 1️⃣ Your MongoDB URL
// const MONGO_URI = "mongodb+srv://skillUp-Admin:uq3vy0psdZjtDtOv@cluster0.mjaeo8l.mongodb.net/skillUp-db";

// const categories = [
//     {
//         name: "Programming",
//         children: [
//             "Web Development",
//             "Mobile Development",
//             "Programming Languages",
//             "DevOps",
//             "Software Testing",
//             "Data Science",
//             "Frontend Development",
//             "Backend Development"
//         ]
//     },
//     {
//         name: "Business",
//         children: [
//             "Entrepreneurship",
//             "Project Management",
//             "Sales & Marketing",
//             "Finance & Accounting"
//         ]
//     },
//     {
//         name: "IT & Software",
//         children: [
//             "Cybersecurity",
//             "Networking",
//             "Cloud Computing",
//             "Blockchain"
//         ]
//     },
//     {
//         name: "Design",
//         children: [
//             "Graphic Design",
//             "UI/UX Design",
//             "3D Modeling",
//             "Animation"
//         ]
//     },
//     {
//         name: "Language Learning",
//         children: [
//             "English",
//             "Arabic",
//             "French",
//             "German"
//         ]
//     }
// ];

// async function seedCategories() {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log("📌 Connected to MongoDB");


//         for (const cat of categories) {
//             // Insert parent category
//             const parent = await Category.create({ name: cat.name });

//             // Insert child categories
//             if (cat.children && cat.children.length > 0) {
//                 const subcats = cat.children.map(ch => ({
//                     name: ch,
//                     parent: parent._id
//                 }));
//                 await Category.insertMany(subcats);
//             }
//         }

//         console.log("✅ Categories seeded successfully!");
//         process.exit(0);
//     } catch (err) {
//         console.error("❌ Error seeding categories:", err);
//         process.exit(1);
//     }
// }

// seedCategories();
