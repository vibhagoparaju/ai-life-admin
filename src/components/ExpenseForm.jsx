import { useState } from 'react';

export default function ExpenseForm({
  onAddExpense,
  onSetGoal,
  onSetGoalName,
  onSetGoalAmount,
  onSetSalary,
  onSimulate
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [goal, setGoal] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (amount && category) {
      onAddExpense({
        amount: parseFloat(amount),
        category: category.trim()
      });
      setAmount('');
      setCategory('');
    }
  };

  const handleGoalChange = (e) => {
    const goalValue = e.target.value;
    setGoal(goalValue);
    onSetGoal(goalValue);
  };

  const handleSalaryChange = (e) => {
    const salaryValue = e.target.value;
    setSalary(salaryValue);
    onSetSalary(salaryValue);
  };

  const handleGoalNameChange = (e) => {
    const value = e.target.value;
    setGoalName(value);
    onSetGoalName(value);
  };

  const handleGoalAmountChange = (e) => {
    const value = e.target.value;
    setGoalAmount(value);
    onSetGoalAmount(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-1">Add Expense</h2>
      <p className="text-xs text-gray-500 mb-6">Track your spending to see insights</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Monthly Income/Salary (₹)</label>
          <input
            id="salary"
            type="number"
            step="0.01"
            value={salary}
            onChange={handleSalaryChange}
            placeholder="e.g., 50000"
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-green-50"
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Monthly Savings Goal (₹)</label>
          <input
            id="goal"
            type="number"
            step="0.01"
            value={goal}
            onChange={handleGoalChange}
            placeholder="e.g., 5000"
            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200 bg-indigo-50"
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Goal Name</label>
          <input
            id="goalName"
            type="text"
            value={goalName}
            onChange={handleGoalNameChange}
            placeholder="e.g., 🚗 Car Fund"
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-green-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Goal Amount (₹)</label>
          <input
            id="goalAmount"
            type="number"
            step="0.01"
            value={goalAmount}
            onChange={handleGoalAmountChange}
            placeholder="e.g., 200000"
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-green-50"
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Food, Transport, Rent"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
      >
        Add Expense +
      </button>

      <button
        type="button"
        onClick={onSimulate}
        className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
      >
        ✨ Simulate Daily Expenses
      </button>
    </form>
  );
}
