import { useState } from 'react'
import './App.css'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import SummaryCard from './components/SummaryCard'
import AIInsights from './components/AIInsights'
import ChatBot from './components/ChatBot'
import InvestmentSuggestions from './components/InvestmentSuggestions'
import DailyBriefing from './components/DailyBriefing'

// Smart category grouping mapping
const CATEGORY_MAPPINGS = {
  'Transport': ['bus', 'auto', 'cab', 'taxi', 'transport', 'fuel', 'petrol', 'diesel', 'metro', 'train', 'ride', 'uber', 'travel'],
  'Food': ['swiggy', 'zomato', 'food', 'restaurant', 'dining', 'cafe', 'coffee', 'pizza', 'burger', 'delivery'],
  'Housing': ['rent', 'housing', 'apartment', 'house', 'mortgage', 'home'],
  'Utilities': ['electricity', 'utilities', 'water', 'internet', 'phone', 'bill', 'broadband'],
  'Entertainment': ['movie', 'cinema', 'entertainment', 'games', 'subscription', 'netflix', 'spotify', 'streaming'],
  'Grocery': ['grocery', 'supermarket', 'market', 'shopping', 'vegetables', 'fruits'],
  'Health': ['medicine', 'doctor', 'hospital', 'health', 'gym', 'fitness', 'pharma', 'medical']
};

// Function to get the main category group from user input
const getCategoryGroup = (userCategory) => {
  const categoryLower = userCategory.toLowerCase().trim();
  
  for (const [mainCategory, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    if (keywords.includes(categoryLower)) {
      return mainCategory;
    }
  }
  
  // If not found in mappings, capitalize and return the original
  return userCategory.charAt(0).toUpperCase() + userCategory.slice(1);
};

function App() {
  const [expenses, setExpenses] = useState([])
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [salary, setSalary] = useState(0)
  const [notification, setNotification] = useState('')

  const sampleExpenses = [
    { category: 'Food', min: 150, max: 500 },
    { category: 'Transport', min: 50, max: 200 },
    { category: 'Shopping', min: 200, max: 800 },
    { category: 'Entertainment', min: 100, max: 400 },
    { category: 'Utilities', min: 300, max: 800 },
    { category: 'Grocery', min: 200, max: 600 },
    { category: 'Cafe', min: 80, max: 300 }
  ];

  // Generate random sample expenses
  const generateSampleExpenses = () => {
    const newExpenses = [];
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 random expenses

    for (let i = 0; i < count; i++) {
      const randomExpense = sampleExpenses[Math.floor(Math.random() * sampleExpenses.length)];
      const amount = Math.floor(Math.random() * (randomExpense.max - randomExpense.min + 1)) + randomExpense.min;
      
      const now = new Date();
      const randomHours = Math.floor(Math.random() * 24);
      const randomMinutes = Math.floor(Math.random() * 60);
      const timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), randomHours, randomMinutes);

      newExpenses.push({
        amount: amount,
        category: randomExpense.category,
        timestamp: timestamp.toISOString()
      });
    }

    return newExpenses;
  };

  const handleSimulateDailyExpenses = () => {
    const newExpenses = generateSampleExpenses();
    setExpenses([...expenses, ...newExpenses]);
    setNotification(`✨ ${newExpenses.length} new expenses added automatically`);
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddExpense = (expense) => {
    const normalizedExpense = {
      ...expense,
      category: getCategoryGroup(expense.category),
      timestamp: new Date().toISOString()
    };
    setExpenses([...expenses, normalizedExpense])
  }

  const handleSetGoal = (goal) => {
    setSavingsGoal(parseFloat(goal) || 0)
  }

  const handleSetSalary = (salaryValue) => {
    setSalary(parseFloat(salaryValue) || 0)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AI Life Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Smart expense tracking and financial insights</p>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-medium animate-pulse">
            {notification}
          </div>
        )}
      </div>

      {/* Daily Briefing */}
      <div className="max-w-6xl mx-auto mb-8">
        <DailyBriefing expenses={expenses} salary={salary} savingsGoal={savingsGoal} />
      </div>

      {/* Main Layout - Flex with Left & Right Sections */}
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Section - 70% Width */}
        <div className="flex-1 min-w-0">
          {/* Two Column Grid for Form & Summary/Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Form (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4 h-fit">
                <ExpenseForm onAddExpense={handleAddExpense} onSetGoal={handleSetGoal} onSetSalary={handleSetSalary} onSimulate={handleSimulateDailyExpenses} />
              </div>
            </div>

            {/* Right Column - Summary + Insights (Stacked) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <SummaryCard expenses={expenses} salary={salary} />
              </div>

              {/* Insights */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <AIInsights expenses={expenses} savingsGoal={savingsGoal} salary={salary} />
              </div>
            </div>
          </div>

          {/* Expense History - Full Width */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <ExpenseList expenses={expenses} />
            </div>
          </div>

          {/* Investment Suggestions - Full Width */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Wealth Advisory</h2>
              <InvestmentSuggestions expenses={expenses} salary={salary} />
            </div>
          </div>
        </div>

        {/* Right Section - 30% Width (Sticky Chat Panel) */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-5 bg-white rounded-xl shadow-sm p-5 flex flex-col overflow-hidden" style={{ height: '80vh' }}>
            <ChatBot expenses={expenses} salary={salary} savingsGoal={savingsGoal} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
