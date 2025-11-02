import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-10">
      <img
        src="https://media.lordicon.com/icons/wired/gradient/2512-artificial-intelligence-ai-alt.gif"
        alt="SxAI Logo"
        className="h-20 w-20 mb-4" // Adjust size as needed, removed animate-spin
      />
      <p className="text-gray-700 text-lg">Fetching data, please wait...</p>
    </div>
  );
};

export default LoadingSpinner;