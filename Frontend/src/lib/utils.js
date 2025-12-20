import { clsx } from 'clsx';

export function cn(...inputs) {
    return clsx(inputs);
}

// Format price
export function formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(price);
}

// Format duration (sec >> h:mm | min)
export function formatDuration(seconds) {
    const hours = (seconds / 3600).toFixed(1);
    const minutes = ((seconds % 3600) / 60).toFixed(1);

    if (hours > 0.999) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Format date
export function formatDate(date, format = 'short') {
    const options = format === 'long'
        ? { year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

// Format number with commas
export function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Truncate text >> Ahmed Ossama >> ahmed...
export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

// Get initials from name
export function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {//Ahmed Ossama Mostafa >> AO
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();//Ahmed >> AH
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate random color (for avatars)
export function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
}

// Calculate rating percentage
export function calculateRatingPercentage(rating, maxRating = 5) {
    return (rating / maxRating) * 100;
}

// Group array by key
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

// Sleep utility (for demos)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Validate email >> maybe wont be used (will use formik)
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get course level label
export function getCourseLevelLabel(level) {
    const levels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        "all levels": 'All Levels',
    };
    return levels[level] || level;
}

// Get course level color >> for cards and course page header
export function getCourseLevelColor(level) {
    const colors = {
        beginner: 'bg-green-100 text-green-800',
        intermediate: 'bg-blue-100 text-blue-800',
        advanced: 'bg-purple-100 text-purple-800',
        all: 'bg-gray-100 text-gray-800',
    };
    return colors[level] || colors.all;
}

// Check if course is on sale
export function isOnSale(course) {
    return course.discount > 0 && course.price > 0;
}

// Get final price
export function getFinalPrice(course) {
    return isOnSale(course) ? course.price - (course.price * course.discount )/ 100 : course.price;
}