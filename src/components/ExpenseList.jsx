export default function ExpenseList({ expenses }) {
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
              <span className="font-medium text-gray-700">{expense.category}</span>
              <span className="font-semibold text-indigo-600">₹{expense.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
