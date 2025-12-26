import api from "./axios";

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    changePassword: (data) => api.post('/auth/change-password', data),
};

export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.patch(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const courseAPI = {
    getPublished: (filters = {}) => {
        // Convert category array to str,str
        if (Array.isArray(filters.category)) {
            filters.category = filters.category.join(',');
        }

        return api.get('/courses', { params: filters });
    },
    // getById: (id) => api.get(`/courses/${id}`),
    checkEnrollment: (id) => api.get(`/courses/${id}/enrollment`),
    getCourseContent: (id) => api.get(`/courses/${id}/content`),
    getInstructorCourses: (params) => api.get('/courses/instructor/my-courses', { params }),
    create: (formData) => api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadThumbnail: (formData, courseId) => api.post(`/uploads/courses/${courseId}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteThumbnail: (courseId) => api.delete(`/uploads/courses/${courseId}/thumbnail`),
    update: (id, data) => api.patch(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
    publish: (id, status) => api.patch(`/courses/${id}/status`, { status }),
    getAll: (params) => api.get('/courses/admin/all', { params }),//admin

};

export const sectionAPI = {
    getByCourse: (courseId) => api.get(`/sections/course/${courseId}`),
    getById: (id) => api.get(`/sections/${id}`),
    create: (data) => api.post('/sections', data),
    update: (id, data) => api.patch(`/sections/${id}`, data),
    delete: (id) => api.delete(`/sections/${id}`),
};

export const lessonAPI = {
    getBySection: (sectionId) => api.get(`/lessons/section/${sectionId}`),
    getById: (id) => api.get(`/lessons/${id}`),
    create: (formData) => api.post('/lessons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),

    update: (id, data) => api.patch(`/lessons/${id}`, data),
    delete: (id) => api.delete(`/lessons/${id}`),
    markComplete: (courseId, lessonId) => api.post(`/lessons/courses/${courseId}/lessons/${lessonId}/complete`),
    uploadVideo: (formData, lessonId) => api.post(`/uploads/lessons/${lessonId}/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),

    deleteVideo: (lessonId) => api.delete(`/uploads/lessons/${lessonId}/video`),
    uploadResources: (formData, lessonId) => api.post(`/uploads/lessons/${lessonId}/resources`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteResource: (lessonId, publicId) => api.delete(`/uploads/lessons/${lessonId}/resources/${publicId}`),
};

export const reviewAPI = {
    getAll: (params) => api.get('/reviews', { params }),
    getMyReviews: (limit = 10) => api.get('/reviews/instructor', { limit }), //instructor gets his own 
    getInstructorReviews: (instructorId, limit = 10) =>
        api.get(`/reviews/instructor/${instructorId}`, { limit }), // admin gets instructor reviews
    create: (data, courseId) => api.post(`/reviews/${courseId}`, data),
    update: (id, data) => api.patch(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

export const feedbackAPI = {
    getAll: (params) => api.get('/feedback', { params }),
    create: (data) => api.post(`/feedback/`, data),
    updateStatus: (id, data) => api.patch(`/feedback/${id}`, data),
    delete: (id) => api.delete(`/feedback/${id}`),
};

export const userAPI = {
    getMyProfile: () => api.get('/users/me'),
    updateMyProfile: (data) => api.patch(`/users/me`, data),
    uploadAvatar: (formData) => api.post('/uploads/users/me/avatar',
        formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteAvatar: () => api.delete('/uploads/users/me/avatar'),
    //admin
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.patch(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/delete/${id}`),
};

export const enrollmentAPI = {
    enroll: (courseId) => api.post(`/enrollments/courses/${courseId}/enroll`),
    getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
    getCertificate: (courseId) => api.get(`/certificate/${courseId}`),
};

export const instructorAPI = {
    getAllInstructorStudents: () => api.get('/instructors/students'),
    getInstructorDashboard: () => api.get('/instructors/stats'),
    getPublicProfile: (id) => api.get(`/instructors/profile/${id}`),
    requestInstructor: (formData) => api.post('/users/instructor/request', formData,{
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
}


export const adminAPI = {
    getStats: () => api.get('/users/admin/stats'),
    getAllRequests: () => api.get('/users/admin/requests'),
    reviewRequest: (id, data) => api.patch(`/users/admin/review/${id}`, data),
};


