const express = require('express');
const router = express.Router();
const { uploadAvatar, uploadVideo, uploadResource,uploadThumbnail } = require('../middlewares/upload');
const uploadController = require('../controllers/uploadController');
const { protect, authorize } = require('../middlewares/authMW');

router.use(protect);

// User avatar
router.post('/users/me/avatar', uploadAvatar.single('avatar'), uploadController.uploadAvatar);
router.delete('/users/me/avatar', uploadController.deleteAvatar);

// Course thumbnail 
router.post(
    '/courses/:courseId/thumbnail',
    authorize('instructor', 'admin'),
    uploadThumbnail.single('thumbnail'),
    uploadController.uploadCourseThumbnail
);
router.delete(
    '/courses/:courseId/thumbnail',
    authorize('instructor', 'admin'),
    uploadController.deleteCourseThumbnail
);

// Upload Lesson video 
router.post(
    '/lessons/:lessonId/video',
    authorize('instructor', 'admin'),
    uploadVideo.single('video'),
    uploadController.uploadLessonVideo
);
// Delete Lesson video
router.delete(
    '/lessons/:lessonId/video',
    authorize('instructor', 'admin'),
    uploadController.deleteLessonVideo
);

// Upload Lesson resources
router.post(
    '/lessons/:lessonId/resources',
    authorize('instructor', 'admin'),
    uploadResource.single('resource'),
    uploadController.uploadLessonResource
);

// delete resource by publicId
router.delete(
    '/lessons/:lessonId/resources/:publicId',
    authorize('instructor', 'admin'),
    uploadController.deleteLessonResource
);

module.exports = router;
