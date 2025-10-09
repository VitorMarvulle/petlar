const Input = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full px-4 py-3 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 focus:outline-none"
      />
    </div>
  );
};

export default Input;