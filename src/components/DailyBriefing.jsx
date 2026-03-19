import { useState, useEffect } from 'react';

export default function DailyBriefing({ expenses, salary, savingsGoal }) {
  const [userName, setUserName] = useState('User');
  const [editingName, setEditingName] = useState(false);

  // Get current time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  };

  // Calculate yesterday's spending (last ~25% of expenses)
  const getYesterdaySpending = () => {
    if (expenses.length === 0) return null;
    
    // Get recent expenses (simulate "yesterday")
    const recentCount = Math.ceil(expenses.length * 0.25) || 1;
    const recentExpenses = expenses.slice(-recentCount);
    const totalRecent = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return totalRecent;
  };

  // Get top category
  const getTopCategory = () => {
    if (expenses.length === 0) return null;
    
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const topCat = Object.entries(categoryBreakdown).reduce((max, [cat, amt]) =>
      amt > max[1] ? [cat, amt] : max,
      ['', 0]
    );

    return topCat[0];
  };

  // Get savings goal progress
  const getSavingsProgress = () => {
    if (salary === 0 || savingsGoal === 0) return null;

    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const spent = Math.min(totalSpending, savingsGoal);
    const percentage = (spent / savingsGoal) * 100;
    const remaining = Math.max(0, savingsGoal - totalSpending);

    return {
      spent,
      remaining,
      percentage,
      isOnTrack: totalSpending <= savingsGoal
    };
  };

  // Generate smart suggestion
  const getSuggestion = () => {
    const topCategory = getTopCategory();
    const progress = getSavingsProgress();
    const yesterdaySpending = getYesterdaySpending();

    if (!topCategory) {
      return 'Start tracking expenses to get personalized suggestions!';
    }

    if (progress && !progress.isOnTrack) {
      return `You're above your savings goal. Try reducing ${topCategory.toLowerCase()} spending today.`;
    }

    if (progress && progress.percentage > 80) {
      return `You're close to your savings goal (${progress.percentage.toFixed(0)}% spent). Be mindful of ${topCategory.toLowerCase()} today!`;
    }

    if (yesterdaySpending > 2000) {
      return `Yesterday you spent ₹${yesterdaySpending.toFixed(0)} - mostly on ${topCategory}. Try to keep it lower today!`;
    }

    if (topCategory === 'Food') {
      return `Your biggest expense is ${topCategory}. Pack a lunch today to save more!`;
    }

    if (topCategory === 'Transport') {
      return `You spend a lot on ${topCategory}. Can you use public transport or carpool today?`;
    }

    return `${topCategory} is your top category. Look for ways to optimize it today!`;
  };

  const handleNameSave = (newName) => {
    if (newName.trim()) {
      setUserName(newName.trim());
      localStorage.setItem('userName', newName.trim());
      setEditingName(false);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const yesterdaySpending = getYesterdaySpending();
  const topCategory = getTopCategory();
  const progress = getSavingsProgress();

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg mb-8">
      {/* Greeting Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {getGreeting()} {getTimeEmoji}
          </h2>
          {!editingName ? (
            <p 
              className="text-indigo-100 cursor-pointer hover:text-white transition"
              onClick={() => setEditingName(true)}
            >
              {userName} ✏️
            </p>
          ) : (
            <input
              type="text"
              defaultValue={userName}
              onBlur={(e) => handleNameSave(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSave(e.target.value)}
              autoFocus
              className="bg-indigo-500 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter your name"
            />
          )}
        </div>
        <div className="text-5xl">💰</div>
      </div>

      {/* Key Metrics */}
      {expenses.length > 0 && (
        <div className="space-y-3 mb-4">
          {yesterdaySpending && (
            <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-3">
              <span className="text-indigo-100">Recent spending:</span>
              <span className="text-xl font-bold">₹{yesterdaySpending.toFixed(0)}</span>
            </div>
          )}

          {topCategory && (
            <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-3">
              <span className="text-indigo-100">Top category:</span>
              <span className="text-lg font-semibold">{topCategory}</span>
            </div>
          )}

          {progress && (
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex justify-between mb-2">
                <span className="text-indigo-100">Savings goal progress:</span>
                <span className="font-bold">{progress.percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    progress.isOnTrack ? 'bg-green-300' : 'bg-red-300'
                  }`}
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-indigo-100 mt-1">
                {progress.isOnTrack 
                  ? `₹${progress.remaining.toFixed(0)} left to reach your goal`
                  : `₹${Math.abs(progress.remaining).toFixed(0)} over your goal`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Smart Suggestion */}
      <div className="bg-white bg-opacity-15 rounded-lg p-4 border border-white border-opacity-30">
        <p className="text-indigo-100 text-sm mb-1">💡 Today's suggestion</p>
        <p className="text-base font-semibold">{getSuggestion()}</p>
      </div>

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="text-center">
          <p className="text-indigo-100 mb-2">Start adding expenses to get personalized insights!</p>
          <p className="text-sm text-indigo-100">Click "Add Expense" or "Simulate Daily Expenses" to begin.</p>
        </div>
      )}
    </div>
  );
}
