export default function AIInsights({ expenses, savingsGoal, salary }) {
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentBalance = salary - totalSpending;

  const categorySpending = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const [topCategoryName, topCategoryAmount] = Object.entries(categorySpending).reduce(
    (max, [category, amount]) => (amount > max[1] ? [category, amount] : max),
    ['', 0]
  );

  const simpleAdvice = currentBalance < 0
    ? `You're overspending by ₹${Math.abs(currentBalance).toFixed(2)}. Reduce ${topCategoryName || 'your top category'} this week.`
    : savingsGoal > 0 && currentBalance >= savingsGoal
      ? `Great progress! You are on track for your ₹${savingsGoal.toFixed(2)} goal.`
      : `Keep a close eye on ${topCategoryName || 'your spending categories'} to improve monthly savings.`;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Financial Insights</h2>
      <div className="space-y-3">
        <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-md">
          <p className="text-indigo-700 font-semibold text-sm">Total Spending</p>
          <p className="text-indigo-600 text-sm mt-1">₹{totalSpending.toFixed(2)} this month.</p>
        </div>

        <div className={`p-4 rounded-md border-l-4 ${currentBalance >= 0 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
          <p className={`font-semibold text-sm ${currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>💰 Current Balance</p>
          <p className={`text-sm mt-1 ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Math.abs(currentBalance).toFixed(2)} {currentBalance >= 0 ? 'available' : 'overspent'}
          </p>
        </div>

        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
          <p className="text-blue-700 font-semibold text-sm">Top Category</p>
          <p className="text-blue-600 text-sm mt-1">
            {topCategoryName ? `${topCategoryName} at ₹${topCategoryAmount.toFixed(2)}` : 'Add expenses to see your top category.'}
          </p>
        </div>

        <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-md">
          <p className="text-purple-700 font-semibold text-sm">Simple Advice</p>
          <p className="text-purple-600 text-sm mt-1">{simpleAdvice}</p>
        </div>
      </div>
    </div>
  );
}
