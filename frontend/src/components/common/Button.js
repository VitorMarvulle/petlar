const Button = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="w-full bg-red-400 text-white font-bold py-3 px-4 rounded-lg border-2 border-gray-800 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
    >
      {children}
    </button>
  );
};

export default Button;