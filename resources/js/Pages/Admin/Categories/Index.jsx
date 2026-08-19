import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, ListTree, ChevronDown, ChevronRight, X } from 'lucide-react';

// Recursive category tree item
const CategoryItem = ({ category, onEdit, onDelete, level = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className="w-full">
            <div className={`flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 ${level === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                    {hasChildren ? (
                        <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    ) : (
                        <div className="w-6" /> // spacer
                    )}
                    <span className="font-medium text-gray-900">{category.name}</span>
                    {!category.is_active && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] uppercase font-bold rounded">Hidden</span>
                    )}
                </div>
                <div className="flex items-center gap-2 pr-2">
                    <button onClick={() => onEdit(category)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(category.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            
            {expanded && hasChildren && (
                <div className="w-full">
                    {category.children.map(child => (
                        <CategoryItem 
                            key={child.id} 
                            category={child} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            level={level + 1} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function CategoriesIndex({ categories, allCategories }) {
    const { flash, errors } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset, clearErrors } = useForm({
        name: '',
        parent_id: '',
        icon: '',
        is_active: true,
    });

    const openModal = (category = null) => {
        clearErrors();
        if (category) {
            setEditingCategory(category);
            setData({
                name: category.name,
                parent_id: category.parent_id ? String(category.parent_id) : '',
                icon: category.icon || '',
                is_active: category.is_active,
            });
        } else {
            setEditingCategory(null);
            setData({
                name: '',
                parent_id: '',
                icon: '',
                is_active: true,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => reset(), 200);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/admin/categories/${editingCategory.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/categories', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category? Note: Categories with assigned products cannot be deleted.')) {
            destroy(`/admin/categories/${id}`);
        }
    };

    return (
        <>
            <Head title="Categories" />
            <AdminLayout title="Product Categories">
                
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500">Manage the product taxonomy tree.</p>
                    <button 
                        onClick={() => openModal()}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm shadow-sm"
                    >
                        <Plus size={16} /> Add Category
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {errors?.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                        {errors.error}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 text-gray-700 font-semibold">
                        <ListTree size={18} /> Category Structure
                    </div>
                    
                    {categories.length > 0 ? (
                        <div className="w-full">
                            {categories.map(category => (
                                <CategoryItem 
                                    key={category.id} 
                                    category={category} 
                                    onEdit={openModal} 
                                    onDelete={handleDelete} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <p>No categories defined yet.</p>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                    <select 
                                        value={data.parent_id}
                                        onChange={e => setData('parent_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                                    >
                                        <option value="">-- None (Top Level) --</option>
                                        {allCategories.map(cat => (
                                            <option 
                                                key={cat.id} 
                                                value={String(cat.id)}
                                                disabled={editingCategory && (Number(cat.id) === Number(editingCategory.id) || Number(cat.id) === Number(editingCategory.parent_id))}
                                            >
                                                {cat.parent_id ? '— ' : ''}{cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <p className="mt-1 text-xs text-red-600">{errors.parent_id}</p>}
                                </div>

                                {editingCategory && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <input 
                                            type="checkbox" 
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={e => setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-slate-600 rounded border-gray-300 focus:ring-slate-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">Category is Active (Visible)</label>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                                    <button 
                                        type="button" 
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </AdminLayout>
        </>
    );
}
