import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image: '',
  imageUrls: ['', '', '', ''],
  category: '',
  stock: '',
  additionalInfo: [],
};

const normalizeAdditionalInfo = (input) => {
  if (Array.isArray(input)) {
    return input
      .map((item) => ({
        label: typeof item?.label === 'string' ? item.label : '',
        value: typeof item?.value === 'string' ? item.value : '',
      }))
      .filter((item) => item.label.trim() || item.value.trim());
  }

  if (input && typeof input === 'object') {
    return Object.entries(input)
      .map(([label, value]) => ({
        label: String(label || '').trim(),
        value: String(value || '').trim(),
      }))
      .filter((item) => item.label || item.value);
  }

  return [];
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 8;
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async (page = currentPage) => {
    try {
      const { data } = await API.get(`/products?page=${page}&limit=${itemsPerPage}`);
      const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
      const pages = Number(data?.pages) || 1;
      const total = Number(data?.total) || list.length;

      setProducts(list);
      setTotalPages(Math.max(1, pages));
      setTotalProducts(total);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      imageUrls: (() => {
        const base = Array(4).fill('');
        const source = Array.isArray(product.images) && product.images.length
          ? product.images
          : product.image
            ? [product.image]
            : [];
        source.slice(0, 4).forEach((url, idx) => {
          base[idx] = url;
        });
        return base;
      })(),
      category: product.category,
      stock: product.stock,
      additionalInfo: normalizeAdditionalInfo(product.additionalInfo),
    });
    setEditId(product._id);
    setShowModal(true);
  };

  const handleAdditionalInfoChange = (index, field, value) => {
    setForm((prev) => {
      const nextRows = [...(prev.additionalInfo || [])];
      nextRows[index] = {
        ...(nextRows[index] || { label: '', value: '' }),
        [field]: value,
      };

      return {
        ...prev,
        additionalInfo: nextRows,
      };
    });
  };

  const addAdditionalInfoRow = () => {
    setForm((prev) => ({
      ...prev,
      additionalInfo: [...(prev.additionalInfo || []), { label: '', value: '' }],
    }));
  };

  const removeAdditionalInfoRow = (index) => {
    setForm((prev) => ({
      ...prev,
      additionalInfo: (prev.additionalInfo || []).filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const cleanedImages = (form.imageUrls || [])
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 4);

    const primaryImage = cleanedImages[0] || String(form.image || '').trim();

    if (!primaryImage) {
      toast.error('Please provide at least one product image URL');
      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      image: primaryImage,
      images: cleanedImages,
      additionalInfo: (form.additionalInfo || [])
        .map((item) => ({
          label: String(item?.label || '').trim(),
          value: String(item?.value || '').trim(),
        }))
        .filter((item) => item.label && item.value),
    };

    try {
      if (editId) {
        await API.put(`/products/${editId}`, payload);
        toast.success('Product updated!');
        fetchProducts(currentPage);
      } else {
        await API.post('/products', payload);
        toast.success('Product created!');
        setCurrentPage(1);
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted!');

      if (products.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchProducts(currentPage);
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Product Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{totalProducts} items</p>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md h-64 animate-pulse" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-left">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=?'; }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white max-w-[200px] truncate">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? product.stock : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-xs hover:bg-yellow-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      No products found. Add your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'name', label: 'Product Name', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Images (3-4 URLs)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={`image-url-${index}`}
                      type="text"
                      value={form.imageUrls?.[index] || ''}
                      onChange={(e) => {
                        const next = [...(form.imageUrls || ['', '', '', ''])];
                        next[index] = e.target.value;
                        setForm((prev) => ({ ...prev, imageUrls: next }));
                      }}
                      placeholder={`Image URL ${index + 1}`}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (BDT)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Additional Info</h4>
                <div className="space-y-3">
                  {(form.additionalInfo || []).map((row, index) => (
                    <div key={`${index}-${row.label}`} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        type="text"
                        value={row.label || ''}
                        onChange={(e) => handleAdditionalInfoChange(index, 'label', e.target.value)}
                        placeholder="Field name (e.g. Processor)"
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={row.value || ''}
                        onChange={(e) => handleAdditionalInfoChange(index, 'value', e.target.value)}
                        placeholder="Field value"
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalInfoRow(index)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addAdditionalInfoRow}
                    className="inline-flex items-center rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                  >
                    + Add Info Row
                  </button>
                </div>
              </div>

              {((form.imageUrls || []).some((item) => item?.trim()) || form.image) && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Image Preview</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(form.imageUrls || [])
                      .map((item) => item?.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt="preview"
                          className="h-24 w-full object-cover rounded-lg"
                          onError={(e) => { e.target.src = 'https://placehold.co/160x96?text=Invalid+URL'; }}
                        />
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
