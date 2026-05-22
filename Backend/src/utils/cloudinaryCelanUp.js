const cloudinary = require('../config/cloudinary');

const deleteMediaFromCloudinary = async ({ thumbnailPublicId, lessons = [] }) => {
    // Delete course thumbnail
    if (thumbnailPublicId) {
        await cloudinary.uploader.destroy(thumbnailPublicId, { resource_type: 'image' }).catch(() => { });
    }
    
    // Delete all lesson media
    for (const lesson of lessons) {
        // Delete video
        if (lesson.video?.publicId) {
            await cloudinary.uploader.destroy(lesson.video.publicId, { resource_type: 'video' }).catch(() => { });
        }

        // Delete resources
        if (lesson.resources?.length) {
            for (const resource of lesson.resources) {
                if (resource.publicId) {
                    await cloudinary.uploader.destroy(resource.publicId, { resource_type: 'image' }).catch(() => { });
                }
            }
        }
    }
};

module.exports = { deleteMediaFromCloudinary };
