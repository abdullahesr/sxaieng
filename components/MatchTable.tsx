import React from 'react';
import { MatchPrediction } from '../types';

interface MatchTableProps {
  predictions: MatchPrediction[];
}

const MatchTable: React.FC<MatchTableProps> = ({ predictions }) => {
  if (predictions.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-4">No popular matches found for today.</p>
    );
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 mt-6">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <tr>
            <th scope="col" className="px-2 py-3 text-left text-xs sm:px-4 sm:text-sm font-medium uppercase tracking-wider">
              Match
            </th>
            <th scope="col" className="px-2 py-3 text-left text-xs sm:px-4 sm:text-sm font-medium uppercase tracking-wider">
              Prediction
            </th>
            <th scope="col" className="px-2 py-3 text-left text-xs sm:px-4 sm:text-sm font-medium uppercase tracking-wider">
              Popularity
            </th>
            <th scope="col" className="px-2 py-3 text-left text-xs sm:px-4 sm:text-sm font-medium uppercase tracking-wider">
              Form
            </th>
            <th scope="col" className="px-2 py-3 text-left text-xs sm:px-4 sm:text-sm font-medium uppercase tracking-wider">
              Short Comment
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {predictions.map((p, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-2 py-4 text-sm sm:px-4 sm:text-base font-medium text-gray-900 break-words">
                {p.match}
              </td>
              <td className="px-2 py-4 text-sm sm:px-4 sm:text-base text-gray-700 break-words">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                  {p.prediction}
                </span>
              </td>
              <td className="px-2 py-4 text-sm sm:px-4 sm:text-base text-gray-700 break-words">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium ${parseInt(p.popularity, 10) > 60 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.popularity}
                </span>
              </td>
              <td className="px-2 py-4 text-sm sm:px-4 sm:text-base text-gray-700 break-words">
                {p.form}
              </td>
              <td className="px-2 py-4 text-sm sm:px-4 sm:text-base text-gray-700 break-words">
                {p.comment}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;