const presetCategories = ['All', 'Makeup', 'Skin', 'Hair', 'Electronics', 'Gadgets', 'Offers'];

const CategoryChips = ({ categories = [], activeCategory, onChange }) => {
  const merged = Array.from(new Set([...presetCategories, ...categories]));

  return (
    <div className="overflow-x-auto whitespace-nowrap py-3">
      <div className="inline-flex items-center gap-2 min-w-max">
        {merged.map((category) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeCategory === category
                ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-400'
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
