'use client';

import Link from 'next/link';
import { FiBook, FiUsers, FiEdit, FiEye, FiTrash, FiUpload } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { formatPrice, formatNumber } from '@/lib/utils';

export default function InstructorCourseCard({ course, editHref, viewHref, onTogglePublish, onDelete, loading = false }) {
    const id = course.id ?? course._id;
    const title = course.title;
    const thumbnail =  course.thumbnail?.url || null;
    const students = course.studentsCount ?? (course.students ? course.students.length : 0) ?? course.students ?? 0;
    const rating = (course.rating ?? 0);
    const price = course.price ?? 0;
    const revenue = course.revenue ?? ((price ?? 0) * (students ?? 0));
    const status = course.status ?? 'draft';

    return (
        <div className="glass rounded-xl overflow-hidden hover-lift">
            <div className="aspect-video bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnail} alt={title} className="object-cover w-full h-full" />
                ) : (
                    <FiBook className="w-12 h-12 text-white/50" />
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">{title}</h3>

                <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4 text-gray-500" />
                        <span>{formatNumber(students)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <AiFillStar className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{rating.toFixed ? rating.toFixed(1) : rating}</span>
                    </div>
                    <div className="font-semibold text-primary-500">{formatPrice(price)}</div>
                    <div className="font-semibold text-primary-500">{formatPrice(revenue)}</div>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {status}
                    </span>

                    <div className="flex items-center space-x-2">
                        {editHref && (
                            <Link href={editHref} className="p-2 hover:bg-gray-500/10 rounded-lg transition-colors" title="Edit">
                                <FiEdit className="w-4 h-4" />
                            </Link>
                        )}

                        {viewHref && (
                            <Link href={viewHref} className="p-2 hover:bg-gray-500/10 rounded-lg transition-colors" title="View">
                                <FiEye className="w-4 h-4" />
                            </Link>
                        )}

                        {onTogglePublish && (
                            <button onClick={() => onTogglePublish(id, status)} disabled={loading} className="p-2 cursor-pointer hover:bg-gray-500/10 rounded-lg transition-colors" title={status === 'published' ? 'Unpublish' : 'Publish'}>
                                <FiUpload className="w-4 h-4" />
                            </button>
                        )}

                        {onDelete && (
                            <button onClick={() => onDelete(id)} disabled={loading} className="p-2 cursor-pointer hover:bg-red-500/10 rounded-lg transition-colors text-red-500" title="Delete">
                                <FiTrash className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
