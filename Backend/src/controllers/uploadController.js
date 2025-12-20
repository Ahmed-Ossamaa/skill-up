const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelpers');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User'); 

// Allowed MIME types
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = ['video/mp4', 'video/mkv', 'video/webm', 'video/quicktime', 'video/x-matroska']; //mkv =matroska
const RESOURCE_MIMES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint' // .ppt
];

// ======================= USER AVATAR =======================

exports.uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No image file provided');
    if (!IMAGE_MIMES.includes(req.file.mimetype)) throw ApiError.badRequest('Invalid image format');

    //  Upload new avatar
    const folder = `skillup/users/${req.user._id}/avatars`;
    const result = await uploadToCloudinary(req.file.buffer, folder, 'image');

    // Delete old avatar
    const oldPublicId = req.user.avatar?.publicId;
    if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId, 'image');
    }

    // Update User
    req.user.avatar = {
        url: result.secure_url,
        publicId: result.publicId,
        type: req.file.mimetype
    };
    await req.user.save();

    res.status(200).json({
        status: 'success',
        message: 'Avatar updated successfully',
        data: req.user.avatar
    });
});

exports.deleteAvatar = asyncHandler(async (req, res) => {
    const publicId = req.user.avatar?.publicId;
    if (!publicId) throw ApiError.notFound('No avatar to delete');

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId, 'image');

    // Unset field in DB
    req.user.avatar = undefined;
    await req.user.save();

    res.status(200).json({ status: 'success', message: 'Avatar deleted' });
});

// ======================= COURSE THUMBNAIL =======================

exports.uploadCourseThumbnail = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No image file provided');
    if (!IMAGE_MIMES.includes(req.file.mimetype)) throw ApiError.badRequest('Invalid image format');

    const course = await Course.findById(req.params.courseId);
    if (!course) throw ApiError.notFound('Course not found');

    // Ownership Check
    if (course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not authorized to modify this course');
    }

    // Upload new thumbnail
    const folder = `skillup/courses/${course._id}/thumbnails`;
    const result = await uploadToCloudinary(req.file.buffer, folder, 'image');

    // Delete old thumbnail if exists
    if (course.thumbnail?.publicId) {
        await deleteFromCloudinary(course.thumbnail.publicId, 'image');
    }

    // Save to DB
    course.thumbnail = {
        url: result.secure_url,
        publicId: result.publicId
    };
    await course.save();

    res.status(200).json({
        status: 'success',
        message: 'Thumbnail uploaded',
        data: course.thumbnail
    });
});

exports.deleteCourseThumbnail = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) throw ApiError.notFound('Course not found');

    if (course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Not authorized');
    }

    if (!course.thumbnail?.publicId) throw ApiError.notFound('No thumbnail to delete');

    await deleteFromCloudinary(course.thumbnail.publicId, 'image');

    course.thumbnail = undefined;
    await course.save();

    res.status(200).json({ status: 'success', message: 'Thumbnail deleted' });
});

// ======================= LESSON VIDEO =======================

exports.uploadLessonVideo = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No video file provided');
    if (!VIDEO_MIMES.includes(req.file.mimetype)) throw ApiError.badRequest('Invalid video format');

    const lesson = await Lesson.findById(req.params.lessonId).populate('course');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Not authorized');
    }

    // Upload Video
    const folder = `skillup/lessons/${lesson._id}/videos`;
    const result = await uploadToCloudinary(req.file.buffer, folder, 'video');

    // Delete old video
    if (lesson.video?.publicId) {
        await deleteFromCloudinary(lesson.video.publicId, 'video');
    }

    // Update Lesson 
    lesson.video = {
        url: result.secure_url,
        publicId: result.publicId,
        duration: result.duration || 0 
    };

    lesson.markModified('video');
    await lesson.save();

    res.status(200).json({
        status: 'success',
        message: 'Video uploaded successfully',
        data: lesson.video
    });
});

exports.deleteLessonVideo = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.lessonId).populate('course');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Not authorized');
    }

    if (!lesson.video?.publicId) throw ApiError.notFound('No video to delete');

    await deleteFromCloudinary(lesson.video.publicId, 'video');

    lesson.video = undefined;
    await lesson.save();

    res.status(200).json({ status: 'success', message: 'Video deleted' });
});

// ======================= LESSON RESOURCES =======================

exports.uploadLessonResource = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');
    if (!RESOURCE_MIMES.includes(req.file.mimetype)) throw ApiError.badRequest('Only PDF and PowerPoint files are allowed');

    const lesson = await Lesson.findById(req.params.lessonId).populate('course');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Not authorized');
    }

    //  Upload Resource 
    const folder = `skillup/lessons/${lesson._id}/resources`;
    const result = await uploadToCloudinary(req.file.buffer, folder, 'auto');

    const newResource = {
        name: req.file.originalname,
        url: result.secure_url,
        publicId: result.publicId,
        type: req.file.mimetype,
        size: req.file.size 
    };

    // Push to array
    lesson.resources.push(newResource);
    await lesson.save();

    res.status(200).json({
        status: 'success',
        message: 'Resource added',
        data: newResource
    });
});
// :lessonId/resources/:publicId
exports.deleteLessonResource = asyncHandler(async (req, res) => {
    const { lessonId, publicId } = req.params; 

    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) throw ApiError.notFound('Lesson not found');

    if (lesson.course.instructor.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Not authorized');
    }

    // Find the resource to ensure it exists
    const resourceIndex = lesson.resources.findIndex(r => r.publicId === publicId);
    if (resourceIndex === -1) throw ApiError.notFound('Resource not found in this lesson');

    //  Delete from Cloudinary
    await deleteFromCloudinary(publicId, 'image'); // cloudinary loves images idk why

    // Remove from Array
    lesson.resources.splice(resourceIndex, 1);
    await lesson.save();

    res.status(200).json({ status: 'success', message: 'Resource deleted' });
});