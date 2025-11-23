const cloudinary = require('../config/cloudinary');

const deleteMediaFromCloudinary = async ({ thumbnailPublicId, lessons = [] }) => {
    // Delete course thumbnail
    if (thumbnailPublicId) {
        await cloudinary.uploader.destroy(thumbnailPublicId, { resource_type: 'image' }).catch(() => { });
    }

    // Delete all lesson media
    for (const lesson of lessons) {
        // Delete video
        if (lesson.videoPublicId) {
            await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: 'video' }).catch(() => { });
        }

        // Delete resources
        if (lesson.resources?.length) {
            for (const resource of lesson.resources) {
                if (resource.filePublicId) {
                    await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' }).catch(() => { });
                }
            }
        }
    }
};

module.exports = { deleteMediaFromCloudinary };
