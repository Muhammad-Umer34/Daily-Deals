import { useState } from 'react';

const FilterDropdown = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isColorDropdown = label.toLowerCase() === 'color';

  const handleOptionClick = (value) => {
    onChange(value);
    console.log("value : ",value );
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-xs mb-4">
      {/* Dropdown header */}
      <div
        className="flex items-center justify-between  py-2 text-lg font-medium text-gray-800 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div
          className={`grid ${
            isColorDropdown ? 'grid-cols-5' : 'grid-cols-2'
          } gap-2 px-2 py-2 mt-2 bg-white`}
        >
          {options.map((option, index) => {
            const color =
              isColorDropdown && typeof option === 'string'
                ? option.toLowerCase()
                : null;

            const isSelected = selected === option;

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`transition duration-150 shadow ${
                  isSelected
                    ? isColorDropdown
                      ? 'ring-2 ring-offset-2 ring-blue-600'
                      : 'bg-blue-100 text-blue-800 font-semibold'
                    : isColorDropdown
                      ? 'ring-1 ring-gray-300'
                      : 'bg-gray-100 text-gray-800'
                } ${isColorDropdown ? 'w-10 h-10 rounded-full' : 'text-center px-4 py-2 text-sm rounded-md'}`}
                style={{
                  backgroundColor: color || undefined,
                }}
              >
                {!isColorDropdown && option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
