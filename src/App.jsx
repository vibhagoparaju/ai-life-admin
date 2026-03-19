import { useCallback, useEffect, useState } from 'react'
import './App.css'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import SummaryCard from './components/SummaryCard'
import AIInsights from './components/AIInsights'
import ChatBot from './components/ChatBot'
import InvestmentSuggestions from './components/InvestmentSuggestions'
import DailyBriefing from './components/DailyBriefing'
import { detectExpenseCategory } from './utils/financeUtils'

function App() {
  const [expenses, setExpenses] = useState([])
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [salary, setSalary] = useState(0)
  const [notification, setNotification] = useState('')
  const [goldPrice, setGoldPrice] = useState(null)
  const [goldPriceStatus, setGoldPriceStatus] = useState('loading')
  const [goldPriceUpdatedAt, setGoldPriceUpdatedAt] = useState(null)

  const extractGoldPrice = (responseData) => {
    if (typeof responseData === 'number') return responseData

    if (Array.isArray(responseData)) {
      for (const item of responseData) {
        if (typeof item === 'number') return item
        if (item && typeof item === 'object') {
          if (typeof item.gold === 'number') return item.gold
          if (typeof item.price === 'number') return item.price
          const firstNumericValue = Object.values(item).find((value) => typeof value === 'number')
          if (typeof firstNumericValue === 'number') return firstNumericValue
        }
      }
    }

    if (responseData && typeof responseData === 'object') {
      if (typeof responseData.gold === 'number') return responseData.gold
      if (typeof responseData.price === 'number') return responseData.price
    }

    return null
  }

  const fetchGoldPrice = useCallback(async () => {
    setGoldPriceStatus('loading')
    try {
      const response = await fetch('https://api.metals.live/v1/spot/gold')
      if (!response.ok) {
        throw new Error('Failed to fetch gold price')
      }

      const data = await response.json()
      const parsedGoldPrice = extractGoldPrice(data)

      if (typeof parsedGoldPrice === 'number') {
        setGoldPrice(parsedGoldPrice)
        setGoldPriceStatus('success')
        setGoldPriceUpdatedAt(new Date().toISOString())
        return
      }

      throw new Error('Gold price unavailable')
    } catch (error) {
      setGoldPriceStatus('error')
    }
  }, [])

  useEffect(() => {
    fetchGoldPrice()
  }, [fetchGoldPrice])

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
        subcategory: randomExpense.category,
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
    const { category, subcategory } = detectExpenseCategory(expense.category)

    const normalizedExpense = {
      ...expense,
      category,
      subcategory,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-gray-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-7 shadow-md">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">AI Life Admin</h1>
          <p className="mt-2 text-sm font-medium text-indigo-100">Your AI Finance Assistant</p>
          <p className="mt-1 text-sm text-purple-100">Smart expense tracking, investment awareness, and decision-ready insights</p>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-medium">
            {notification}
          </div>
        )}
      </div>

      {/* Daily Briefing */}
      <div className="max-w-6xl mx-auto mb-8">
        <DailyBriefing expenses={expenses} salary={salary} savingsGoal={savingsGoal} />
      </div>

      {/* Main Layout - Flex with Left & Right Sections */}
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 xl:items-start">
        {/* Left Section - 70% Width */}
        <div className="flex-1 min-w-0 xl:pr-1">
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
                <AIInsights
                  expenses={expenses}
                  savingsGoal={savingsGoal}
                  salary={salary}
                  goldPrice={goldPrice}
                  goldPriceStatus={goldPriceStatus}
                  goldPriceUpdatedAt={goldPriceUpdatedAt}
                  onRefreshGoldPrice={fetchGoldPrice}
                />
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
        <div className="w-full xl:w-80 flex-shrink-0">
          <div className="sticky top-5 bg-white rounded-xl shadow-sm p-5 flex flex-col overflow-hidden" style={{ height: '78vh' }}>
            <ChatBot
              expenses={expenses}
              salary={salary}
              savingsGoal={savingsGoal}
              goldPrice={goldPrice}
              goldPriceStatus={goldPriceStatus}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
