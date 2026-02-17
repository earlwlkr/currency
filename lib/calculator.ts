const calculate = (expression: string): number => {
  // Remove whitespace and validate characters
  const cleanExpr = expression.replace(/\s/g, '');
  
  // Only allow numbers, operators, parentheses, and decimal points
  if (!/^[\d+\-*/().]+$/.test(cleanExpr)) {
    throw new Error('Invalid characters in expression');
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
