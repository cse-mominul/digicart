import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const emptyAddress = {
  label: '',
  city: '',
  area: '',
  address: '',
  phone: '',
};

const ShippingAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);

  const canAdd = useMemo(
    () => form.label.trim() && form.city.trim() && form.area.trim() && form.address.trim() && form.phone.trim(),
    [form]
  );

  const handleAddAddress = (e) => {
    e.preventDefault();

    if (!canAdd) {
      toast.error('Please fill in all address fields');
      return;
    }

    setAddresses((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    setForm(emptyAddress);
    toast.success('Address added');
  };

  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    toast.success('Address removed');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shipping Address</h1>

        <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Label (Home/Office)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            placeholder="Area"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <textarea
            placeholder="Full Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            className="sm:col-span-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            className="sm:col-span-2 justify-self-start bg-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
          >
            Add Address
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Saved Addresses</h2>

        {addresses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No address added yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{item.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.phone}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.area}, {item.city}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.address}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingAddress;
