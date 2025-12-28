# Skill-up E-Learning Platform 🎓

Skill-up is a comprehensive, full-stack e-learning platform designed to bridge the gap between instructors and students. It features a modern, role-based architecture with three distinct dashboards, secure payment processing, and interactive course consumption.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-5433FF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

---

## ✨ Key Features

### 👥 Role-Based Dashboards
The platform provides unique experiences and features for three distinct user types:

* **👨‍🎓 Student Dashboard:**
    * Browse and search the full course catalog.
    * **Enrolled vs. Guest View:** Guests see previews; enrolled students get full access to lessons and resources.
    * Track learning progress and completion status.
    * Leave reviews and ratings for courses (Enrolled).
* **👨‍🏫 Instructor Dashboard:**
    * **Course Management:** Create, edit, and publish courses with rich media (video/documents).
    * **Curriculum Builder:** Organize content into sections and lessons.
    * View Enrollment, Course, and Revenue stats (Aggregations)
* **🛠️ Admin Dashboard:**
    * Complete oversight of All users (Students, Instructors, Admins).
    * Content moderation and platform-wide statistics.
    * Manage All users and courses.
    * Receive and reply to users' requests (Become an Instructor), Inquiries, and feedback.

### 🔐 Security & Payments
* **Advanced Authentication:** Secure JWT implementation using **Access Tokens** (in memory) and **Refresh Tokens** (HttpOnly Cookies) for maximum security.
* **Automated Email service:** to respond to the user's request to become an instructor (in case of acceptance or rejection) & Reset password requests
  (using Brevo Api since SMTP is blocked on Render free tier).
* **Payments:** Integrated **Stripe** checkout for seamless and secure course purchases.
* **Protected Routes:** Middleware ensures users only access pages authorized for their specific role (Admin/Instructor/Student), and their Enrollment status.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Rendering Strategies:**
  * **SSR (Server-Side Rendering):** For secure, dynamic pages.
  * **ISR (Incremental Static Regeneration):** For high-performance Landing page & Course Detail pages that update periodically.
  * **SSG (Static Site Generation):** For static Pages.
  * **CSR (Client-Side Rendering):** For interactive components.
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)

### Backend
* **Runtime:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
* **Media Storage:** [Cloudinary](https://cloudinary.com/) (Video & Document & Image hosting)
* **Logging:** [Winston](https://github.com/winstonjs/winston)
* **Payments:** [Stripe SDK](https://stripe.com/docs/api)
* **E-Mail:** [Brevo API](https://www.brevo.com/)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* Node.js & npm
* MongoDB instance (Local or Atlas)
* Cloudinary Account (for media)
* Stripe Account (for payments)

### 1. Backend Setup

Navigate to the backend folder and install dependencies:
```sh
cd Backend
npm install
```
Create a .env file in the /Backend directory:
```sh
# Server Config
PORT=5000
NODE_ENV=dev
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URL=mongodb://localhost:27017/skillup-db

# Auth (JWT)
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Third Party Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_Publishable_KEY=xxx..xxx..xxx.xxx.xxx
STRIPE_WEBHOOK_SECRET=whxxx_...

CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email --> API (SMTP is blocked on Render.com free tier)
#BREVO_API_KEY=xxxxxx.....xxxxxx......xxxxxx
EMAIL_FROM=your-email@example.com

#OR

# Email --> SMTP (if you are going to use SMTP) --> working locally 
EMAIL_HOST=smtp-relay.brevo.com || smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_user
EMAIL_PASS=your_pass (app password)
```

#Start the Server :

    npm run dev
### 2. Frontend Setup :
    cd Frontend
    npm install

Create a .env file in the /Frontend directory:
```sh
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RENDER_URL=https://your-backend-URL-after deployment
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Start the Client:

    npm run dev

📂 Folder Structure
```ssh
Skill-up/
├── Backend/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Business logic
│   │   ├── config/        # DB, Cloudinary config
│   │   └── middleWares/   # Auth, ErrorHandling, Multer, Validation
│   ├── .env.example
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── app/           # Next.js App Router pages
    │   ├── components/    # Reusable UI components & CS components
    │   ├── lib/           # Axios client 
    │   ├── store/         # Zustand global store
    │   └── hooks/         # Custom React hooks
    ├── .env.example
    └── package.json
```


