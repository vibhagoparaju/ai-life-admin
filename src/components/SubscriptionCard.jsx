export default function SubscriptionCard({ subscriptions }) {
  const totalSubscriptionCost = subscriptions.reduce((sum, item) => sum + item.amount, 0)
  const topSubscription = subscriptions[0]

  return (
    <div className="rounded-xl shadow-sm p-4 bg-orange-50 border border-orange-200">
      <h2 className="text-lg font-semibold text-orange-800">Subscriptions</h2>

      {subscriptions.length === 0 ? (
        <p className="text-sm text-orange-700 mt-3">
          No recurring subscriptions detected yet. Keep adding expenses to improve detection.
        </p>
      ) : (
        <>
          <p className="text-sm text-orange-700 mt-2">
            You spend ₹{totalSubscriptionCost.toFixed(2)}/month on subscriptions.
          </p>

          <div className="mt-3 space-y-2">
            {subscriptions.map((item) => (
              <div
                key={`${item.name}-${item.amount}`}
                className="rounded-lg border border-orange-100 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-orange-900">{item.name}</p>
                  <p className="text-sm font-semibold text-orange-700">₹{item.amount.toFixed(2)}</p>
                </div>
                <p className="text-xs text-orange-700 mt-1">Frequency: {item.frequency} similar payments</p>
              </div>
            ))}
          </div>

          {topSubscription && (
            <p className="text-sm text-red-700 mt-3">
              You may not be using this frequently. Consider cancelling to save ₹{topSubscription.amount.toFixed(2)}.
            </p>
          )}
        </>
      )}
    </div>
  )
}
