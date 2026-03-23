export default function GoalTrackerCard({ goalName, goalAmount, savings }) {
  const normalizedGoalAmount = goalAmount > 0 ? goalAmount : 0
  const safeSavings = savings > 0 ? savings : 0
  const progress = normalizedGoalAmount > 0 ? (safeSavings / normalizedGoalAmount) * 100 : 0
  const cappedProgress = Math.min(progress, 100)

  const dailySaving = normalizedGoalAmount > 0 ? normalizedGoalAmount / 365 : 0
  const monthlySaving = normalizedGoalAmount > 0 ? normalizedGoalAmount / 12 : 0

  const estimatedMonths = safeSavings > 0 && normalizedGoalAmount > 0
    ? Math.ceil(normalizedGoalAmount / safeSavings)
    : null

  const displayGoalName = goalName?.trim() ? goalName.trim() : 'My Goal'

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 transition hover:shadow-lg hover:scale-[1.01] border border-green-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-green-800">🎯 Goal Tracker</h2>
          <p className="text-sm text-green-700 mt-1">{displayGoalName}</p>
        </div>
        {normalizedGoalAmount > 0 && (
          <p className="text-sm font-semibold text-green-700">{cappedProgress.toFixed(1)}%</p>
        )}
      </div>

      {normalizedGoalAmount === 0 ? (
        <p className="text-sm text-green-700 mt-4">
          Add a goal name and target amount to start tracking your progress.
        </p>
      ) : (
        <>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${cappedProgress}%` }}
            ></div>
          </div>

          <p className="text-sm text-green-800 mt-3">
            Saved ₹{safeSavings.toFixed(2)} of ₹{normalizedGoalAmount.toFixed(2)}
          </p>

          <div className="mt-3 space-y-1">
            <p className="text-sm text-green-700">
              Save ₹{dailySaving.toFixed(2)} daily to reach your goal in 1 year.
            </p>
            {estimatedMonths ? (
              <p className="text-sm text-green-700">
                At current savings rate, you will reach your goal in {estimatedMonths} months.
              </p>
            ) : (
              <p className="text-sm text-green-700">
                Save about ₹{monthlySaving.toFixed(2)} monthly to stay on track.
              </p>
            )}
          </div>

          <div className="mt-3 p-3 rounded-lg bg-white/60 border border-green-100">
            <p className="text-sm font-medium text-green-800">You're doing great!</p>
            <p className="text-xs text-green-700 mt-1">Stay consistent and you'll reach your goal.</p>
          </div>
        </>
      )}
    </div>
  )
}
