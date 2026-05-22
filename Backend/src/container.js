//===============================IMPORTS===============================

// Models
const Course = require('./models/Course');
const Category = require('./models/Category');
const Section = require('./models/Section');
const Lesson = require('./models/Lesson');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');
const FeedBack = require('./models/FeedBack');
const Review = require('./models/Review');
const InstructorRequest = require('./models/InstructorRequest');
// Repositories
const CourseRepository = require('./repositories/courseRepository');
const CategoryRepository = require('./repositories/categoryRepository');
const SectionRepository = require('./repositories/sectionRepository');
const LessonRepository = require('./repositories/lessonRepository');
const EnrollmentRepository = require('./repositories/enrollmentRepository');
const UserRepository = require('./repositories/userRepository');
const FeedBackRepository = require('./repositories/feedbackRepository');
const ReviewRepository = require('./repositories/reviewRepository');
const InstructorRequestRepository = require('./repositories/instructorRequestRepository');
// Services
const CourseService = require('./services/CourseService');
const CategoryService = require('./services/CategoryService');
const SectionService = require('./services/SectionService');
const LessonService = require('./services/LessonService');
const EnrollmentService = require('./services/EnrollmentService');
const UserService = require('./services/UserService');
const AuthService = require('./services/AuthService');
const FeedBackService = require('./services/FeedBackService');
const ReviewService = require('./services/ReviewService');
const InstructorService = require('./services/InstructorService');

// Controllers
const CourseController = require('./controllers/course.Controller');
const CategoryController = require('./controllers/category.Controller');
const SectionController = require('./controllers/section.Controller');
const LessonController = require('./controllers/lesson.Controller');
const EnrollmentController = require('./controllers/enrollment.Controller');
const UserController = require('./controllers/user.Controller');
const FeedBackController = require('./controllers/feedback.Controller');
const ReviewController = require('./controllers/review.Controller');
const InstructorController = require('./controllers/instructor.Controller');
const AuthController = require('./controllers/auth.Controller');

// ============================ Classes Instance ============================

// Repositories
const courseRepository = new CourseRepository(Course, Enrollment, Section, Lesson, User);
const categoryRepository = new CategoryRepository(Category);
const sectionRepository = new SectionRepository(Section,Course,Lesson);
const lessonRepository = new LessonRepository(Lesson,Section,Course,Enrollment);
const enrollmentRepository = new EnrollmentRepository(Enrollment,Course);
const userRepository = new UserRepository(User);
const feedBackRepository = new FeedBackRepository(FeedBack);
const reviewRepository = new ReviewRepository(Review);
const instructorReqRepository = new InstructorRequestRepository(InstructorRequest);

// Services
const courseService = new CourseService(courseRepository);
const categoryService = new CategoryService(categoryRepository);
const sectionService = new SectionService(sectionRepository);
const lessonService = new LessonService(lessonRepository);
const enrollmentService = new EnrollmentService(enrollmentRepository, courseRepository, userRepository);
const userService = new UserService(userRepository,courseRepository,enrollmentRepository, courseService);
const authService = new AuthService(userRepository);
const feedBackService = new FeedBackService(feedBackRepository);
const reviewService = new ReviewService(reviewRepository,courseRepository);
const instructorService = new InstructorService( instructorReqRepository,userRepository,courseRepository,enrollmentRepository);

// Controllers
const courseController = new CourseController(courseService);
const categoryController = new CategoryController(categoryService);
const sectionController = new SectionController(sectionService);
const lessonController = new LessonController(lessonService);
const enrollmentController = new EnrollmentController(enrollmentService);
const userController = new UserController(userService,instructorService);
const authController = new AuthController(authService);
const feedBackController = new FeedBackController(feedBackService);
const reviewController = new ReviewController(reviewService);
const instructorController = new InstructorController(instructorService);


module.exports = {
    courseController,
    categoryController,
    sectionController,
    lessonController,
    enrollmentController,
    userController,
    authController,
    feedBackController,
    reviewController,
    instructorController

};
