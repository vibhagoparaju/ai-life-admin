export const calculateSavings = (salary, expenses) => {
  const totalSpending = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  return (salary || 0) - totalSpending
}

export const detectOverspending = (salary, expenses) => {
  const savings = calculateSavings(salary, expenses)
  return savings < 0
}

export const getTopCategory = (expenses) => {
  if (!expenses.length) return { category: '', amount: 0 }

  const grouped = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other'
    acc[category] = (acc[category] || 0) + (expense.amount || 0)
    return acc
  }, {})

  const [category, amount] = Object.entries(grouped).reduce(
    (max, [name, value]) => (value > max[1] ? [name, value] : max),
    ['', 0]
  )

  return { category, amount }
}

export const predictFuture = (salary, expenses, goal) => {
  const savings = Math.max(0, calculateSavings(salary, expenses))
  const goalAmount = goal?.amount || 0
  const goalName = goal?.name || 'your goal'

  if (goalAmount <= 0) {
    return `Current savings are ₹${savings.toFixed(2)}. Set a goal amount for prediction.`
  }

  if (savings <= 0) {
    return `Savings are ₹${savings.toFixed(2)} now. Reduce expenses to start moving toward ${goalName}.`
  }

  const months = Math.ceil(goalAmount / savings)
  return `At current pace, you can reach ${goalName} in about ${months} months.`
}

export const canAfford = (salary, expenses, goal, purchaseAmount) => {
  const savings = calculateSavings(salary, expenses)
  const remainingAfterPurchase = savings - purchaseAmount
  const goalAmount = goal?.amount || 0
  const goalName = goal?.name || 'your goal'

  if (purchaseAmount <= 0) {
    return {
      canBuy: false,
      message: 'Please share a valid amount.'
    }
  }

  if (remainingAfterPurchase < 0) {
    return {
      canBuy: false,
      message: `Not affordable now. You will be short by ₹${Math.abs(remainingAfterPurchase).toFixed(2)}.`
    }
  }

  if (goalAmount > 0 && remainingAfterPurchase < goalAmount) {
    return {
      canBuy: true,
      message: `You can afford it, but it may slow ${goalName}. Balance left: ₹${remainingAfterPurchase.toFixed(2)}.`
    }
  }

  return {
    canBuy: true,
    message: `Yes, affordable. You will still have ₹${remainingAfterPurchase.toFixed(2)} after purchase.`
  }
}
