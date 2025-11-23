const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelpers');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// allowed types
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = ['video/mp4', 'video/mkv', 'video/webm', 'video/quicktime'];
const RESOURCE_MIMES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']; // pdf + pptx

// ---------------------- Upload Avatar -------------------------
exports.uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');
    if (!IMAGE_MIMES.includes(req.file.mimetype)) throw ApiError.badRequest('Only images are allowed for avatars');

    const result = await uploadToCloudinary(req.file.buffer, `skillup/users/${req.user._id}/avatars`, 'image');

    // remove old avatar after new upload
    const oldPublicId = req.user.avatarPublicId;
    req.user.avatarUrl = result.secure_url;
    req.user.avatarPublicId = result.public_id;
    await req.user.save();

    if (oldPublicId && oldPublicId !== result.public_id) {
        await deleteFromCloudinary(oldPublicId, 'image');
    }

    res.status(200).json({ message: 'Avatar uploaded', url: result.secure_url, publicId: result.public_id });
});

// ---------------------- Delete Avatar -----------------------
exports.deleteAvatar = asyncHandler(async (req, res) => {
    const oldPublicId = req.user.avatarPublicId;
    if (!oldPublicId) throw ApiError.notFound('No avatar to delete');

    await deleteFromCloudinary(oldPublicId, 'image');

    req.user.avatarUrl = undefined;
    req.user.avatarPublicId = undefined;
    await req.user.save();

    res.json({ message: 'Avatar deleted' });
});

// -------------------- Upload Course Thumbnail --------------------
exports.uploadCourseThumbnail = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');
    if (!IMAGE_MIMES.includes(req.file.mimetype)) throw ApiError.badRequest('Only images are allowed for thumbnails');

    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) throw ApiError.notFound('Course not found');

    if (course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not the owner of this course');
    }

    const result = await uploadToCloudinary(req.file.buffer, `skillup/courses/${courseId}/thumbnails`, 'image');

    const oldPublicId = course.thumbnailPublicId;
    course.thumbnailUrl = result.secure_url;
    course.thumbnailPublicId = result.public_id;
    await course.save();

    if (oldPublicId && oldPublicId !== result.public_id) {
        await deleteFromCloudinary(oldPublicId, 'image');
    }

    res.status(200).json({ message: 'Thumbnail uploaded', url: result.secure_url, publicId: result.public_id });
});

// -------------------- Delete Course Thumbnail --------------------
exports.deleteCourseThumbnail = asyncHandler(async (req, res) => {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) throw ApiError.notFound('Course not found');

    if (course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not the owner of this course');
    }

    if (!course.thumbnailPublicId) throw ApiError.notFound('No thumbnail to delete');

    await deleteFromCloudinary(course.thumbnailPublicId, 'image');

    course.thumbnailUrl = undefined;
    course.thumbnailPublicId = undefined;
    await course.save();

    res.json({ message: 'Thumbnail deleted' });
});

// ---------------------- Upload Lesson Video ----------------------
exports.uploadLessonVideo = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');
    if (!VIDEO_MIMES.includes(req.file.mimetype)) throw ApiError.badRequest('Invalid video format');

    const lessonId = req.params.lessonId;
    const lesson = await Lesson.findById(lessonId).populate('course', '_id title instructor');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not the owner of this course');
    }

    const result = await uploadToCloudinary(req.file.buffer, `skillup/lessons/${lessonId}/videos`, 'video');

    const oldPublicId = lesson.videoPublicId;
    lesson.videoUrl = result.secure_url;
    lesson.videoPublicId = result.public_id;
    lesson.duration = result.duration || lesson.duration;
    await lesson.save();

    if (oldPublicId && oldPublicId !== result.public_id) {
        await deleteFromCloudinary(oldPublicId, 'video');
    }

    res.status(200).json({ message: 'Video uploaded', url: result.secure_url, publicId: result.public_id, duration: result.duration });
});

// ----------------------- Delete Lesson Video -----------------------
exports.deleteLessonVideo = asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const lesson = await Lesson.findById(lessonId).populate('course', '_id title instructor');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not the owner of this course');
    }

    if (!lesson.videoPublicId) throw ApiError.notFound('No video to delete');

    await deleteFromCloudinary(lesson.videoPublicId, 'video');

    lesson.videoUrl = undefined;
    lesson.videoPublicId = undefined;
    lesson.duration = undefined;
    await lesson.save();

    res.json({ message: 'Lesson video deleted' });
});

// -------------------- Upload Lesson Resource  --------------------
exports.uploadLessonResource = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');
    if (!RESOURCE_MIMES.includes(req.file.mimetype)) {
        throw ApiError.badRequest('Only PDF and PPTX are allowed')
    };

    const lessonId = req.params.lessonId;
    const lesson = await Lesson.findById(lessonId).populate('course', '_id title instructor');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not the owner of this course');
    }

    const folderPath = `skillup/lessons/${lessonId}/resources`;
    const result = await uploadToCloudinary(req.file.buffer, folderPath, 'raw');

    const fileData = {
        fileUrl: result.secure_url,
        filePublicId: result.public_id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype
    };

    lesson.resources = lesson.resources || [];
    lesson.resources.push(fileData);
    await lesson.save();

    res.status(200).json({ message: 'Resource uploaded', resource: fileData });
});

// -------------------- Delete Lesson Resource --------------------
exports.deleteLessonResource = asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const publicId = req.params.publicId;
    if (!publicId) throw ApiError.badRequest('publicId is required');

    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not the owner of this course');
    }

    // remove resource from lesson.resources
    lesson.resources = (lesson.resources || []).filter(r => r.filePublicId !== publicId);
    await lesson.save();

    // delete from cloudinary
    await deleteFromCloudinary(publicId, 'raw');

    res.json({ message: 'Resource deleted' });
});
