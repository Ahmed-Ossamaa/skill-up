const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');

class LessonService {
    constructor(LessonModel, SectionModel, CourseModel, EnrollmentModel) {
        this.Lesson = LessonModel;
        this.Section = SectionModel;
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
    }

    async createLesson(data, userId, userRole) {
        const section = await this.Section.findById(data.section).populate('course');
        if (!section) throw ApiError.notFound('Section not found');

        const course = section.course;

        // Only the course instructor or admin can create lessons
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to add lesson to this course');
        }

        // ..................Handle Video Upload...............
        let finalDuration = 0;
        let videoData = undefined;
        if (data.videoFile) {
            const videoUpload = await uploadToCloudinary(data.videoFile.buffer, 'lessons', 'video');
            videoData = {
                url: videoUpload.secure_url,
                publicId: videoUpload.publicId,
                duration: videoUpload.duration || 0,
            };
            finalDuration = videoUpload.duration || 0;
        }
        // ..................Handle Document Uploads...............
        let documentData = undefined;
        if (data.doc) {
            const originalName = data.doc.originalname.replace(/\s+/g, '_');
            const documentUpload = await uploadToCloudinary(
                data.doc.buffer,
                'lessons',
                'auto',
                {
                    use_filename: true,
                    unique_filename: true,
                    filename_override: originalName,
                    format: originalName.split('.').pop()
                }
            );
            documentData = {
                name: data.doc.originalname,
                url: documentUpload.secure_url,
                publicId: documentUpload.publicId,
                type: 'document'
            };
            finalDuration = 300;
        }

        // .............Handle Resource Uploads [].......................
        let resourceList = [];
        if (data.resourceFiles && data.resourceFiles.length > 0) {
            const uploadPromises = data.resourceFiles.map(file => {

                const sanitizedName = file.originalname.replace(/\s+/g, '_');

                return uploadToCloudinary(
                    file.buffer,
                    'resources',
                    'auto',
                    {
                        use_filename: true,
                        unique_filename: true,
                        filename_override: sanitizedName,
                        format: sanitizedName.split('.').pop()
                    }
                )
            });


            const results = await Promise.all(uploadPromises);

            resourceList = results.map((res, index) => ({
                name: data.resourceFiles[index].originalname,
                url: res.secure_url,
                publicId: res.publicId,
                type: 'file'
            }));
        }

        const finalResources = [
            ...(data.resources || []),
            ...resourceList
        ];

        // Create the lesson
        const lesson = await this.Lesson.create({
            title: data.title,
            description: data.description,
            type: data.type,
            section: data.section,
            course: data.course,
            createdBy: userId,
            video: videoData,
            documents: documentData,
            resources: finalResources,
            content: data.content,
            duration: finalDuration
        });

        // Add lesson to section's lessons array
        await this.Section.findByIdAndUpdate(
            data.section,
            { $push: { lessons: lesson._id } }
        );
        //to fix progress of students after adding a new lesson
        await this.recalculateCourseProgress(data.course);

        return lesson;
    }


    async updateLesson(lessonId, data, userId, userRole) {
        const lesson = await this.Lesson.findById(lessonId).populate({
            path: 'section',
            populate: { path: 'course' }
        });
        if (!lesson) throw ApiError.notFound('Lesson not found');

        const course = lesson.section?.course || await this.Course.findById(lesson.course);
        // Only the course instructor or admin can update
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this lesson');
        }

        // Handle Video Update
        if (data.videoFile) {
            // Delete old video if exists
            if (lesson.video && lesson.video.publicId) {
                await deleteMediaFromCloudinary(lesson.video.publicId, 'video');
            }

            // Upload new video
            const videoUpload = await uploadToCloudinary(data.videoFile.buffer, 'lessons', 'video');

            lesson.video = {
                url: videoUpload.secure_url,
                publicId: videoUpload.publicId,
                duration: videoUpload.duration,
                type: "video"
            };

            // Update main duration field automatically
            lesson.duration = videoUpload.duration || 0;
        }

        // Handle Document Update
        if (data.doc) {
            // Delete old document if exists
            if (lesson.documents && lesson.documents.publicId) {
                await deleteMediaFromCloudinary(lesson.documents.publicId, 'image');
            }

            // Upload new doc
            const originalName = data.doc.originalname.replace(/\s+/g, '_');
            const docUpload = await uploadToCloudinary(
                data.doc.buffer,
                'lessons',
                'auto',
                {
                    use_filename: true,
                    unique_filename: true,
                    filename_override: originalName,
                    format: originalName.split('.').pop()
                }
            );

            lesson.documents = {
                name: data.doc.originalname,
                url: docUpload.secure_url,
                publicId: docUpload.publicId,
                type: 'document'
            };

            // default duration for text/documents if no video exists
            if (!lesson.video) {
                lesson.duration = 300;
            }
        }

        // .......................Handle Resource Files........................
        //  Upload new files if provided
        let newResources = [];
        if (data.resourceFiles && data.resourceFiles.length > 0) {
            const uploadPromises = data.resourceFiles.map(file => {
                const sanitizedName = file.originalname.replace(/\s+/g, '_');
                return uploadToCloudinary(
                    file.buffer,
                    'resources',
                    'auto',
                    {
                        use_filename: true,
                        unique_filename: true,
                        filename_override: sanitizedName,
                        format: sanitizedName.split('.').pop()
                    }
                );
            });

            const results = await Promise.all(uploadPromises);
            newResources = results.map((res, index) => ({
                name: data.resourceFiles[index].originalname,
                url: res.secure_url,
                publicId: res.publicId,
                type: 'file'
            }));
        }

        const keptResources = data.resources ? data.resources : lesson.resources;
        lesson.resources = [...keptResources, ...newResources];

        // Update Text Fields
        if (data.title) lesson.title = data.title;
        if (data.description) lesson.description = data.description;
        if (data.content) lesson.content = data.content;
        if (typeof data.isPreview !== 'undefined') lesson.isPreview = data.isPreview;
        if (data.type) lesson.type = data.type;

        if (!lesson.video && !lesson.duration) {
            lesson.duration = 300;
        }

        // Handle Section Move
        if (data.section && data.section !== lesson.section._id.toString()) {
            await this.Section.findByIdAndUpdate(lesson.section._id, { $pull: { lessons: lesson._id } });
            await this.Section.findByIdAndUpdate(data.section, { $push: { lessons: lesson._id } });
            lesson.section = data.section;
        }

        await lesson.save();
        return lesson;
    }

    // Delete the lesson and its media from cloudinary
    async deleteLesson(lessonId, userId, userRole) {
        const lesson = await this.Lesson.findById(lessonId).populate({
            path: 'section',
            populate: { path: 'course' }
        });

        if (!lesson) throw ApiError.notFound('Lesson not found');

        const course = lesson.section?.course || await this.Course.findById(lesson.course);

        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this lesson');
        }

        // Delete lesson media from Cloudinary
        await deleteMediaFromCloudinary({ lessons: [lesson] });

        // Remove lesson from sections
        if (lesson.section) {
            await this.Section.findByIdAndUpdate(
                lesson.section,
                { $pull: { lessons: lesson._id } }
            );
        }
        // Recalculate course progress for students after deleteing a lesson
        await this.recalculateCourseProgress(data.course);

        await lesson.deleteOne();
    }

    // Get all lessons for a specific section
    async getSectionLessons(sectionId) {
        const section = await this.Section.findById(sectionId);
        if (!section) throw ApiError.notFound('Section not found');

        const lessons = await this.Lesson.find({ section: sectionId }).sort({ order: 1 });
        return lessons;
    }

    // Get lesson by ID ( enrollment check for students)
    async getLessonById(lessonId, userId, userRole) {
        const lesson = await this.Lesson.findById(lessonId)
            .populate('section')
            .populate('course');

        if (!lesson) throw ApiError.notFound('Lesson not found');
        // Only the course instructor or admin or enrolled std can access
        const isOwner = lesson.course.instructor.toString() === userId.toString();
        if (isOwner) return lesson;
        if (userRole === 'admin') return lesson;
        // If the lesson is a preview, allow access
        if (lesson.isPreview) return lesson;
        const enrollment = await this.Enrollment.findOne({
            student: userId,
            course: lesson.course._id
        });
        if (!enrollment) {
            throw ApiError.forbidden('Please enroll to access this course');
        }

        return lesson;
    }
    //working on it -----------------------------------------------------------------
    async markLessonCompleted(studentId, courseId, lessonId) {
        const enrollment = await this.Enrollment.findOne({
            student: studentId,
            course: courseId
        });

        if (!enrollment)
            throw ApiError.forbidden("Not enrolled");

        // If lesson already completed>> skip
        const alreadyCompleted = enrollment.progress.completedLessons.some(
            (id) => id.toString() === lessonId.toString()
        );
        if (alreadyCompleted) return enrollment;

        // Add completed lesson ID
        enrollment.progress.completedLessons.push(lessonId);

        // Count total lessons in course
        const totalLessons = await this.Lesson.countDocuments({ course: courseId });
        const completedCount = enrollment.progress.completedLessons.length;

        // Calculate progress percentage
        const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        enrollment.progress.percentage = percentage;

        // If progress reaches 100% -> mark as completed
        if (percentage >= 100) {
            enrollment.status = "completed";
            enrollment.completedAt = new Date();
        }

        await enrollment.save();
        return enrollment;
    }


    /**
     * Recalculates course progress for all enrolled students in the given course
     * @param {ObjectId} courseId - the ID of the course to recalculate progress for
     */
    async recalculateCourseProgress(courseId) {
        const totalLessons = await this.Lesson.countDocuments({ course: courseId });

        if (totalLessons === 0) return;

        await this.Enrollment.updateMany(
            { course: courseId },
            [
                {
                    $set: {
                        "progress.percentage": {
                            $multiply: [
                                { $divide: [{ $size: "$progress.completedLessons" }, totalLessons] },
                                100
                            ]
                        }
                    }
                },
                //  If progress drops below 100%, staus:enrolled instead of :completed
                {
                    $set: {
                        status: {
                            $cond: {
                                if: { $lt: ["$progress.percentage", 100] },
                                then: "enrolled",
                                else: "completed" //
                            }
                        },
                        // reset CompletedAt if not 100%
                        completedAt: {
                            $cond: {
                                if: { $lt: ["$progress.percentage", 100] },
                                then: null,
                                else: "$completedAt"
                            }
                        }
                    }
                }
            ]
        );
    }
}

module.exports = LessonService;