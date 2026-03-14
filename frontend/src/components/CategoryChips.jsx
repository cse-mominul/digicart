const presetCategories = ['All', 'Makeup', 'Skin', 'Hair', 'Electronics', 'Gadgets', 'Offers'];

const CategoryChips = ({ categories = [], activeCategory, onChange }) => {
  const merged = Array.from(new Set([...presetCategories, ...categories]));

  const specialPillClass = (category, index) => {
    const name = category.toLowerCase();
    if (name !== 'offers' && name !== 'sales') return '';

    const vibrantPills = [
      'bg-pink-500 text-white',
      'bg-blue-500 text-white',
      'bg-purple-500 text-white',
    ];

    return vibrantPills[index % vibrantPills.length];
  };

  return (
    <div className="overflow-x-auto whitespace-nowrap py-0 bg-white dark:bg-gray-950">
      <div className="inline-flex items-center gap-6 min-w-max px-4 py-2">
        {merged.map((category, index) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`text-sm font-medium transition-colors rounded-full ${
              specialPillClass(category, index)
                ? `px-3 py-1 ${specialPillClass(category, index)}`
                : `px-0 py-1 bg-transparent ${activeCategory === category ? 'text-[#ff3366]' : 'text-gray-700 dark:text-gray-300 hover:text-[#ff3366]'}`
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryChips;
