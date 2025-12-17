import api from "./axios";

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
};

export const courseAPI = {
    getPublished: (params) => api.get('/courses', { params }),
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
    getAll: () => api.get('/courses/admin/all'),//admin

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
    create: (data, courseId) => api.post(`/reviews/${courseId}`, data),
    update: (id, data) => api.patch(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

export const userAPI = {
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.patch(`/users/${id}`, data),
    uploadAvatar: (formData) => api.post('/uploads/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteAvatar: () => api.delete('/uploads/users/me/avatar'),
};

export const enrollmentAPI = {
    enroll: (courseId) => api.post(`/enrollments/courses/${courseId}/enroll`),
    getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
};

export const instructorAPI = {
    getAllInstructorStudents: () => api.get('/instructors/students'),
    getInstructorDashboard: () => api.get('/instructors/stats'),
}

