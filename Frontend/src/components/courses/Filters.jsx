'use client';

import { useState, useEffect } from 'react';
import { categoryAPI } from '@/lib/api';
import { FiChevronDown, FiChevronUp, FiX, FiPlus, FiMinus } from 'react-icons/fi'; 

export default function Filters({ filters, onFilterChange, onClearFilters }) {
    const [categories, setCategories] = useState([]);
    const [showAllCategories, setShowAllCategories] = useState(false); 
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: false,
        level: false,
        rating: false,
    });

    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                setCategories(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        getCategories();
    }, []);

    const getAllIds = (category) => {
        let ids = [category._id || category.id];
        if (category.subCategories && category.subCategories.length > 0) {
            category.subCategories.forEach(sub => {
                ids = ids.concat(getAllIds(sub));
            });
        }
        return ids;
    };

    // Handlers
    const handleCategoryChange = (category, isChecked) => {
        let currentSelected = Array.isArray(filters.category) 
            ? [...filters.category] 
            : (filters.category ? [filters.category] : []);

        //all children categories
        const targetIds = getAllIds(category);

        if (isChecked) {
            // add to set (unique only)
            const combined = new Set([...currentSelected, ...targetIds]);
            onFilterChange('category', Array.from(combined));
        } else {
            const filtered = currentSelected.filter(id => !targetIds.includes(id));
            onFilterChange('category', filtered.length > 0 ? filtered : null);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const renderCategoryTree = (catList, level = 0) => {
        return catList.map((category) => {
            const catId = category._id || category.id;
            const isSelected = Array.isArray(filters.category) 
                ? filters.category.includes(catId)
                : filters.category === catId;

            return (
                <div key={catId}>
                    <label 
                        className={`flex items-start space-x-2 cursor-pointer group py-1 ${level > 0 ? 'ml-1' : ''}`}
                    >


                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleCategoryChange(category, e.target.checked)}
                            className="w-4 h-4 mt-1 text-primary-500 rounded focus:ring-primary-500 shrink-0 border-gray-300"
                        />
                        
                        <div className="flex-1">
                            <span className={`text-sm transition-colors ${
                                isSelected 
                                ? 'text-primary-600 font-medium' 
                                : 'group-hover:text-primary-500 text-gray-700'
                            } ${level === 0 ? 'font-medium' : ''}`}>
                                {category.name}
                            </span>
                            
                            {category.courseCount > 0 && (
                                <span className="text-xs text-gray-400 ml-1">({category.courseCount})</span>
                            )}
                        </div>
                    </label>

                    {category.subCategories && category.subCategories.length > 0 && (
                        <div className="ml-2 border-l border-gray-100 pl-1 my-1">
                            {renderCategoryTree(category.subCategories, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const visibleRoots = showAllCategories ? categories : categories.slice(0, 5);
    const activeFiltersCount = (Array.isArray(filters.category) ? filters.category.length : (filters.category ? 1 : 0));

    const levels = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'all levels', label: 'All Levels' },
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


    return (
        <div className="glass-card p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-primary-500 hover:text-primary-600 flex items-center space-x-1"
                    >
                        <FiX className="w-4 h-4" />
                        <span>Clear All</span>
                    </button>
                )}
            </div>

            {/* Categories */}
            <FilterSection
                title="Category"
                isExpanded={expandedSections.category}
                onToggle={() => toggleSection('category')}
            >
                <div className="space-y-1">
                    {renderCategoryTree(visibleRoots)}
                    {categories.length > 5 && (
                        <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="text-sm text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1 mt-3 ml-1"
                        >
                            {showAllCategories ? (
                                <><FiMinus className="w-3 h-3" /> Show Less</>
                            ) : (
                                <><FiPlus className="w-3 h-3" /> View All Categories</>
                            )}
                        </button>
                    )}
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
                                className="w-4 h-4 text-primary-500 focus:ring-primary-500 border-gray-300"
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
                                className="w-4 h-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                            />
                            <div className="flex items-center space-x-1 text-sm group-hover:text-primary-500 transition-colors">
                                <span className="font-semibold">{rating}</span>
                                <span className="text-yellow-500">★</span>
                                <span className="text-gray-500">& up</span>
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
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-b-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full mb-3 hover:text-primary-500 transition-colors"
            >
                <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
                {isExpanded ? (
                    <FiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>
            {isExpanded && <div className="animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
        </div>
    );
}