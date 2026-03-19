export const INVESTMENT_CATEGORY = 'Investment';

const CATEGORY_MAPPINGS = {
  Transport: ['bus', 'auto', 'cab', 'taxi', 'transport', 'fuel', 'petrol', 'diesel', 'metro', 'train', 'ride', 'uber', 'travel'],
  Food: ['swiggy', 'zomato', 'food', 'restaurant', 'dining', 'cafe', 'coffee', 'pizza', 'burger', 'delivery'],
  Housing: ['rent', 'housing', 'apartment', 'house', 'mortgage', 'home'],
  Utilities: ['electricity', 'utilities', 'water', 'internet', 'phone', 'bill', 'broadband'],
  Entertainment: ['movie', 'cinema', 'entertainment', 'games', 'subscription', 'netflix', 'spotify', 'streaming'],
  Grocery: ['grocery', 'supermarket', 'market', 'shopping', 'vegetables', 'fruits'],
  Health: ['medicine', 'doctor', 'hospital', 'health', 'gym', 'fitness', 'pharma', 'medical']
};

const INVESTMENT_SUBCATEGORY_MAP = {
  Gold: ['gold'],
  SIP: ['sip'],
  'Mutual Fund': ['mutual fund', 'mutual funds'],
  Stocks: ['stock', 'stocks', 'equity', 'share market', 'shares'],
  FD: ['fd', 'fixed deposit'],
  RD: ['rd', 'recurring deposit']
};

const titleCase = (value) => {
  if (!value) return '';
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const containsKeyword = (source, keyword) => source === keyword || source.includes(keyword);

export const detectExpenseCategory = (rawCategory) => {
  const categoryInput = (rawCategory || '').trim();
  const normalized = categoryInput.toLowerCase();

  for (const [subcategory, keywords] of Object.entries(INVESTMENT_SUBCATEGORY_MAP)) {
    if (keywords.some((keyword) => containsKeyword(normalized, keyword))) {
      return {
        category: INVESTMENT_CATEGORY,
        subcategory
      };
    }
  }

  for (const [mainCategory, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    if (keywords.some((keyword) => containsKeyword(normalized, keyword))) {
      return {
        category: mainCategory,
        subcategory: titleCase(categoryInput) || mainCategory
      };
    }
  }

  const fallbackCategory = titleCase(categoryInput);
  return {
    category: fallbackCategory,
    subcategory: fallbackCategory
  };
};

