export default function ExpenseList({ expenses }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-sm font-medium mb-1">Start tracking your expenses to get insights</p>
        <p className="text-gray-400 text-xs">Add your first expense to see it appear here</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Transaction History</h2>
      <div className="overflow-x-auto">
        <ul className="divide-y divide-gray-200">
          {expenses.map((expense, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-4 hover:bg-gray-50 transition duration-200"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-700 block">{expense.category}</span>
                {expense.timestamp && (
                  <span className="text-xs text-gray-500 mt-1">
                    {formatTime(expense.timestamp)}
                  </span>
                )}
              </div>
              <span className="font-semibold text-indigo-600">₹{expense.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
