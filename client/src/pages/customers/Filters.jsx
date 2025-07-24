import { useState } from 'react';

const FilterDropdown = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value) => {
    onChange(value);  
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xs">
      <div
        className="w-full rounded-md overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between px-3 py-2 text-lg font-medium text-gray-800 bg-white border border-gray-300 cursor-pointer">
          {label}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <div className={`grid grid-cols-2 gap-1 bg-white border-x border-b border-gray-300 ${isOpen ? 'block' : 'hidden'}`}>
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option.value)}
              className={`text-center px-4 py-2 text-sm m-1 rounded-md ${
                selected === option.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;
