import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  iconUrl: '',
};

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditId(category._id);
    setForm({
      name: category.name || '',
      iconUrl: category.iconUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      iconUrl: form.iconUrl.trim(),
    };

    if (!payload.name) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        const { data } = await API.put(`/categories/${editId}`, payload);
        setCategories((prev) => prev.map((category) => (category._id === editId ? data : category)));
        toast.success('Category updated');
      } else {
        const { data } = await API.post('/categories', payload);
        setCategories((prev) => [data, ...prev]);
        toast.success('Category added');
      }

      setForm(initialForm);
      setEditId(null);
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;

    try {
      await API.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((category) => category._id !== id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Category Management</h2>
        <button
          onClick={openCreate}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl px-4 py-2 text-sm font-medium hover:shadow-md transition-all"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 dark:bg-gray-900 text-gray-500 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Icon</th>
                  <th className="px-6 py-4 text-left font-medium">Name</th>
                  <th className="px-6 py-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-6 py-4">
                      <div className="h-10 w-10 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                        {category.iconUrl ? (
                          <img
                            src={category.iconUrl}
                            alt={category.name}
                            className="h-7 w-7 object-contain"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                            {category.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-100 font-medium">{category.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="px-3 py-1.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                      No categories yet. Add your first featured category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/30 bg-white/80 dark:bg-gray-900/80 dark:border-gray-700/60 shadow-xl backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Smartphones"
                  className="w-full rounded-xl border border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Icon URL</label>
                <input
                  type="url"
                  value={form.iconUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, iconUrl: e.target.value }))}
                  placeholder="https://example.com/icon.svg"
                  className="w-full rounded-xl border border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-gray-100 dark:border-gray-700 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
