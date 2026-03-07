const calculate = (expression: string): number => {
  // Remove whitespace and validate characters
  const cleanExpr = expression.replace(/\s/g, '');
  
  // Only allow numbers, operators, parentheses, and decimal points
  if (!/^[\d+\-*/().]+$/.test(cleanExpr)) {
    throw new Error('Invalid characters in expression');
  }

  if (!cleanExpr) {
    throw new Error('Expression is empty');
  }

  // Quick structure checks before evaluation
  const operatorPattern = /[+\-*/]{2,}/;
  if (operatorPattern.test(cleanExpr.replace(/\*\*/g, '#'))) {
    throw new Error('Invalid expression');
  }

  if (/^[*/]/.test(cleanExpr) || /[+\-*/.]$/.test(cleanExpr)) {
    throw new Error('Invalid expression');
  }

  let balance = 0;
  for (const ch of cleanExpr) {
    if (ch === '(') balance += 1;
    if (ch === ')') balance -= 1;
    if (balance < 0) {
      throw new Error('Unbalanced parentheses');
    }
  }
  if (balance !== 0) {
    throw new Error('Unbalanced parentheses');
  }

  try {
    // Use Function constructor to safely evaluate the expression
    const result = new Function('return ' + cleanExpr)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    return result;
  } catch {
    throw new Error('Invalid expression');
  }
};

export { calculate };
