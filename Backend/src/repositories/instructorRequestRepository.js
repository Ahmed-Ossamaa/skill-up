const InstructorRequest = require('../models/InstructorRequest');

class InstructorRequestRepository {
    constructor() {
        this.InstructorRequest = InstructorRequest;
    }

    async findOne(query) {
        return this.InstructorRequest.findOne(query);
    }

    async create(data) {
        return this.InstructorRequest.create(data);
    }

    async find(query) {
        return this.InstructorRequest.find(query)
            .populate('user', 'name email status role avatar')
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return this.InstructorRequest.findById(id).populate('user', 'name email status role avatar');
    }

    async save(request) {
        return request.save();
    }
}

module.exports = new InstructorRequestRepository();