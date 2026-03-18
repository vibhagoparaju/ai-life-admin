export default function SummaryCard({ expenses }) {
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate category-wise breakdown
  const categoryBreakdown = expenses.reduce((breakdown, expense) => {
    const category = expense.category;
    if (breakdown[category]) {
      breakdown[category] += expense.amount;
    } else {
      breakdown[category] = expense.amount;
    }
    return breakdown;
  }, {});

  // Find top category
  const topCategory = Object.entries(categoryBreakdown).reduce((max, [category, amount]) =>
    amount > max[1] ? [category, amount] : max,
    ['', 0]
  );

  const topCategoryName = topCategory[0];
  const topCategoryAmount = topCategory[1];
  const topCategoryPercentage = totalSpending > 0 ? ((topCategoryAmount / totalSpending) * 100).toFixed(1) : 0;

  // Calculate key metrics
  const totalCategories = Object.keys(categoryBreakdown).length;
  const avgPerCategory = totalSpending > 0 ? (totalSpending / totalCategories).toFixed(2) : 0;

  return (
    <div>
      {/* Monthly Report Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Monthly Report</h2>
        <p className="text-xs text-gray-500 mb-6">Your spending overview and insights</p>
        
        {/* If no expenses - show empty state */}
        {expenses.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-500 text-sm">No data for report yet</p>
            <p className="text-gray-400 text-xs mt-2">Add expenses to see your spending report</p>
          </div>
        ) : (
          <>
            {/* Total Spending - Main Focus */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-6 border border-indigo-200">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Spending This Month</p>
              <p className="text-4xl font-bold text-indigo-600">₹{totalSpending.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{expenses.length} transactions across {totalCategories} categories</p>
            </div>

            {/* Key Insights Summary */}
            {totalSpending > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Top Category Card */}
                  {topCategoryName && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Top Category</p>
                      <p className="text-lg font-bold text-gray-800">{topCategoryName}</p>
                      <p className="text-sm text-indigo-600 font-semibold mt-1">₹{topCategoryAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">{topCategoryPercentage}% of total</p>
                    </div>
                  )}

                  {/* Average Spending Card */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Avg Per Category</p>
                    <p className="text-lg font-bold text-gray-800">₹{avgPerCategory}</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">across {totalCategories} categories</p>
                  </div>
                </div>

                {/* Simple Summary Text */}
                {topCategoryName && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Top category: {topCategoryName}</span>
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      You spent <span className="font-semibold text-indigo-600">{topCategoryPercentage}%</span> on {topCategoryName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Your spending is mostly focused on <span className="font-semibold">{topCategoryName}</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Category Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([category, amount]) => {
              const percentage = totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(1) : 0;
              return (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition duration-200"
                >
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700 text-sm">{category}</span>
                      <span className="font-semibold text-indigo-600 text-sm">₹{amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
