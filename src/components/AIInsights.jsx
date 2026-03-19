import { INVESTMENT_CATEGORY } from '../utils/financeUtils';

export default function AIInsights({ expenses, savingsGoal, salary }) {
  // Calculate total spending
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // If no expenses, show empty state with assistant message
  if (expenses.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Finance Assistant</h2>
        <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-md mb-4">
          <p className="text-indigo-700 font-medium text-sm leading-relaxed">
            Start tracking to get daily updates
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm font-medium mb-1">Add your first expense to begin</p>
          <p className="text-gray-400 text-xs">I'll provide personalized insights and advice</p>
        </div>
      </div>
    );
  }

  // Group expenses by category
  const categorySpending = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  // Calculate percentage for each category
  const categoryPercentages = Object.entries(categorySpending).reduce((acc, [category, amount]) => {
    const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
    acc[category] = {
      amount,
      percentage: percentage.toFixed(1)
    };
    return acc;
  }, {});

  // Find top spending category
  const topCategory = Object.entries(categorySpending).reduce((max, [category, amount]) =>
    amount > max[1] ? [category, amount] : max,
    ['', 0]
  );

  const topCategoryName = topCategory[0];
  const topCategoryAmount = topCategory[1];
  const topCategoryPercentage = categoryPercentages[topCategoryName]?.percentage || 0;

  const investmentSpending = expenses
    .filter((expense) => expense.category === INVESTMENT_CATEGORY)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const investmentPercentage = totalSpending > 0
    ? ((investmentSpending / totalSpending) * 100).toFixed(1)
    : '0.0';

  const investmentSubcategorySpending = expenses
    .filter((expense) => expense.category === INVESTMENT_CATEGORY)
    .reduce((acc, expense) => {
      const subcategory = expense.subcategory || INVESTMENT_CATEGORY;
      acc[subcategory] = (acc[subcategory] || 0) + expense.amount;
      return acc;
    }, {});

  const topInvestment = Object.entries(investmentSubcategorySpending).reduce(
    (max, [subcategory, amount]) => (amount > max[1] ? [subcategory, amount] : max),
    ['', 0]
  );

  // Calculate potential savings (20% reduction)
  const potentialSavings = (topCategoryAmount * 0.2).toFixed(2);

  // Find top categories for deeper analysis
  const sortedCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1]);

  const topCategoriesNames = sortedCategories.slice(0, 3).map(([name]) => name);
  const topTwoCategories = sortedCategories.slice(0, 2);
  const topTwoCombinedAmount = topTwoCategories.reduce((sum, [, amount]) => sum + amount, 0);
  const topTwoCombinedPercentage = totalSpending > 0
    ? ((topTwoCombinedAmount / totalSpending) * 100).toFixed(1)
    : 0;

  const topCategoriesCombinedAmount = sortedCategories.slice(0, 3).reduce((sum, [, amount]) => sum + amount, 0);
  const topCategoriesCombinedPercentage = totalSpending > 0 
    ? ((topCategoriesCombinedAmount / totalSpending) * 100).toFixed(1) 
    : 0;

  const spendingIncomeRatio = salary > 0 ? ((totalSpending / salary) * 100).toFixed(1) : null;
  const savingsRate = salary > 0 ? (((salary - totalSpending) / salary) * 100).toFixed(1) : null;

  // Detect spending trend (recent vs earlier)
  let trendMessage = "";
  let trendColor = "blue";
  if (expenses.length >= 2) {
    const midpoint = Math.ceil(expenses.length / 2);
    const recentExpenses = expenses.slice(midpoint);
    const earlierExpenses = expenses.slice(0, midpoint);
    
    const recentAverage = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / recentExpenses.length;
    const earlierAverage = earlierExpenses.reduce((sum, exp) => sum + exp.amount, 0) / earlierExpenses.length;
    
    const percentageChange = ((recentAverage - earlierAverage) / earlierAverage) * 100;
    
    if (percentageChange > 10) {
      trendMessage = "Your spending is increasing recently. Try to control expenses before it grows further.";
      trendColor = "red";
    } else if (percentageChange < -10) {
      trendMessage = "Great work! You are improving your spending habits. Keep it up!";
      trendColor = "green";
    } else {
      trendMessage = "Your spending pattern is stable. Consistency is key to financial health.";
      trendColor = "blue";
    }
  }

  // Build insights
  const insights = [];

  // Daily Finance Assistant greeting (featured first card)
  const assistantGreeting = salary > 0
    ? "Hello! Your income is ₹" + salary.toFixed(2) + " and you've spent ₹" + totalSpending.toFixed(2) + " so far, leaving ₹" + (salary - totalSpending).toFixed(2) + " remaining. Mostly spent on " + topCategoryName + "."
    : "Hello! You've spent ₹" + totalSpending.toFixed(2) + " so far, mostly on " + topCategoryName + ". " + 
    (savingsGoal > 0 && totalSpending > savingsGoal 
      ? "Try reducing " + topCategoryName + " to stay within your ₹" + savingsGoal.toFixed(2) + " goal."
      : savingsGoal > 0 
      ? "You're on track with your ₹" + savingsGoal.toFixed(2) + " goal—great work!"
      : "Keep tracking to reach your financial goals.");

  insights.push(
    <div key="daily-assistant" className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-md shadow-sm">
      <p className="text-indigo-700 text-sm leading-relaxed font-medium">{assistantGreeting}</p>
    </div>
  );

  // Insight 1: Total spending with advice
  if (totalSpending > 10000) {
    insights.push(
      <div key="spending-advice" className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
        <p className="text-red-700 font-semibold text-sm">High Spending Alert</p>
        <p className="text-red-600 text-sm mt-1">You are spending a lot this month (₹{totalSpending.toFixed(2)}). Try reducing expenses to improve your savings.</p>
      </div>
    );
  } else {
    insights.push(
      <div key="spending-advice" className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-md">
        <p className="text-indigo-700 font-semibold text-sm">Total Spending</p>
        <p className="text-indigo-600 text-sm mt-1">You have spent ₹{totalSpending.toFixed(2)} across {Object.keys(categorySpending).length} categories</p>
      </div>
    );
  }

  // Insight 1.5: Spending evaluation
  let evaluationMessage = "";
  let evaluationColor = "blue";
  
  if (totalSpending < 5000) {
    evaluationMessage = "Your spending is well controlled. Great job managing your finances!";
    evaluationColor = "green";
  } else if (totalSpending >= 5000 && totalSpending <= 15000) {
    evaluationMessage = "Your spending is moderate. Keep tracking to maintain a healthy balance.";
    evaluationColor = "blue";
  } else {
    evaluationMessage = "Your spending is high. Consider reducing expenses in top categories to improve savings.";
    evaluationColor = "orange";
  }

  const bgColor = evaluationColor === "green" ? "bg-green-50" : evaluationColor === "orange" ? "bg-orange-50" : "bg-cyan-50";
  const borderColor = evaluationColor === "green" ? "border-green-400" : evaluationColor === "orange" ? "border-orange-400" : "border-cyan-400";
  const textColor = evaluationColor === "green" ? "text-green-700" : evaluationColor === "orange" ? "text-orange-700" : "text-cyan-700";
  const textBodyColor = evaluationColor === "green" ? "text-green-600" : evaluationColor === "orange" ? "text-orange-600" : "text-cyan-600";

  insights.push(
    <div key="spending-evaluation" className={`p-4 ${bgColor} border-l-4 ${borderColor} rounded-md`}>
      <p className={`${textColor} font-semibold text-sm`}>Spending Evaluation</p>
      <p className={`${textBodyColor} text-sm mt-1`}>{evaluationMessage}</p>
    </div>
  );

  // Insight 1.7: Savings goal tracking
  if (savingsGoal > 0) {
    const savingsAmount = savingsGoal - totalSpending;
    const canSave = savingsAmount >= 0;
    const goalBg = canSave ? "bg-green-50" : "bg-orange-50";
    const goalBorder = canSave ? "border-green-400" : "border-orange-400";
    const goalText = canSave ? "text-green-700" : "text-orange-700";
    const goalBody = canSave ? "text-green-600" : "text-orange-600";

    const goalMessage = canSave
      ? `You can still save ₹${savingsAmount.toFixed(2)} to meet your goal`
      : `You exceeded your goal by ₹${Math.abs(savingsAmount).toFixed(2)}`;

    const topCategoryName = Object.entries(categorySpending).reduce((max, [category, amount]) =>
      amount > max[1] ? [category, amount] : max,
      ['', 0]
    )[0];

    insights.push(
      <div key="savings-goal" className={`p-4 ${goalBg} border-l-4 ${goalBorder} rounded-md`}>
        <p className={`${goalText} font-semibold text-sm`}>Savings Goal Progress</p>
        <p className={`${goalBody} text-sm mt-1`}>Your goal: <span className="font-semibold">₹{savingsGoal.toFixed(2)}</span></p>
        <p className={`${goalBody} text-sm mt-1`}>{goalMessage}</p>
        {topCategoryName && !canSave && (
          <p className={`${goalBody} text-sm mt-2`}>Reduce spending in {topCategoryName} to meet your goal</p>
        )}
      </div>
    );
  } else {
    insights.push(
      <div key="savings-goal" className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded-md">
        <p className="text-gray-700 font-semibold text-sm">Savings Goal</p>
        <p className="text-gray-600 text-sm mt-1">Set a savings goal to track your progress and stay on target</p>
      </div>
    );
  }

  // Insight: Income and Remaining Balance
  if (salary > 0) {
    const remainingBalance = salary - totalSpending;
    const balanceColor = remainingBalance >= 0 ? "blue" : "red";
    const balanceBg = remainingBalance >= 0 ? "bg-blue-50" : "bg-red-50";
    const balanceBorder = remainingBalance >= 0 ? "border-blue-400" : "border-red-400";
    const balanceText = remainingBalance >= 0 ? "text-blue-700" : "text-red-700";
    const balanceBody = remainingBalance >= 0 ? "text-blue-600" : "text-red-600";

    insights.push(
      <div key="balance-tracking" className={`p-4 ${balanceBg} border-l-4 ${balanceBorder} rounded-md`}>
        <p className={`${balanceText} font-semibold text-sm`}>Income & Balance</p>
        <p className={`${balanceBody} text-sm mt-1`}>Monthly income: <span className="font-semibold">₹{salary.toFixed(2)}</span></p>
        <p className={`${balanceBody} text-sm mt-1`}>Remaining balance: <span className="font-semibold">₹{Math.abs(remainingBalance).toFixed(2)}</span></p>
        {remainingBalance < 0 && (
          <p className={`${balanceBody} text-sm mt-2`}>You've exceeded your income by ₹{Math.abs(remainingBalance).toFixed(2)}. Consider increasing savings.</p>
        )}
      </div>
    );

  }

  insights.push(
    <div key="financial-health-summary" className="p-4 bg-violet-50 border-l-4 border-violet-400 rounded-md">
      <p className="text-violet-700 font-semibold text-sm">Financial Health Summary</p>
      <p className="text-violet-600 text-sm mt-1">
        {salary > 0
          ? `You are saving ${savingsRate}% of your income this month.`
          : 'Set your monthly income to track your savings rate.'}
      </p>
      <p className="text-violet-600 text-sm mt-1">
        {salary > 0
          ? `Spending vs income ratio is ${spendingIncomeRatio}%.`
          : 'Spending vs income ratio is not available yet.'}
      </p>
      <p className="text-violet-600 text-sm mt-1">
        {topTwoCategories.length > 1
          ? `${topTwoCategories[0][0]} and ${topTwoCategories[1][0]} make up ${topTwoCombinedPercentage}% of your total spending.`
          : `${topCategoryName || 'Your top category'} makes up ${topCategoryPercentage}% of your total spending.`}
      </p>
    </div>
  );

  // Insight 1.6: Spending trend analysis
  if (trendMessage) {
    const trendBg = trendColor === "red" ? "bg-red-50" : trendColor === "green" ? "bg-green-50" : "bg-blue-50";
    const trendBorder = trendColor === "red" ? "border-red-400" : trendColor === "green" ? "border-green-400" : "border-blue-400";
    const trendText = trendColor === "red" ? "text-red-700" : trendColor === "green" ? "text-green-700" : "text-blue-700";
    const trendBody = trendColor === "red" ? "text-red-600" : trendColor === "green" ? "text-green-600" : "text-blue-600";

    insights.push(
      <div key="spending-trend" className={`p-4 ${trendBg} border-l-4 ${trendBorder} rounded-md`}>
        <p className={`${trendText} font-semibold text-sm`}>Spending Trend</p>
        <p className={`${trendBody} text-sm mt-1`}>{trendMessage}</p>
      </div>
    );
  }

  // Insight 3: Top spending category
  if (topCategoryName) {
    insights.push(
      <div key="top-category" className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
        <p className="text-blue-700 font-semibold text-sm">Top Spending: {topCategoryName}</p>
        <p className="text-blue-600 text-sm mt-1">You spent ₹{topCategoryAmount.toFixed(2)} ({topCategoryPercentage}% of your total budget)</p>
      </div>
    );
  }

  insights.push(
    <div key="investment-ratio" className="p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-md">
      <p className="text-emerald-700 font-semibold text-sm">Investment Allocation</p>
      <p className="text-emerald-600 text-sm mt-1">
        You have allocated ₹{investmentSpending.toFixed(2)} ({investmentPercentage}%) to investment-related spending.
      </p>
      {topInvestment[0] && (
        <p className="text-emerald-600 text-sm mt-1">
          Top investment subcategory: <span className="font-semibold">{topInvestment[0]}</span> (₹{topInvestment[1].toFixed(2)})
        </p>
      )}
    </div>
  );

  // Insight 4: Actionable savings advice
  if (topCategoryName) {
    insights.push(
      <div key="savings-advice" className="p-4 bg-green-50 border-l-4 border-green-400 rounded-md">
        <p className="text-green-700 font-semibold text-sm">Actionable Savings Strategy</p>
        <p className="text-green-600 text-sm mt-1">If you reduce {topCategoryName} spending by 20%, you can save exactly <span className="font-semibold">₹{potentialSavings}</span></p>
        <p className="text-green-600 text-sm mt-2">Reducing this category can improve your monthly savings significantly. Start small and track progress!</p>
      </div>
    );
  }

  // Insight 5: Category dominance analysis
  if (topCategoriesNames.length > 0) {
    const categoryList = topCategoriesNames.length === 1 
      ? topCategoriesNames[0]
      : topCategoriesNames.length === 2
      ? `${topCategoriesNames[0]} and ${topCategoriesNames[1]}`
      : `${topCategoriesNames.slice(0, -1).join(', ')} and ${topCategoriesNames[topCategoriesNames.length - 1]}`;

    insights.push(
      <div key="category-analysis" className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-md">
        <p className="text-orange-700 font-semibold text-sm">Category Dominance</p>
        <p className="text-orange-600 text-sm mt-1">Most of your money is going to {categoryList}</p>
      </div>
    );

    // Insight 6: Spending pattern
    insights.push(
      <div key="spending-pattern" className="p-4 bg-cyan-50 border-l-4 border-cyan-400 rounded-md">
        <p className="text-cyan-700 font-semibold text-sm">Spending Pattern</p>
        <p className="text-cyan-600 text-sm mt-1">These categories make up {topCategoriesCombinedPercentage}% of your total spending</p>
      </div>
    );
  }

  // Insight 7: Investment Suggestions based on savings
  if (salary > 0) {
    const remainingBalance = salary - totalSpending;
    
    if (remainingBalance >= 10000) {
      insights.push(
        <div key="investment-suggestions" className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-md">
          <p className="text-amber-700 font-semibold text-sm">💡 Investment Suggestions</p>
          <p className="text-amber-600 text-sm mt-2">With ₹{remainingBalance.toFixed(2)} in savings, you have great options:</p>
          <ul className="text-amber-600 text-sm mt-2 list-disc list-inside space-y-1">
            <li><span className="font-semibold">Stocks:</span> Build long-term wealth through equity investments</li>
            <li><span className="font-semibold">SIP (Systematic Investment Plan):</span> Regular small investments in mutual funds</li>
            <li><span className="font-semibold">Gold:</span> A traditional, stable investment option</li>
            <li><span className="font-semibold">Bonds:</span> Lower risk, fixed income investments</li>
          </ul>
          <p className="text-amber-600 text-xs mt-2 italic">Diversify your investments to reduce risk and maximize returns</p>
        </div>
      );
    } else if (remainingBalance >= 5000) {
      insights.push(
        <div key="investment-suggestions" className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-md">
          <p className="text-amber-700 font-semibold text-sm">💡 Investment Suggestions</p>
          <p className="text-amber-600 text-sm mt-2">With ₹{remainingBalance.toFixed(2)} in savings, consider:</p>
          <ul className="text-amber-600 text-sm mt-2 list-disc list-inside space-y-1">
            <li><span className="font-semibold">Gold:</span> A safe, reliable investment for beginners</li>
            <li><span className="font-semibold">Mutual Funds:</span> Start with index funds or balanced funds</li>
            <li><span className="font-semibold">Recurring Deposits:</span> Guaranteed returns with minimal risk</li>
          </ul>
          <p className="text-amber-600 text-xs mt-2 italic">Build your investment habit early—every rupee compounds over time</p>
        </div>
      );
    } else if (remainingBalance > 1000) {
      insights.push(
        <div key="investment-suggestions" className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-md">
          <p className="text-amber-700 font-semibold text-sm">💡 Investment Suggestions</p>
          <p className="text-amber-600 text-sm mt-2">You have ₹{remainingBalance.toFixed(2)} remaining. Here's how to grow it:</p>
          <ul className="text-amber-600 text-sm mt-2 list-disc list-inside space-y-1">
            <li><span className="font-semibold">Start small:</span> Even ₹500-1000 monthly investments add up</li>
            <li><span className="font-semibold">High-yield savings accounts:</span> Better interest than regular savings</li>
            <li><span className="font-semibold">Emergency fund:</span> Build 3-6 months of expenses first</li>
          </ul>
          <p className="text-amber-600 text-xs mt-2 italic">Focus on building your emergency fund before investing</p>
        </div>
      );
    }
  }

  insights.push(
    <div key="rd-suggestions" className="p-4 bg-sky-50 border-l-4 border-sky-400 rounded-md">
      <p className="text-sky-700 font-semibold text-sm">Recurring Deposit Suggestions</p>
      <div className="mt-2 space-y-2 text-sm text-sky-700">
        <div className="flex items-start justify-between gap-4">
          <span className="font-medium">SBI RD</span>
          <span className="font-semibold">6.5%</span>
        </div>
        <p className="text-xs text-sky-600">Best for stable monthly saving with low risk.</p>

        <div className="flex items-start justify-between gap-4 pt-1">
          <span className="font-medium">HDFC RD</span>
          <span className="font-semibold">7.0%</span>
        </div>
        <p className="text-xs text-sky-600">Suitable if you want slightly higher returns with predictable growth.</p>

        <div className="flex items-start justify-between gap-4 pt-1">
          <span className="font-medium">ICICI RD</span>
          <span className="font-semibold">6.8%</span>
        </div>
        <p className="text-xs text-sky-600">Balanced option for disciplined savings and liquidity planning.</p>
      </div>
    </div>
  );

  // Insight 8: Motivation message
  insights.push(
    <div key="motivation" className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-md">
      <p className="text-purple-700 font-semibold text-sm">Budget Tip</p>
      <p className="text-purple-600 text-sm mt-1">Small changes can improve your savings. Every rupee counts!</p>
    </div>
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Financial Insights</h2>
      <div className="space-y-3">
        {insights}
      </div>
    </div>
  );
}
