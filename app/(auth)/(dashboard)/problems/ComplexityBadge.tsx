'use client'

interface ComplexityBadgeProps {
  complexity: string;
}

const ComplexityBadge = ({ complexity }: ComplexityBadgeProps) => {
  const formatComplexity = (complexity: string) => {
    // Remove all spaces and convert to lowercase for consistent matching
    const normalized = complexity.toLowerCase().replace(/\s+/g, '');
    
    const complexityMap: { [key: string]: string } = {
      // Constant
      'o(1)': 'O(1)',
      'constant': 'O(1)',
      
      // Logarithmic
      'o(logn)': 'O(log n)',
      'logarithmic': 'O(log n)',
      
      // Linear
      'o(n)': 'O(n)',
      'linear': 'O(n)',
      
      // Log-linear
      'o(nlogn)': 'O(n log n)',
      'loglinear': 'O(n log n)',
      
      // Quadratic
      'o(n^2)': 'O(n²)',
      'o(n*n)': 'O(n²)',
      'quadratic': 'O(n²)',
      
      // Cubic
      'o(n^3)': 'O(n³)',
      'cubic': 'O(n³)',
      
      // Polynomial
      'o(n^k)': 'O(nᵏ)',
      'polynomial': 'O(nᵏ)',
      
      // Exponential
      'o(2^n)': 'O(2ⁿ)',
      'exponential': 'O(2ⁿ)',
      
      // Factorial
      'o(n!)': 'O(n!)',
      'factorial': 'O(n!)',
    };

    // Try to match the normalized input with our mapping
    const formatted = complexityMap[normalized] || complexity;

    return formatted;
  };

  const getComplexityColor = (complexity: string) => {
    const normalized = complexity.toLowerCase().replace(/\s+/g, '');
    
    // Color coding based on efficiency (from best to worst)
    if (normalized.includes('1') || normalized.includes('constant')) {
      return 'bg-green-100 text-green-800';
    }
    if (normalized.includes('logn')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (normalized === 'o(n)' || normalized === 'linear') {
      return 'bg-blue-100 text-blue-800';
    }
    if (normalized.includes('nlogn')) {
      return 'bg-indigo-100 text-indigo-800';
    }
    if (normalized.includes('n^2') || normalized.includes('n*n')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (normalized.includes('n^3')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (normalized.includes('2^n') || normalized.includes('n^')) {
      return 'bg-red-100 text-red-800';
    }
    if (normalized.includes('n!')) {
      return 'bg-purple-100 text-purple-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(complexity)}`}>
      {formatComplexity(complexity)}
    </span>
  );
};

export default ComplexityBadge; 