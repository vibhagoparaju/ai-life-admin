import { INVESTMENT_CATEGORY } from '../utils/financeUtils';

export default function SummaryCard({ expenses, salary }) {
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = salary - totalSpending;

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

  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const topTwoTotal = sortedCategories.slice(0, 2).reduce((sum, [, amount]) => sum + amount, 0);
  const topTwoPercentage = totalSpending > 0 ? ((topTwoTotal / totalSpending) * 100).toFixed(1) : 0;
  const spendingIncomeRatio = salary > 0 ? ((totalSpending / salary) * 100).toFixed(1) : null;
  const investmentSpending = expenses
    .filter((expense) => expense.category === INVESTMENT_CATEGORY)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const investmentPercentage = totalSpending > 0 ? ((investmentSpending / totalSpending) * 100).toFixed(1) : 0;

  // Calculate key metrics
  const totalCategories = Object.keys(categoryBreakdown).length;
  const avgPerCategory = totalSpending > 0 ? (totalSpending / totalCategories).toFixed(2) : 0;

  return (
    <div>
      {/* Monthly Report Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Monthly Report</h2>
        <p className="text-xs text-gray-500 mb-6">Your spending overview and insights</p>
        
        {/* Income & Balance Section */}
        {salary > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Total Balance</p>
              <p className="text-2xl font-bold text-green-600">₹{salary.toFixed(2)}</p>
            </div>
            <div className={`rounded-lg p-4 border ${remainingBalance >= 0 ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'}`}>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Remaining Balance</p>
              <p className={`text-2xl font-bold ${remainingBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{Math.abs(remainingBalance).toFixed(2)}</p>
              {remainingBalance < 0 && <p className="text-xs text-red-500 mt-1">Over budget</p>}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200 mb-6">
            <p className="text-gray-600 text-sm font-medium">Add your income to track balance</p>
            <p className="text-gray-400 text-xs mt-2">Set your monthly income above to see your remaining balance</p>
          </div>
        )}
        
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Spending vs Income</p>
                    <p className="text-lg font-bold text-indigo-700">
                      {spendingIncomeRatio !== null ? `${spendingIncomeRatio}%` : 'Set Income'}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      {spendingIncomeRatio !== null ? 'of your monthly income spent' : 'Add salary to unlock this metric'}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs font-medium text-orange-700 uppercase tracking-wide mb-1">Top 2 Categories</p>
                    <p className="text-lg font-bold text-orange-700">{topTwoPercentage}%</p>
                    <p className="text-xs text-orange-600 mt-1">combined share of total spending</p>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">Investment Share</p>
                    <p className="text-lg font-bold text-emerald-700">{investmentPercentage}%</p>
                    <p className="text-xs text-emerald-600 mt-1">₹{investmentSpending.toFixed(2)} allocated to investments</p>
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
                    {investmentSpending > 0 && (
                      <p className="text-sm text-gray-700 mb-2">
                        Investment category spending is <span className="font-semibold text-emerald-600">₹{investmentSpending.toFixed(2)}</span>
                      </p>
                    )}
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
