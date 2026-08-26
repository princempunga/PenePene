import React, { useState, useRef, useEffect } from 'react';
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

/**
 * Select / Input combo for the "Catégorie" field:
 * pick an existing top-level category from the dropdown list,
 * or type a brand-new parent category name freehand.
 */
const CategoryCombobox = ({ id, options, value, onChange, placeholder, error }) => {
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const wrapperRef = useRef(null);

    const query = value.trim().toLowerCase();
    const matches = query
        ? options.filter(option => option.name.toLowerCase().includes(query))
        : options;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectOption = (option) => {
        onChange(option.name);
        setOpen(false);
        setHighlightIndex(-1);
    };

    const handleKeyDown = (event) => {
        if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            setOpen(true);
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightIndex(index => Math.min(index + 1, matches.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightIndex(index => Math.max(index - 1, 0));
        } else if (event.key === 'Enter' && open && highlightIndex >= 0 && matches[highlightIndex]) {
            event.preventDefault();
            selectOption(matches[highlightIndex]);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={event => {
                        onChange(event.target.value);
                        setOpen(true);
                        setHighlightIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-slate-500 outline-none ${error ? 'border-red-400' : 'border-gray-300'}`}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setOpen(isOpen => !isOpen)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                    <ChevronDown size={16} />
                </button>
            </div>

            {open && matches.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                    {matches.map((option, index) => (
                        <li key={option.id}>
                            <button
                                type="button"
                                onClick={() => selectOption(option)}
                                onMouseEnter={() => setHighlightIndex(index)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${index === highlightIndex ? 'bg-slate-100 text-slate-900' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {option.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {open && query !== '' && matches.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-xs text-gray-400">
                    No existing category — it will be created on save.
                </div>
            )}
        </div>
    );
};

export default function CategoriesIndex({ categories, allCategories }) {
    const { flash, errors } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const topLevelCategories = allCategories.filter(cat => cat.parent_id === null);

    // Simplified "add" form: parent category (combo) + optional subcategory.
    // `name` carries the freehand parent name, `category_id` the picked one.
    const addForm = useForm({
        name: '',
        subcategory_name: '',
    });

    // Full form kept for editing an existing category.
    const editForm = useForm({
        name: '',
        parent_id: '',
        icon: '',
        is_active: true,
    });

    const openAddModal = () => {
        addForm.clearErrors();
        addForm.reset();
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        editForm.clearErrors();
        editForm.setData({
            name: category.name,
            parent_id: category.parent_id ? String(category.parent_id) : '',
            icon: category.icon || '',
            is_active: category.is_active,
        });
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            addForm.reset();
            editForm.reset();
        }, 200);
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();
        addForm.clearErrors();

        const trimmed = addForm.data.name.trim();
        // Exact match against an existing top-level category: its ID will be
        // reused instead of duplicating it. Otherwise the freehand name is
        // sent and the backend creates the parent category.
        const match = topLevelCategories.find(
            cat => cat.name.toLowerCase() === trimmed.toLowerCase()
        );

        // Client-side guard: nothing to save without a picked or typed category.
        if (!match && trimmed === '') {
            addForm.setError('name', 'Veuillez choisir une catégorie existante ou saisir un nouveau nom.');
            return;
        }

        const payload = {
            category_id: match ? match.id : '',
            name: match ? '' : trimmed,
            subcategory_name: addForm.data.subcategory_name.trim(),
        };

        addForm.transform(() => payload).post('/admin/categories', {
            onSuccess: () => closeModal(),
        });
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();
        editForm.put(`/admin/categories/${editingCategory.id}`, {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category? Note: Categories with assigned products cannot be deleted.')) {
            editForm.delete(`/admin/categories/${id}`);
        }
    };

    return (
        <>
            <Head title="Categories" />
            <AdminLayout title="Product Categories">

                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500">Manage the product taxonomy tree.</p>
                    <button
                        onClick={openAddModal}
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
                                    onEdit={openEditModal}
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
                                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {!editingCategory ? (
                                /* ── Simplified add interface ─────────────────────────── */
                                <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Catégorie
                                        </label>
                                        <CategoryCombobox
                                            id="category"
                                            options={topLevelCategories}
                                            value={addForm.data.name}
                                            onChange={value => addForm.setData('name', value)}
                                            placeholder="Ex : Électronique"
                                            error={addForm.errors.name}
                                        />
                                        {(addForm.errors.name || addForm.errors.category_id) && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {addForm.errors.name || addForm.errors.category_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="subcategory_name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Sous-catégorie (facultatif)
                                        </label>
                                        <input
                                            id="subcategory_name"
                                            type="text"
                                            value={addForm.data.subcategory_name}
                                            onChange={e => addForm.setData('subcategory_name', e.target.value)}
                                            placeholder="Ex : Téléphones"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Si la catégorie existe déjà, la sous-catégorie lui sera ajoutée.
                                        </p>
                                        {addForm.errors.subcategory_name && (
                                            <p className="mt-1 text-xs text-red-600">{addForm.errors.subcategory_name}</p>
                                        )}
                                    </div>

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
                                            disabled={addForm.processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50"
                                        >
                                            {addForm.processing ? 'Saving...' : 'Save Category'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* ── Edit form (existing behaviour) ───────────────────── */
                                <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editForm.data.name}
                                            onChange={e => editForm.setData('name', e.target.value)}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                        />
                                        {editForm.errors.name && <p className="mt-1 text-xs text-red-600">{editForm.errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                        <select
                                            name="parent_id"
                                            value={editForm.data.parent_id}
                                            onChange={e => editForm.setData('parent_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                                        >
                                            <option value="">-- None (Top Level) --</option>
                                            {allCategories
                                                .filter(cat => cat.parent_id === null)
                                                .filter(cat => !editingCategory || Number(cat.id) !== Number(editingCategory.id))
                                                .map(cat => (
                                                    <option key={cat.id} value={String(cat.id)}>
                                                        {cat.name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        {editForm.errors.parent_id && <p className="mt-1 text-xs text-red-600">{editForm.errors.parent_id}</p>}
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={editForm.data.is_active}
                                            onChange={e => editForm.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-slate-600 rounded border-gray-300 focus:ring-slate-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">Category is Active (Visible)</label>
                                    </div>

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
                                            disabled={editForm.processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50"
                                        >
                                            {editForm.processing ? 'Saving...' : 'Save Category'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

            </AdminLayout>
        </>
    );
}
