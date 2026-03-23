import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import SummaryCard from './components/SummaryCard'
import AIInsights from './components/AIInsights'
import ChatBot from './components/ChatBot'
import InvestmentSuggestions from './components/InvestmentSuggestions'
import DailyBriefing from './components/DailyBriefing'
import GoalTrackerCard from './components/GoalTrackerCard'
import SubscriptionCard from './components/SubscriptionCard'
import AuthCard from './components/AuthCard'
import { INVESTMENT_CATEGORY, detectExpenseCategory } from './utils/financeUtils'
import { auth, db } from './firebase'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

function App() {
  const [expenses, setExpenses] = useState([])
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [goalName, setGoalName] = useState('')
  const [goalAmount, setGoalAmount] = useState(0)
  const [salary, setSalary] = useState(0)
  const [notification, setNotification] = useState('')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')
  const [profileName, setProfileName] = useState('')
  const isHydratingRef = useRef(false)

  const loadUserData = useCallback(async (uid) => {
    isHydratingRef.current = true
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        setSalary(data.salary || 0)
        setSavingsGoal(data.savingsGoal || 0)
        setGoalName(data.goal?.name || data.goalName || '')
        setGoalAmount(data.goal?.amount || data.goalAmount || 0)
        setProfileName(data.name || '')
        if (Array.isArray(data.expenses)) {
          setExpenses(data.expenses)
        } else {
          const expenseSnapshot = await getDocs(collection(db, 'users', uid, 'expenses'))
          const loadedExpenses = expenseSnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
          setExpenses(loadedExpenses)
        }
      } else {
        setSalary(0)
        setSavingsGoal(0)
        setGoalName('')
        setGoalAmount(0)
        setProfileName('')
        setExpenses([])
      }
    } catch (error) {
      setNotification('Could not load cloud data. Check network and try again.')
    } finally {
      isHydratingRef.current = false
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      setAuthError('')

      if (currentUser) {
        await loadUserData(currentUser.uid)
      } else {
        setExpenses([])
        setSalary(0)
        setSavingsGoal(0)
        setGoalName('')
        setGoalAmount(0)
        setProfileName('')
      }

      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [loadUserData])

  const saveUserProfile = useCallback(async (uid, partialData) => {
    await setDoc(doc(db, 'users', uid), partialData, { merge: true })
  }, [])

  const syncUserData = useCallback(async (nextState = {}) => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    const payload = {
      expenses: nextState.expenses ?? expenses,
      salary: nextState.salary ?? salary,
      savingsGoal: nextState.savingsGoal ?? savingsGoal,
      goalName: nextState.goalName ?? goalName,
      goalAmount: nextState.goalAmount ?? goalAmount,
      name: nextState.name ?? profileName,
      goal: {
        name: nextState.goalName ?? goalName,
        amount: nextState.goalAmount ?? goalAmount
      }
    }

    await setDoc(doc(db, 'users', currentUser.uid), payload, { merge: true })
  }, [expenses, goalAmount, goalName, profileName, salary, savingsGoal])

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
    const updatedExpenses = [...expenses, ...newExpenses]
    setExpenses(updatedExpenses);
    setNotification(`✨ ${newExpenses.length} new expenses added automatically`);

    if (user) {
      newExpenses.forEach((item) => {
        addDoc(collection(db, 'users', user.uid, 'expenses'), item).catch(() => {
          setNotification('Could not save simulated expenses to cloud.')
        })
      })

      syncUserData({ expenses: updatedExpenses }).catch(() => {
        setNotification('Could not sync simulated expenses.')
      })
    }
    
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
    const updatedExpenses = [...expenses, normalizedExpense]
    setExpenses(updatedExpenses)

    if (user) {
      addDoc(collection(db, 'users', user.uid, 'expenses'), normalizedExpense).catch(() => {
        setNotification('Could not save expense to cloud.')
      })

      syncUserData({ expenses: updatedExpenses }).catch(() => {
        setNotification('Could not sync expense data.')
      })
    }
  }

  const handleSetGoal = (goal) => {
    const value = parseFloat(goal) || 0
    setSavingsGoal(value)

    if (user && !isHydratingRef.current) {
      syncUserData({ savingsGoal: value }).catch(() => {
        setNotification('Could not sync savings goal.')
      })
      saveUserProfile(user.uid, { savingsGoal: value }).catch(() => {
        setNotification('Could not save savings goal.')
      })
    }
  }

  const handleSetSalary = (salaryValue) => {
    const value = parseFloat(salaryValue) || 0
    setSalary(value)

    if (user && !isHydratingRef.current) {
      syncUserData({ salary: value }).catch(() => {
        setNotification('Could not sync salary.')
      })
      saveUserProfile(user.uid, { salary: value }).catch(() => {
        setNotification('Could not save salary.')
      })
    }
  }

  const handleSetGoalName = (value) => {
    setGoalName(value)

    if (user && !isHydratingRef.current) {
      syncUserData({ goalName: value }).catch(() => {
        setNotification('Could not sync goal details.')
      })
      saveUserProfile(user.uid, {
        goalName: value,
        goal: { name: value, amount: goalAmount || 0 }
      }).catch(() => {
        setNotification('Could not save goal details.')
      })
    }
  }

  const handleSetGoalAmount = (value) => {
    const amount = parseFloat(value) || 0
    setGoalAmount(amount)

    if (user && !isHydratingRef.current) {
      syncUserData({ goalAmount: amount }).catch(() => {
        setNotification('Could not sync goal details.')
      })
      saveUserProfile(user.uid, {
        goalAmount: amount,
        goal: { name: goalName, amount }
      }).catch(() => {
        setNotification('Could not save goal details.')
      })
    }
  }

  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const goalTrackerSpending = expenses
    .filter((expense) => expense.category !== INVESTMENT_CATEGORY)
    .reduce((sum, expense) => sum + expense.amount, 0)
  const currentSavings = salary - goalTrackerSpending

  const detectSubscriptions = () => {
    const groupedByCategory = expenses.reduce((acc, expense) => {
      const key = expense.category || 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(expense.amount)
      return acc
    }, {})

    const detected = []
    Object.entries(groupedByCategory).forEach(([category, amounts]) => {
      if (amounts.length < 2) return

      const average = amounts.reduce((sum, value) => sum + value, 0) / amounts.length
      const similarCount = amounts.filter((value) => {
        const difference = Math.abs(value - average)
        return difference <= average * 0.15
      }).length

      if (similarCount >= 2) {
        detected.push({
          name: category,
          amount: average,
          frequency: similarCount
        })
      }
    })

    return detected
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }

  const subscriptions = detectSubscriptions()
  const spendingRatio = salary > 0 ? (totalSpending / salary) * 100 : 0
  const headerAiMessage = spendingRatio > 70
    ? `Keep your spending in check today${profileName ? `, ${profileName}` : ''}.`
    : `You're doing great this month${profileName ? `, ${profileName}` : ''}.`

  const handleLogin = async (email, password) => {
    if (!email || !password) {
      setAuthError('Please enter email and password.')
      return
    }

    try {
      setAuthSubmitting(true)
      setAuthError('')
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setAuthError('User not registered')
      } else if (error.code === 'auth/wrong-password') {
        setAuthError('Incorrect password')
      } else if (error.code === 'auth/invalid-credential') {
        setAuthError('Incorrect email or password')
      } else {
        setAuthError('Unable to login right now. Please try again.')
      }
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleSignup = async (name, email, password) => {
    if (!name || !email || !password) {
      setAuthError('Please enter name, email and password.')
      return
    }

    try {
      setAuthSubmitting(true)
      setAuthError('')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email
      }, { merge: true })
      setProfileName(name)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered.')
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.')
      } else {
        setAuthError('Could not create account. Please try again.')
      }
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      setNotification('Logout failed. Please try again.')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-gray-100 px-4 py-10 flex items-center justify-center">
        <div className="rounded-xl shadow-sm p-6 bg-white text-gray-700">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthCard
        onLogin={handleLogin}
        onSignup={handleSignup}
        authError={authError}
        isSubmitting={authSubmitting}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-gray-100 py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-10"
      >
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-7 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">AI Life Admin</h1>
              <p className="mt-2 text-sm font-medium text-indigo-100">Your AI Finance Assistant</p>
              <p className="mt-1 text-sm text-purple-100">{headerAiMessage}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-medium">
            {notification}
          </div>
        )}
      </motion.div>

      {/* Goal Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <GoalTrackerCard
          goalName={goalName}
          goalAmount={goalAmount}
          savings={currentSavings}
        />
      </motion.div>

      {/* Daily Briefing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <DailyBriefing expenses={expenses} salary={salary} savingsGoal={savingsGoal} />
      </motion.div>

      {/* Main Layout - Flex with Left & Right Sections */}
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 xl:items-start">
        {/* Left Section - 70% Width */}
        <div className="flex-1 min-w-0 xl:pr-1">
          {/* Two Column Grid for Form & Summary/Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Form (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-4 transition hover:shadow-lg hover:scale-[1.01] sticky top-4 h-fit">
                <ExpenseForm
                  onAddExpense={handleAddExpense}
                  onSetGoal={handleSetGoal}
                  onSetGoalName={handleSetGoalName}
                  onSetGoalAmount={handleSetGoalAmount}
                  onSetSalary={handleSetSalary}
                  onSimulate={handleSimulateDailyExpenses}
                />
              </div>
            </div>

            {/* Right Column - Summary + Insights (Stacked) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl shadow-md p-4 transition hover:shadow-lg hover:scale-[1.01]">
                <SummaryCard expenses={expenses} salary={salary} />
              </div>

              {/* Insights */}
              <div className="bg-white rounded-2xl shadow-md p-4 transition hover:shadow-lg hover:scale-[1.01]">
                <AIInsights
                  expenses={expenses}
                  savingsGoal={savingsGoal}
                  salary={salary}
                />
              </div>

              {/* Subscription Detection */}
              <div className="bg-white rounded-2xl shadow-md p-4 transition hover:shadow-lg hover:scale-[1.01]">
                <SubscriptionCard subscriptions={subscriptions} />
              </div>
            </div>
          </div>

          {/* Expense History - Full Width */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md p-4 transition hover:shadow-lg hover:scale-[1.01]">
              <ExpenseList expenses={expenses} />
            </div>
          </div>

          {/* Investment Suggestions - Full Width */}
          <div>
            <div className="bg-white rounded-2xl shadow-md p-4 transition hover:shadow-lg hover:scale-[1.01]">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Wealth Advisory</h2>
              <InvestmentSuggestions expenses={expenses} salary={salary} />
            </div>
          </div>
        </div>

        {/* Right Section - 30% Width (Sticky Chat Panel) */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <ChatBot
            expenses={expenses}
            salary={salary}
            savingsGoal={savingsGoal}
            goalName={goalName}
            goalAmount={goalAmount}
            subscriptions={subscriptions}
          />
        </div>
      </div>
    </div>
  )
}

export default App
