import { useState, useRef, useEffect } from 'react';
import { INVESTMENT_CATEGORY } from '../utils/financeUtils';

export default function ChatBot({ expenses, salary, savingsGoal }) {
  const [userName, setUserName] = useState('Vibha');
  const [isEditingName, setIsEditingName] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello Vibha! I\'m your AI Finance Assistant. Use quick actions below or ask about your spending, savings goals, investments, or get personalized advice!'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calculate metrics from expenses
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = salary - totalSpending;

  const parseAmountFromQuery = (queryText) => {
    const matchedAmount = queryText.match(/(\d+(?:\.\d+)?)/);
    return matchedAmount ? parseFloat(matchedAmount[1]) : null;
  };

  // Get top category
  const getCategoryBreakdown = () => {
    return expenses.reduce((breakdown, expense) => {
      const category = expense.category;
      if (breakdown[category]) {
        breakdown[category] += expense.amount;
      } else {
        breakdown[category] = expense.amount;
      }
      return breakdown;
    }, {});
  };

  const getTopCategory = () => {
    const categoryBreakdown = getCategoryBreakdown();
    const topCategory = Object.entries(categoryBreakdown).reduce((max, [category, amount]) =>
      amount > max[1] ? [category, amount] : max,
      ['', 0]
    );
    return topCategory;
  };

  const getInvestmentDetails = () => {
    const investmentExpenses = expenses.filter((expense) => expense.category === INVESTMENT_CATEGORY);
    const investmentTotal = investmentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const investmentSubcategories = investmentExpenses.reduce((acc, expense) => {
      const subcategory = expense.subcategory || INVESTMENT_CATEGORY;
      acc[subcategory] = (acc[subcategory] || 0) + expense.amount;
      return acc;
    }, {});

    const topInvestment = Object.entries(investmentSubcategories).reduce(
      (max, [subcategory, amount]) => (amount > max[1] ? [subcategory, amount] : max),
      ['', 0]
    );

    return {
      investmentTotal,
      topInvestment
    };
  };

  // Detect spending trend
  const getSpendingTrend = () => {
    if (expenses.length < 2) return null;
    
    const midpoint = Math.ceil(expenses.length / 2);
    const recentExpenses = expenses.slice(midpoint);
    const earlierExpenses = expenses.slice(0, midpoint);
    
    const recentTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const earlierTotal = earlierExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const recentAvg = recentTotal / recentExpenses.length;
    const earlierAvg = earlierTotal / earlierExpenses.length;
    
    const percentageChange = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    return {
      percentageChange,
      isIncreasing: percentageChange > 10,
      isDecreasing: percentageChange < -10,
      isStable: percentageChange >= -10 && percentageChange <= 10
    };
  };

  // Get category-wise spending details
  const getCategoryDetails = () => {
    const categoryBreakdown = getCategoryBreakdown();
    return Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Generate AI response based on user query
  const generateResponse = (userQuery) => {
    const query = userQuery.toLowerCase().trim();

    // If no expenses, give generic help message
    if (expenses.length === 0 && !query.includes('goal') && !query.includes('income')) {
      return `${userName}, start by adding your first expense! Once you track spending, I can give you personalized insights on where to save and how to invest.`;
    }

    const categoryDetails = getCategoryDetails();
    const [topCategory, topAmount] = getTopCategory();
    const trend = getSpendingTrend();
    const { investmentTotal, topInvestment } = getInvestmentDetails();

    if (query.includes('can i afford this') || query.includes('can i afford')) {
      if (salary === 0) {
        return `${userName}, set your monthly income first and I will check affordability in real time.`;
      }

      const askedAmount = parseAmountFromQuery(query);

      if (!askedAmount) {
        const comfortBuffer = remainingBalance * 0.2;
        if (remainingBalance > 0) {
          return `Based on your current balance of ₹${remainingBalance.toFixed(2)}, you can afford this comfortably if the cost stays below ₹${(remainingBalance - comfortBuffer).toFixed(2)}.`;
        }
        return `Based on your current balance, you cannot afford this comfortably right now. You are overspent by ₹${Math.abs(remainingBalance).toFixed(2)}.`;
      }

      const postPurchaseBalance = remainingBalance - askedAmount;
      if (postPurchaseBalance >= 0) {
        return `Based on your current balance of ₹${remainingBalance.toFixed(2)}, you can afford this comfortably. After buying ₹${askedAmount.toFixed(2)}, you will still have ₹${postPurchaseBalance.toFixed(2)}.`;
      }

      return `Based on your current balance of ₹${remainingBalance.toFixed(2)}, you cannot afford this comfortably. This purchase creates a gap of ₹${Math.abs(postPurchaseBalance).toFixed(2)}.`;
    }

    if (query.includes('should i buy')) {
      if (salary === 0) {
        return `${userName}, share your income first so I can judge if this purchase is safe.`;
      }

      const askedAmount = parseAmountFromQuery(query);
      const spendingRatio = salary > 0 ? (totalSpending / salary) * 100 : 0;

      if (!askedAmount) {
        if (remainingBalance > 0 && spendingRatio < 70) {
          return `You are spending ${spendingRatio.toFixed(1)}% of income and still have ₹${remainingBalance.toFixed(2)} left. You can buy it if it doesn't disturb your savings goal.`;
        }

        return `Your current spending is ${spendingRatio.toFixed(1)}% of income with ₹${remainingBalance.toFixed(2)} left. I suggest waiting or choosing a lower-cost option this month.`;
      }

      const postPurchaseBalance = remainingBalance - askedAmount;
      if (postPurchaseBalance >= savingsGoal && spendingRatio <= 75) {
        return `Yes, this looks manageable. Even after ₹${askedAmount.toFixed(2)}, you should keep ₹${postPurchaseBalance.toFixed(2)} and stay aligned with your savings goal.`;
      }

      return `I would pause this purchase for now. Buying ₹${askedAmount.toFixed(2)} leaves ₹${postPurchaseBalance.toFixed(2)}, which can weaken your savings plan this month.`;
    }

    // INTENT: "Spending" - Total + Trend + Actionable Savings
    if (query.includes('spending') || query.includes('spent') || query.includes('total spending') || query.includes('expense')) {
      if (expenses.length === 0) {
        return 'You haven\'t tracked any expenses yet. Start logging your spending to see insights!';
      }

      let response = `${userName}, you've spent ₹${totalSpending.toFixed(2)} across ${expenses.length} transactions. `;
      
      if (salary > 0) {
        const spendingPercent = ((totalSpending / salary) * 100).toFixed(1);
        response += `That's ${spendingPercent}% of your income. `;
      }

      if (investmentTotal > 0) {
        response += `You have also tagged ₹${investmentTotal.toFixed(2)} as investments${topInvestment[0] ? `, mostly ${topInvestment[0]}` : ''}. `;
      }

      // Add trend info
      if (trend?.isIncreasing) {
        response += `Your recent spending is trending up—mostly on ${topCategory}. `;
        const topSpends = categoryDetails.slice(0, 3);
        const reducibleAmount = (topSpends.reduce((sum, cat) => sum + cat.amount, 0) * 0.15).toFixed(2);
        response += `Cutting just 15% from your top 3 categories could save you ₹${reducibleAmount}!`;
      } else if (trend?.isDecreasing) {
        response += `Great news! Your spending is trending down. Keep up this discipline! `;
        response += `Top category is ${topCategory} at ₹${topAmount.toFixed(2)}.`;
      } else {
        response += `Your spending is stable at ₹${(totalSpending / expenses.length).toFixed(2)}/transaction on average. `;
        response += `Focus on reducing ${topCategory} (₹${topAmount.toFixed(2)}) to improve savings.`;
      }

      return response;
    }

    // INTENT: "Save" or "Saving" - Top Category + Specific Savings Amount
    if (query.includes('save') || query.includes('saving') || query.includes('reduce spending') || query.includes('cut back')) {
      if (expenses.length === 0) {
        return `${userName}, add some expenses first so I can identify where you're spending the most and where cuts matter most!`;
      }

      let response = `${userName}, focus on ${topCategory}—you're spending ₹${topAmount.toFixed(2)} here, which is your highest expense. `;
      
      const savingsIfCut20 = (topAmount * 0.2).toFixed(2);
      response += `If you reduce this by just 20%, you could save ₹${savingsIfCut20} monthly! `;

      if (categoryDetails[1]) {
        const secondCategory = categoryDetails[1];
        response += `Your second biggest expense is ${secondCategory.category} at ₹${secondCategory.amount.toFixed(2)}—cutting 10% here saves another ₹${(secondCategory.amount * 0.1).toFixed(2)}.`;
      } else {
        response += `Small cuts add up over time!`;
      }

      return response;
    }

    // INTENT: "Goal" - Goal Status & Progress
    if (query.includes('goal') || query.includes('target') || query.includes('progress')) {
      let response = '';

      if (savingsGoal === 0 && salary === 0) {
        response = `${userName}, set your monthly income and savings goal first! Then I can track your progress and celebrate your wins.`;
      } else if (savingsGoal === 0) {
        response = `${userName}, you haven't set a savings goal yet. Set one up so I can help you track progress toward your target!`;
      } else if (salary === 0) {
        response = `${userName}, set your monthly income to see how close you are to reaching your ₹${savingsGoal} savings goal!`;
      } else {
        const recentSpending = expenses.slice(-5).reduce((sum, exp) => sum + exp.amount, 0);
        const canSave = salary - (totalSpending / Math.max(1, expenses.length));
        
        response = `Your savings goal is ₹${savingsGoal.toFixed(2)}/month. `;

        if (remainingBalance >= savingsGoal) {
          response += `Amazing, ${userName}! You're already saving ₹${remainingBalance.toFixed(2)}, which exceeds your goal by ₹${(remainingBalance - savingsGoal).toFixed(2)}. Keep this momentum!`;
        } else if (remainingBalance > 0) {
          const shortfall = (savingsGoal - remainingBalance).toFixed(2);
          response += `You're at ₹${remainingBalance.toFixed(2)} saved, just ₹${shortfall} short of your goal. `;
          response += `Cut ₹${shortfall} from ${topCategory} and you'll reach it!`;
        } else {
          response += `You're currently not meeting your goal. `;
          response += `Reduce spending by ₹${(Math.abs(remainingBalance) + savingsGoal).toFixed(2)} to hit ₹${savingsGoal.toFixed(2)} saved monthly.`;
        }
      }

      return response;
    }

    // INTENT: "Investment" - Suggestions Based on Savings Level
    if (query.includes('invest') || query.includes('investment') || query.includes('grow') || query.includes('where to invest')) {
      if (salary === 0) {
        return `${userName}, set your monthly income first so I can see how much you can safely invest each month!`;
      }

      const isMonthlyPlanRequest = query.includes('investment plan') || query.includes('plan for this month') || query.includes('monthly plan');
      const isSafeProfile = query.includes('safe') || query.includes('conservative') || query.includes('low risk');
      const isAggressiveProfile = query.includes('aggressive') || query.includes('high risk') || query.includes('growth');
      const profileLabel = isSafeProfile ? 'Safe' : isAggressiveProfile ? 'Aggressive' : 'Balanced';

      const getRatios = () => {
        if (isSafeProfile) {
          return { sip: 0.45, gold: 0.35, stocks: 0.2 };
        }

        if (isAggressiveProfile) {
          return { sip: 0.35, gold: 0.2, stocks: 0.45 };
        }

        return { sip: 0.4, gold: 0.25, stocks: 0.35 };
      };

      let response = '';

      if (remainingBalance <= 1000) {
        response = `${userName}, you're saving ₹${remainingBalance.toFixed(2)}/month. Keep this month simple: build emergency buffer and start a small RD or gold plan from ₹500.`;
      } else if (remainingBalance < 5000) {
        const investAmount = Math.floor(remainingBalance * 0.5);
        const ratios = getRatios();
        const sipAmount = Math.floor(investAmount * ratios.sip);
        const goldAmount = Math.floor(investAmount * ratios.gold);
        const stocksAmount = Math.floor(investAmount * ratios.stocks);

        if (isMonthlyPlanRequest) {
          return `${profileLabel} monthly plan: SIP ₹${sipAmount} | Gold ₹${goldAmount} | Stocks ₹${stocksAmount}. Keep ₹${(remainingBalance - investAmount).toFixed(2)} as emergency buffer.`;
        }

        response = `${userName}, you can invest around ₹${investAmount}/month. Start with SIP + gold for balance, and keep ₹${(remainingBalance - investAmount).toFixed(2)} as buffer.`;
      } else if (remainingBalance < 10000) {
        const investAmount = Math.floor(remainingBalance * 0.6);
        const ratios = getRatios();
        const sipAmount = Math.floor(investAmount * ratios.sip);
        const goldAmount = Math.floor(investAmount * ratios.gold);
        const stocksAmount = Math.floor(investAmount * ratios.stocks);

        if (isMonthlyPlanRequest) {
          return `${profileLabel} monthly plan: SIP ₹${sipAmount} | Gold ₹${goldAmount} | Stocks ₹${stocksAmount}. Reserve ₹${(remainingBalance - investAmount).toFixed(2)} for flexibility.`;
        }

        response = `${userName}, with ₹${remainingBalance.toFixed(2)} savings, invest ₹${investAmount} with a simple split. `;
        response += `Try ₹${sipAmount} in SIP, ₹${goldAmount} in gold, and ₹${stocksAmount} in large-cap stocks.`;
      } else {
        const investAmount = Math.floor(remainingBalance * 0.9);
        const ratios = getRatios();
        const stockAmount = Math.floor(investAmount * ratios.stocks);
        const sipAmount = Math.floor(investAmount * ratios.sip);
        const goldAmount = Math.floor(investAmount * ratios.gold);

        if (isMonthlyPlanRequest) {
          return `${profileLabel} monthly plan: SIP ₹${sipAmount} | Gold ₹${goldAmount} | Stocks ₹${stockAmount}. Keep ₹${Math.floor(remainingBalance * 0.1)} for cash/RD stability.`;
        }

        response = `${userName}, excellent savings! Invest ₹${stockAmount} in stocks, ₹${sipAmount} in SIPs, and ₹${goldAmount} in gold this month. `;
        response += `Keep the rest in cash or RD for flexibility and stability.`;
      }

      if (investmentTotal > 0) {
        response += ` You already invested ₹${investmentTotal.toFixed(2)}${topInvestment[0] ? `, with ${topInvestment[0]} leading` : ''}.`;
      }

      return response;
    }

    // INTENT: "Balance" or "Remaining"
    if (query.includes('balance') || query.includes('remaining') || query.includes('left') || query.includes('how much')) {
      if (salary === 0) {
        return `${userName}, set your monthly income first to see your remaining balance and how much you can save!`;
      }

      if (remainingBalance >= 0) {
        const savingsPercent = ((remainingBalance / salary) * 100).toFixed(1);
        return `${userName}, your remaining balance is ₹${remainingBalance.toFixed(2)} (${savingsPercent}% of income)—excellent! This is healthy savings. Consider investing this for long-term wealth.`;
      } else {
        const overspentAmount = Math.abs(remainingBalance);
        return `${userName}, you've overspent by ₹${overspentAmount.toFixed(2)} this month. Don't panic! Next month, reduce ${topCategory} by ₹${(overspentAmount * 0.5).toFixed(2)} and cut other categories by ₹${(overspentAmount * 0.5).toFixed(2)} to get back on track.`;
      }
    }

    // INTENT: "Advice" - General Financial Guidance
    if (query.includes('advice') || query.includes('suggest') || query.includes('help') || query.includes('tips') || query.includes('how to')) {
      if (expenses.length === 0) {
        return `${userName}, track your daily expenses for 1 week. This is the foundation - you cannot improve what you do not measure!`;
      }

      let advice = '';

      if (remainingBalance < 0) {
        advice = `${userName}, priority: Reduce spending by ₹${Math.abs(remainingBalance).toFixed(2)} monthly. `;
        advice += `Start with ${topCategory} - cut 30% from there and you will be profitable.`;
      } else if (remainingBalance <= 1000) {
        advice = `${userName}, you are saving ₹${remainingBalance.toFixed(2)}/month. That is good! `;
        advice += `Challenge: Cut ₹${Math.floor(remainingBalance / 2)} from ${topCategory} to double your savings. Emergency fund should be ₹10,000.`;
      } else if (remainingBalance <= 5000) {
        const nextMilestone = 5000 - remainingBalance;
        advice = `${userName}, you are doing well with ₹${remainingBalance.toFixed(2)}/month! `;
        advice += `Next target: Hit ₹5,000/month (need ₹${nextMilestone.toFixed(2)} more), then start a ₹500/month SIP for long-term wealth.`;
      } else {
        advice = `${userName}, outstanding! You are saving ₹${remainingBalance.toFixed(2)}/month. `;
        advice += `Now invest 50-60% (₹${Math.floor(remainingBalance * 0.5)}) in diversified portfolio - SIPs, stocks, gold. Wealth builds through consistent investing!`;
      }

      return advice;
    }

    // INTENT: "Summary" or "Overview"
    if (query.includes('summary') || query.includes('overview') || query.includes('status') || query.includes('how am i doing')) {
      if (expenses.length === 0) {
        return `${userName}, no spending data yet. Add your first expense and I'll give you a full financial health check!`;
      }

      const categoryCount = Object.keys(getCategoryBreakdown()).length;
      let summary = `📊 Quick snapshot: ₹${totalSpending.toFixed(2)} spent in ${categoryCount} categories (${expenses.length} transactions). `;
      summary += `Top spender: ${topCategory} (₹${topAmount.toFixed(2)}). `;
      if (investmentTotal > 0) {
        summary += `Investments tracked: ₹${investmentTotal.toFixed(2)}. `;
      }

      if (salary > 0) {
        summary += `Remaining: ₹${remainingBalance.toFixed(2)}. `;
        summary += remainingBalance >= savingsGoal 
          ? `Goal met—you're tracking great!` 
          : `Target your goal by reducing ${topCategory}.`;
      } else {
        summary += `Set your income to see complete financial picture.`;
      }

      return summary;
    }

    // Default helpful response
    return `${userName}, I can help with: "spending", "saving tips", "goal progress", "investment ideas", "balance", "advice", or "summary". What would you like to know?`;
  };

  const handleSend = () => {
    if (input.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input
    };

    // Generate bot response
    const botResponse = {
      id: messages.length + 2,
      type: 'bot',
      text: generateResponse(input)
    };

    setMessages([...messages, userMessage, botResponse]);
    setInput('');
  };

  // Handle quick action buttons
  const handleQuickAction = (action) => {
    const actionMessages = {
      'spending': 'What is my total spending this month?',
      'saving': 'How can I save more money?',
      'investment': 'What are some investment ideas for me?',
      'afford': 'Can I afford this 2500 purchase?',
      'buy': 'Should I buy this 3000 item?',
      'monthlyInvestmentPlan': 'Give me an investment plan for this month.',
      'safePlan': 'Give me a safe investment plan for this month.',
      'balancedPlan': 'Give me a balanced investment plan for this month.',
      'aggressivePlan': 'Give me an aggressive investment plan for this month.'
    };

    const messageText = actionMessages[action];
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: messageText
    };

    // Generate bot response
    const botResponse = {
      id: messages.length + 2,
      type: 'bot',
      text: generateResponse(messageText)
    };

    setMessages([...messages, userMessage, botResponse]);
  };

  const handleNameChange = (e) => {
    const newName = e.target.value || 'Vibha';
    setUserName(newName);
    // Update the greeting message to include new name
    const updatedMessages = [...messages];
    if (updatedMessages[0]) {
      updatedMessages[0].text = `Hello ${newName}! I'm your AI Finance Assistant. Use quick actions below or ask about your spending, savings goals, investments, or get personalized advice!`;
      setMessages(updatedMessages);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-4 rounded-t-xl flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">AI Finance Assistant</h2>
          {isEditingName ? (
            <input
              type="text"
              value={userName}
              onChange={handleNameChange}
              onBlur={() => setIsEditingName(false)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              autoFocus
              className="text-sm px-2 py-1 rounded text-indigo-600 font-semibold w-32"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs bg-indigo-400 hover:bg-indigo-300 px-2 py-1 rounded transition"
            >
              {userName}
            </button>
          )}
        </div>
        <p className="text-xs text-indigo-100">Hi {userName}! Get personalized financial advice</p>
      </div>

      {/* Messages Container - Fixed Height with Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl flex-shrink-0 space-y-3">
        {/* Quick Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickAction('spending')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Check Spending
          </button>
          <button
            onClick={() => handleQuickAction('saving')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Savings Advice
          </button>
          <button
            onClick={() => handleQuickAction('investment')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Investment Ideas
          </button>
          <button
            onClick={() => handleQuickAction('afford')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Can I Afford This?
          </button>
          <button
            onClick={() => handleQuickAction('buy')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Should I Buy?
          </button>
          <button
            onClick={() => handleQuickAction('monthlyInvestmentPlan')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Monthly Investment Plan
          </button>
          <button
            onClick={() => handleQuickAction('safePlan')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Safe Plan
          </button>
          <button
            onClick={() => handleQuickAction('balancedPlan')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Balanced Plan
          </button>
          <button
            onClick={() => handleQuickAction('aggressivePlan')}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition border border-gray-200 font-medium"
          >
            Aggressive Plan
          </button>
        </div>

        {/* Input Box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about spending, advice, categories..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200 text-sm"
          />
          <button
            onClick={handleSend}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Try: "safe investment plan", "balanced investment plan", "aggressive investment plan", or use quick buttons above
        </p>
      </div>
    </div>
  );
}
