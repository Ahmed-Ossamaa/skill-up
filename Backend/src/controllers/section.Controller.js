const SectionService = require('../services/SectionService');
const asyncHandler = require('express-async-handler');

class SectionController {
    constructor() {
        this.sectionService = new SectionService();
    }

    createSection = asyncHandler(async (req, res) => {
        const section = await this.sectionService.createSection(
            req.body, 
            req.user.id
        );
        res.status(201).json({ message: 'Section created', data: section });
    });

    getSection = asyncHandler(async (req, res) => {
        const section = await this.sectionService.getSectionById(req.params.id);
        res.status(200).json({ data: section });
    });

    updateSection = asyncHandler(async (req, res) => {
        const section = await this.sectionService.updateSection(
            req.params.id, 
            req.body, 
            req.user.id
        );
        res.status(200).json({ message: 'Section updated', data: section });
    });

    deleteSection = asyncHandler(async (req, res) => {
        await this.sectionService.deleteSection(
            req.params.id, 
            req.user.id
        );
        res.status(200).json({ message: 'Section deleted' });
    });

    getSectionsByCourse = asyncHandler(async (req, res) => {
        const sections = await this.sectionService.getSectionsByCourse(req.params.courseId);
        res.status(200).json({ data: sections });
    });
}

module.exports = new SectionController();