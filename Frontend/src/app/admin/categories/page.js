'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFolder, FiX, FiCornerDownRight } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import useAuthStore from "@/store/authStore";
import { categoryAPI } from "@/lib/api";
import useConfirmModal from "@/hooks/useConfirmModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function CategoriesPage() {
    const { user, isReady } = useAuthStore();
    const { isOpen, config, openConfirm, closeConfirm, handleConfirm } = useConfirmModal();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', parent: '' });

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const res = await categoryAPI.getAll();
            setCategories(res.data?.data || res.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isReady && user?.role === 'admin') {
            fetchCategories();
        }
    }, [isReady, user, fetchCategories]);

    const sortedCategories = useMemo(() => {
        if (!categories.length) return [];

        const flatten = (list, level = 0) => {
            let result = [];
            list.forEach(node => {
                result.push({ ...node, level });
                if (node.subCategories?.length > 0) {
                    result = result.concat(flatten(node.subCategories, level + 1));
                }
            });
            return result;
        };

        const flatList = flatten(categories);

        if (searchQuery) {
            return flatList.filter(cat =>
                cat.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return flatList;
    }, [categories, searchQuery]);

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                parent: category.parent?._id || category.parent || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', parent: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '', parent: '' });
        setEditingCategory(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Category name is required");

        setModalLoading(true);
        try {
            const payload = {
                ...formData,
                parent: formData.parent === '' ? null : formData.parent
            };

            if (editingCategory) {
                await categoryAPI.update(editingCategory._id || editingCategory.id, payload);
                toast.success("Category updated successfully");
            } else {
                await categoryAPI.create(payload);
                toast.success("Category created successfully");
            }

            await fetchCategories();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        openConfirm({
            title: "Delete Category",
            message: "Deleting a parent category will delete all its subcategories. Are you sure you want to delete this category?",
            confirmText: "Delete",
            type: "danger",
            onConfirm: async () => {
                try {
                    await categoryAPI.delete(id);
                    toast.success("Category deleted");
                    fetchCategories();
                } catch (error) {
                    toast.error("Failed to delete category");
                }
            }
        });
    };

    if (!isReady) return null;

    return (
        <DashboardLayout role="admin">
            <div className="pb-4 pt-1 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-500">Manage course categories hierarchy</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200"
                    >
                        <FiPlus className="text-lg" /> Add Category
                    </button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <FiSearch className="text-gray-400 text-xl ml-2" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <AiOutlineLoading3Quarters className="animate-spin text-3xl text-indigo-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold ">Name</th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedCategories.length > 0 ? (
                                        sortedCategories.map((cat) => (
                                            <tr key={cat._id || cat.id} className="hover:bg-gray-100 transition-colors group capitalize">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3" style={{ paddingLeft: searchQuery ? 0 : `${(cat.level || 0) * 15}px` }}>
                                                        {cat.level > 0 && !searchQuery && (
                                                            <span className="text-gray-300 mr-1 text-lg">└─</span>
                                                        )}
                                                        <div className="w-10 h-10 rounded-lg  text-indigo-600 flex items-center justify-center shrink-0">
                                                            <FiFolder size={20} />
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium ${cat.level > 0 ? 'text-gray-700' : 'text-gray-900'}`}>
                                                                {cat.name}
                                                            </p>
                                                            {!searchQuery && cat.level === 0 && (
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Parent</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* delet / edit Btns */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button
                                                            onClick={() => openModal(cat)}
                                                            className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <FiEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(cat._id || cat.id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-12 text-center text-gray-500">
                                                No categories found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in ">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden ">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h3>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="e.g. React.js"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                <div className="relative">
                                    <select
                                        value={formData.parent}
                                        onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white appearance-none cursor-pointer capitalize"
                                    >
                                        <option value="">No Parent (Top Level)</option>
                                        {categories
                                            .filter(c => c._id !== editingCategory?._id)
                                            .map(cat => (
                                                <option key={cat._id} value={cat._id}>
                                                    {(cat?.name)|| ''}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <FiCornerDownRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Select a parent to make this a sub-category.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Brief description..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2">
                                    {modalLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : (editingCategory ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
            isOpen={isOpen} 
            onClose={closeConfirm} 
            {...config} 
            onConfirm={handleConfirm} />
        </DashboardLayout>
    );
}