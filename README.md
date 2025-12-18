# Skill-up E-Learning Platform

Skill-up is a full-stack e-learning platform designed to allow instructors to create and publish courses, and for students to enroll and consume educational content. It features a modern, role-based architecture with separate interfaces for students, instructors, and administrators.

## Features

- **User Roles:** Separate registration and dashboards for Students, Instructors, and Administrators.
- **Course Management:** Instructors can create, edit, and publish courses with detailed descriptions, sections, and lessons.
- **Student Enrollment:** Students can browse the course catalog, enroll in courses, and track their learning progress.
-**Admin:** Admin can oversee and manage all users and content 
- **Payments:** Secure payment processing integrated with Stripe for course purchases.
- **Content Hosting:** Supports video and document uploads for lessons, hosted on Cloudinary.
- **Reviews & Ratings:** Students can leave reviews and ratings for courses they are enrolled in.
- **Authentication:** Secure authentication using JSON Web Tokens (JWT) with refresh token mechanism.
(accesstoken > memory , refresh token HttpOnly Cookies)

## Tech Stack

### Backend

- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Payments:** Stripe
- **File Storage:** Cloudinary
- **Logger:** Winston
- **API:** RESTful API with a service-oriented architecture.

### Frontend

- **Framework:** React with Next.js 16 
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Communication:** Axios
- **Forms:** React Hook Form

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm
- MongoDB instance (local or cloud-based)
- Git

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd Backend
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    ```
3.  **Create a `.env` file** in the `Backend` directory and add the following environment variables. Replace the placeholder values with your actual credentials.

    ```env
    # Server Configuration
    PORT=5000
    NODE_ENV=development
    FRONTEND_URL=http://localhost:3000

    # Database
    MONGO_URL=mongodb://localhost:27017/skillup-db

    # Authentication
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=1d
    JWT_REFRESH_SECRET=your_jwt_refresh_secret
    JWT_REFRESH_EXPIRES_IN=7d

    # Stripe
    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

    # Cloudinary
    CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

    # Email (Optional, for email features)
    EMAIL_HOST=your_email_host
    EMAIL_PORT=your_email_port
    EMAIL_USER=your_email_user
    EMAIL_PASS=your_email_password
    ```

4.  **(Optional) Seed the database:** To populate the database with initial data for development, run:
    ```sh
    node seed.js
    ```

5.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The backend server will be running on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd Frontend
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    ```
3.  **Create a `.env.local` file** in the `Frontend` directory and add the backend API URL:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
    ```

4.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The frontend application will be available at `http://localhost:3000`.

## Folder Structure

The project is organized into two main folders: `Backend` and `Frontend`.

```
Skill-up/
├── Backend/
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API route definitions
│   │   ├── services/    # Business logic
│   │   └── config/      # DB, Cloudinary config
|   |   |__ middleWares  # Auth, erroHanfling, multer, validation Mw
│   ├── .env.example     # Environment variable template
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── app/         # Next.js app router
    │   ├── components/  # Reusable React components
    │   ├── lib/         # API clients, utilities
    │   ├── store/       # Zustand state management
    │   └── hooks/       # Custom React hooks
    ├── .env.local.example # Environment variable template
    └── package.json
```


