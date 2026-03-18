import { useState } from 'react'
import './App.css'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import SummaryCard from './components/SummaryCard'
import AIInsights from './components/AIInsights'

function App() {
  const [expenses, setExpenses] = useState([])
  const [savingsGoal, setSavingsGoal] = useState(0)

  const handleAddExpense = (expense) => {
    setExpenses([...expenses, expense])
  }

  const handleSetGoal = (goal) => {
    setSavingsGoal(parseFloat(goal) || 0)
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
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4 h-fit">
              <ExpenseForm onAddExpense={handleAddExpense} onSetGoal={handleSetGoal} />
            </div>
          </div>

          {/* Right Column - Summary + Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <SummaryCard expenses={expenses} />
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <AIInsights expenses={expenses} savingsGoal={savingsGoal} />
            </div>
          </div>
        </div>

        {/* Expense History */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <ExpenseList expenses={expenses} />
        </div>
      </div>
    </div>
  )
}

export default App
