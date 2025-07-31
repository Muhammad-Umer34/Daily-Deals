import { useState } from 'react';

const FilterDropdown = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value) => {
    onChange(value);
    console.log("value : ",value );
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-xs mb-4">
      {/* Dropdown header */}
      <div
        className="flex items-center justify-between  py-2 text-lg font-medium text-gray-800  cursor-pointer"
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
        <div className="grid grid-cols-2 gap-2 bg-white  px-2 py-2 mt-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`text-center px-4 py-2 text-sm transition cursor-pointer ${
                selected === option
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
