import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function InvestmentSuggestions({ expenses, salary }) {
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = salary - totalSpending;
  const [goldPrice, setGoldPrice] = useState(null);
  const [marketStatus, setMarketStatus] = useState('loading');
  const [updatedAt, setUpdatedAt] = useState(null);

  const stocks = [
    { name: 'Reliance', trend: 'up' },
    { name: 'TCS', trend: 'stable' }
  ];

  const fetchGoldPrice = useCallback(async () => {
    setMarketStatus('loading');
    try {
      const response = await fetch('https://api.metals.live/v1/spot/gold');
      if (!response.ok) throw new Error('Market data unavailable');
      const data = await response.json();
      const parsed = Array.isArray(data) ? data[0]?.price || data[0]?.gold || data[0] : null;

      if (typeof parsed === 'number') {
        setGoldPrice(parsed);
        setMarketStatus('success');
        setUpdatedAt(new Date().toISOString());
      } else {
        throw new Error('Gold data unavailable');
      }
    } catch (error) {
      setMarketStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchGoldPrice();
  }, [fetchGoldPrice]);

  // Sample investment data
  const investments = {
    gold: {
      name: 'Gold Investment',
      icon: '🏆',
      description: 'Physical or digital gold - safe and traditional',
      currentPrice: goldPrice || 7400,
      minInvestment: 1000,
      monthlyReturn: '0.5% - 1%',
      riskLevel: 'Low',
      timeframe: '5+ years',
      pros: ['Inflation hedge', 'Portable', 'Liquid'],
      cons: ['No income', 'Storage costs'],
      suitable: (balance) => balance >= 1000
    },
    sip: {
      name: 'SIP (Mutual Funds)',
      icon: '📊',
      description: 'Systematic Investment Plan - invest regularly',
      currentOptions: ['Index Fund', 'Balanced Fund', 'Multi-Asset'],
      minInvestment: 500,
      monthlyReturn: '8% - 12% (historical)',
      riskLevel: 'Medium',
      timeframe: '5-10 years',
      pros: ['Rupee cost averaging', 'Diversified', 'Low entry'],
      cons: ['Market risk', 'Lock-in periods'],
      suitable: (balance) => balance >= 1000
    },
    stocks: {
      name: 'Stock Market',
      icon: '📈',
      description: 'Direct equity investments for long-term wealth',
      examples: [
        { symbol: 'RELIANCE', price: 2850, pe: 24.5 },
        { symbol: 'TCS', price: 3920, pe: 28.2 },
        { symbol: 'HDFC', price: 2150, pe: 22.1 }
      ],
      minInvestment: 2000,
      monthlyReturn: '12% - 15% (potential)',
      riskLevel: 'High',
      timeframe: '7+ years',
      pros: ['High growth potential', 'Ownership stake', 'Dividends'],
      cons: ['High volatility', 'Requires research'],
      suitable: (balance) => balance >= 5000
    },
    recurringDeposit: {
      name: 'Recurring Deposits',
      icon: '💰',
      description: 'Fixed deposits with guaranteed returns',
      currentRate: '6.5% - 7.5% p.a.',
      minInvestment: 500,
      monthlyReturn: 'Fixed (6.5%-7.5%)',
      riskLevel: 'Very Low',
      timeframe: '6 months - 10 years',
      pros: ['Guaranteed returns', 'Safe', 'FDIC insured'],
      cons: ['Lower returns', 'Inflation risk'],
      suitable: (balance) => balance >= 500
    }
  };

  // Generate recommendations based on savings
  const getRecommendations = () => {
    const recommendations = [];

    if (remainingBalance >= 5000) {
      recommendations.push({
        title: '🌟 Diversified Wealth Building',
        icon: '💼',
        strategy: 'Balanced approach for maximum growth',
        allocation: [
          { type: 'Stocks', percentage: 40, amount: remainingBalance * 0.4 },
          { type: 'SIP', percentage: 35, amount: remainingBalance * 0.35 },
          { type: 'Gold', percentage: 15, amount: remainingBalance * 0.15 },
          { type: 'Emergency Fund', percentage: 10, amount: remainingBalance * 0.1 }
        ]
      });
    } else if (remainingBalance >= 3000) {
      recommendations.push({
        title: '📊 Moderate Growth Strategy',
        icon: '🎯',
        strategy: 'Balance growth with safety',
        allocation: [
          { type: 'SIP', percentage: 50, amount: remainingBalance * 0.5 },
          { type: 'Gold', percentage: 30, amount: remainingBalance * 0.3 },
          { type: 'Recurring Deposit', percentage: 20, amount: remainingBalance * 0.2 }
        ]
      });
    } else if (remainingBalance >= 1000) {
      recommendations.push({
        title: '🛡️ Conservative Start',
        icon: '🏦',
        strategy: 'Safe investments for beginners',
        allocation: [
          { type: 'SIP', percentage: 60, amount: remainingBalance * 0.6 },
          { type: 'Gold', percentage: 40, amount: remainingBalance * 0.4 }
        ]
      });
    }

    return recommendations;
  };

  const getInvestmentAdvice = () => {
    if (remainingBalance <= 0) {
      return 'Focus on reducing expenses first. Once you have positive savings, we can start investing!';
    }
    if (remainingBalance < 1000) {
      return `You're saving ₹${remainingBalance.toFixed(2)}/month. Build this to ₹1000+ to start investing. Meanwhile, keep tracking!`;
    }
    if (remainingBalance < 3000) {
      return `Great! With ₹${remainingBalance.toFixed(2)}/month, start with SIPs and recurring deposits—low risk, consistent growth.`;
    }
    if (remainingBalance < 5000) {
      return `Excellent! ₹${remainingBalance.toFixed(2)}/month allows balanced investing. Mix SIPs, gold, and recurring deposits.`;
    }
    return `Outstanding! ₹${remainingBalance.toFixed(2)}/month gives you full flexibility. Diversify across stocks, SIPs, and gold.`;
  };

  if (salary === 0) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
        <p className="text-amber-700 font-semibold mb-2">💡 Set Income to Get Investment Advice</p>
        <p className="text-amber-600 text-sm">Add your monthly income to see personalized investment suggestions and wealth-building strategies.</p>
      </div>
    );
  }

  const recommendations = getRecommendations();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-200 shadow-md transition hover:shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-yellow-800 font-semibold text-sm">Live Market Insights</p>
            <p className="text-yellow-700 text-sm mt-1">
              {marketStatus === 'loading'
                ? 'Fetching market data...'
                : marketStatus === 'error'
                  ? 'Live market data unavailable right now.'
                  : `Current gold price: ₹${goldPrice.toFixed(2)}`}
            </p>
            <p className="text-yellow-700 text-xs mt-1">
              {updatedAt ? `Last updated just now (${new Date(updatedAt).toLocaleTimeString()})` : 'Last updated: —'}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchGoldPrice}
            disabled={marketStatus === 'loading'}
            className="text-xs font-medium px-2 py-1 rounded border border-yellow-300 text-yellow-700 hover:bg-yellow-100 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
        <p className="text-yellow-700 text-sm mt-3">
          {stocks[0].name} is trending {stocks[0].trend}, {stocks[1].name} is {stocks[1].trend}.
        </p>
      </motion.div>

      {/* Investment Advice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-md transition hover:shadow-lg"
      >
        <p className="text-purple-700 font-semibold text-sm mb-2">💼 Investment Strategy</p>
        <p className="text-purple-600 text-sm">{getInvestmentAdvice()}</p>
        {remainingBalance > 0 && (
          <p className="text-purple-500 text-xs mt-2">
            📌 You can invest up to <span className="font-bold">₹{remainingBalance.toFixed(2)}/month</span>
          </p>
        )}
      </motion.div>

      {/* Recommended Allocation */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Recommended Allocation</h3>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">{rec.icon}</span>
                <div>
                  <p className="font-semibold text-blue-700">{rec.title}</p>
                  <p className="text-xs text-blue-600">{rec.strategy}</p>
                </div>
              </div>

              <div className="space-y-2">
                {rec.allocation.map((alloc, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{alloc.type}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {alloc.percentage}% (₹{alloc.amount.toFixed(0)})
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${alloc.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Investment Options */}
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Suggested Investments</h3>

      <div className="grid grid-cols-1 gap-4">
        {/* Gold Investment */}
        {investments.gold.suitable(remainingBalance) && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-yellow-800 text-lg">{investments.gold.icon} {investments.gold.name}</h4>
              <span className="text-xs font-semibold px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                {investments.gold.riskLevel} Risk
              </span>
            </div>

            <p className="text-sm text-yellow-700 mb-3">{investments.gold.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-xs text-gray-600">Current Price</p>
                <p className="font-bold text-yellow-600">₹{investments.gold.currentPrice}/gram</p>
              </div>
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-xs text-gray-600">Min Investment</p>
                <p className="font-bold text-yellow-600">₹{investments.gold.minInvestment}</p>
              </div>
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-xs text-gray-600">Return Rate</p>
                <p className="font-bold text-yellow-600">{investments.gold.monthlyReturn}</p>
              </div>
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-xs text-gray-600">Timeframe</p>
                <p className="font-bold text-yellow-600">{investments.gold.timeframe}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-yellow-800 mb-1">✅ Pros:</p>
                <ul className="space-y-1 text-yellow-700">
                  {investments.gold.pros.map((pro, i) => <li key={i}>• {pro}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-yellow-800 mb-1">⚠️ Cons:</p>
                <ul className="space-y-1 text-yellow-700">
                  {investments.gold.cons.map((con, i) => <li key={i}>• {con}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SIP Investment */}
        {investments.sip.suitable(remainingBalance) && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-green-800 text-lg">{investments.sip.icon} {investments.sip.name}</h4>
              <span className="text-xs font-semibold px-2 py-1 bg-green-200 text-green-800 rounded">
                {investments.sip.riskLevel} Risk
              </span>
            </div>

            <p className="text-sm text-green-700 mb-3">{investments.sip.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-2 rounded border border-green-100">
                <p className="text-xs text-gray-600">Min Investment</p>
                <p className="font-bold text-green-600">₹{investments.sip.minInvestment}/month</p>
              </div>
              <div className="bg-white p-2 rounded border border-green-100">
                <p className="text-xs text-gray-600">Expected Return</p>
                <p className="font-bold text-green-600">{investments.sip.monthlyReturn}</p>
              </div>
              <div className="bg-white p-2 rounded border border-green-100">
                <p className="text-xs text-gray-600">Popular Options</p>
                <p className="font-bold text-green-600">{investments.sip.currentOptions[0]}</p>
              </div>
              <div className="bg-white p-2 rounded border border-green-100">
                <p className="text-xs text-gray-600">Recommended</p>
                <p className="font-bold text-green-600">₹2000-5000/month</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-green-800 mb-1">✅ Pros:</p>
                <ul className="space-y-1 text-green-700">
                  {investments.sip.pros.map((pro, i) => <li key={i}>• {pro}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-green-800 mb-1">⚠️ Cons:</p>
                <ul className="space-y-1 text-green-700">
                  {investments.sip.cons.map((con, i) => <li key={i}>• {con}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stock Investment */}
        {investments.stocks.suitable(remainingBalance) && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-blue-800 text-lg">{investments.stocks.icon} {investments.stocks.name}</h4>
              <span className="text-xs font-semibold px-2 py-1 bg-red-200 text-red-800 rounded">
                {investments.stocks.riskLevel} Risk
              </span>
            </div>

            <p className="text-sm text-blue-700 mb-3">{investments.stocks.description}</p>

            <div className="mb-3">
              <p className="text-xs font-semibold text-blue-800 mb-2">💡 Stock Examples:</p>
              <div className="space-y-2">
                {investments.stocks.examples.map((stock, i) => (
                  <div key={i} className="bg-white p-2 rounded border border-blue-100 flex justify-between">
                    <div>
                      <p className="font-bold text-blue-800">{stock.symbol}</p>
                      <p className="text-xs text-gray-600">PE Ratio: {stock.pe}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">₹{stock.price}</p>
                      <p className="text-xs text-green-600">LTP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-xs text-gray-600">Min Investment</p>
                <p className="font-bold text-blue-600">₹{investments.stocks.minInvestment}</p>
              </div>
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-xs text-gray-600">Expected Return</p>
                <p className="font-bold text-blue-600">{investments.stocks.monthlyReturn}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-blue-800 mb-1">✅ Pros:</p>
                <ul className="space-y-1 text-blue-700">
                  {investments.stocks.pros.map((pro, i) => <li key={i}>• {pro}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-1">⚠️ Cons:</p>
                <ul className="space-y-1 text-blue-700">
                  {investments.stocks.cons.map((con, i) => <li key={i}>• {con}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recurring Deposit */}
        {investments.recurringDeposit.suitable(remainingBalance) && (
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-cyan-800 text-lg">{investments.recurringDeposit.icon} {investments.recurringDeposit.name}</h4>
              <span className="text-xs font-semibold px-2 py-1 bg-cyan-200 text-cyan-800 rounded">
                {investments.recurringDeposit.riskLevel} Risk
              </span>
            </div>

            <p className="text-sm text-cyan-700 mb-3">{investments.recurringDeposit.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-2 rounded border border-cyan-100">
                <p className="text-xs text-gray-600">Current Rate</p>
                <p className="font-bold text-cyan-600">{investments.recurringDeposit.currentRate}</p>
              </div>
              <div className="bg-white p-2 rounded border border-cyan-100">
                <p className="text-xs text-gray-600">Min Investment</p>
                <p className="font-bold text-cyan-600">₹{investments.recurringDeposit.minInvestment}/month</p>
              </div>
              <div className="bg-white p-2 rounded border border-cyan-100">
                <p className="text-xs text-gray-600">Return Rate</p>
                <p className="font-bold text-cyan-600">Fixed (6.5%-7.5%)</p>
              </div>
              <div className="bg-white p-2 rounded border border-cyan-100">
                <p className="text-xs text-gray-600">Timeframe</p>
                <p className="font-bold text-cyan-600">{investments.recurringDeposit.timeframe}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-cyan-800 mb-1">✅ Pros:</p>
                <ul className="space-y-1 text-cyan-700">
                  {investments.recurringDeposit.pros.map((pro, i) => <li key={i}>• {pro}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-cyan-800 mb-1">⚠️ Cons:</p>
                <ul className="space-y-1 text-cyan-700">
                  {investments.recurringDeposit.cons.map((con, i) => <li key={i}>• {con}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <p className="font-semibold mb-1">📌 Disclaimer:</p>
        <p>This is educational information only. Past returns don't guarantee future results. Consult a licensed financial advisor before investing. Review all risks carefully.</p>
      </div>
    </div>
  );
}
