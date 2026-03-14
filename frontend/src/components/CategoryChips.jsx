const CategoryChips = ({ categories = [], activeCategory, onChange }) => {
  const dynamicCategories = Array.from(
    new Set(
      categories
        .map((category) => (typeof category === 'string' ? category : category?.name))
        .filter(Boolean)
    )
  );

  const specialPillClass = (category) => {
    const name = category.toLowerCase();
    if (name !== 'offers') return '';
    return activeCategory === category
      ? 'bg-pink-600 text-white'
      : 'bg-pink-500 text-white';
  };

  return (
    <div className="overflow-x-auto whitespace-nowrap py-0 bg-white dark:bg-gray-950">
      <div className="inline-flex items-center gap-6 min-w-max px-4 py-2">
        <button
          onClick={() => onChange('All')}
          className={`text-sm font-medium transition-colors rounded-full px-0 py-1 bg-transparent ${
            activeCategory === 'All' ? 'text-[#ff3366]' : 'text-gray-700 dark:text-gray-300 hover:text-[#ff3366]'
          }`}
        >
          All
        </button>

        {dynamicCategories.map((category) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`text-sm font-medium transition-colors rounded-full ${
              specialPillClass(category)
                ? `px-3 py-1 ${specialPillClass(category)}`
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
