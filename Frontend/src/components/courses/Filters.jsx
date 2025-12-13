'use client';

import { useState, useEffect } from 'react';
import { categoryAPI } from '@/lib/api';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export default function Filters({ filters, onFilterChange, onClearFilters }) {
    const [categories, setCategories] = useState([]);
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        level: true,
        rating: true,
    });



    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                setCategories(response.data.data || []);
             
                
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        getCategories();
    }, []);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const levels = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        // { value: 'all', label: 'All Levels' },
    ];

    const priceRanges = [
        { value: 'free', label: 'Free', min: 0, max: 0 },
        { value: 'paid', label: 'Paid', min: 1, max: null },
        { value: '0-50', label: '$0 - $50', min: 0, max: 50 },
        { value: '50-100', label: '$50 - $100', min: 50, max: 100 },
        { value: '100-200', label: '$100 - $200', min: 100, max: 200 },
        { value: '200+', label: '$200+', min: 200, max: null },
    ];

    const ratings = [5, 4, 3, 2, 1];

    const activeFiltersCount = Object.values(filters).filter(v =>
        v !== null && v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
    ).length;
    return (
        <div className="glass-card p-6 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-primary-500 hover:text-primary-600 flex items-center space-x-1"
                    >
                        <FiX className="w-4 h-4" />
                        <span>Clear All ({activeFiltersCount})</span>
                    </button>
                )}
            </div>

            {/* Categories */}
            <FilterSection
                title="Category"
                isExpanded={expandedSections.category}
                onToggle={() => toggleSection('category')}
            >
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label key={category._id || category.id} className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.category === category._id || filters.category === category.id}
                                onChange={(e) => {
                                    onFilterChange('category', e.target.checked ? category._id || category.id : null);
                                }}
                                className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm group-hover:text-primary-500 transition-colors">
                                {category.name}
                            </span>
                            {category.courseCount && (
                                <span className="text-xs text-gray-500">({category.courseCount})</span>
                            )}
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Price */}
            <FilterSection
                title="Price"
                isExpanded={expandedSections.price}
                onToggle={() => toggleSection('price')}
            >
                <div className="space-y-2">
                    {priceRanges.map((range) => (
                        <label key={range.value} className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="price"
                                checked={filters.priceRange === range.value}
                                onChange={() => onFilterChange('priceRange', range.value)}
                                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm group-hover:text-primary-500 transition-colors">
                                {range.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Level */}
            <FilterSection
                title="Level"
                isExpanded={expandedSections.level}
                onToggle={() => toggleSection('level')}
            >
                <div className="space-y-2">
                    {levels.map((level) => (
                        <label key={level.value} className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.level === level.value}
                                onChange={(e) => onFilterChange('level', e.target.checked ? level.value : null)}
                                className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm group-hover:text-primary-500 transition-colors">
                                {level.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection
                title="Rating"
                isExpanded={expandedSections.rating}
                onToggle={() => toggleSection('rating')}
            >
                <div className="space-y-2">
                    {ratings.map((rating) => (
                        <label key={rating} className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="rating"
                                checked={filters.rating === rating}
                                onChange={() => onFilterChange('rating', rating)}
                                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                            />
                            <div className="flex items-center space-x-1 text-sm group-hover:text-primary-500 transition-colors">
                                <span className="font-semibold">{rating}</span>
                                <span className="text-yellow-500">★</span>
                                <span>& up</span>
                            </div>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    );
}

function FilterSection({ title, isExpanded, onToggle, children }) {
    return (
        <div className="border-b border-white/10 pb-4 mb-4 last:border-b-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full mb-3 hover:text-primary-500 transition-colors"
            >
                <span className="font-semibold">{title}</span>
                {isExpanded ? (
                    <FiChevronUp className="w-5 h-5" />
                ) : (
                    <FiChevronDown className="w-5 h-5" />
                )}
            </button>
            {isExpanded && <div>{children}</div>}
        </div>
    );
}