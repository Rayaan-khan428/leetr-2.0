'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import styles from './pricing.module.css';
import { frequencies, tiers, type PricingTier, type PricingTierFrequency } from './pricing-data';

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('w-6 h-6', className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const calculateAnnualSavings = (monthlyPrice: string) => {
  const monthly = parseFloat(monthlyPrice.replace('$', ''));
  const annual = monthly * 12;
  const annualWithDiscount = annual - (monthly * 2); // 2 months free
  return {
    originalAnnual: annual.toFixed(2),
    discountedPrice: annualWithDiscount.toFixed(2),
    savings: (monthly * 2).toFixed(2)
  };
};

export default function PricingPage() {
  const [frequency, setFrequency] = useState(frequencies[0]);

  const updatedTiers = tiers.map(tier => {
    if (typeof tier.price === 'object' && (tier.price as Record<string, string>)['1'] !== '$0') {
      const { discountedPrice } = calculateAnnualSavings(tier.price['1']);
      return {
        ...tier,
        price: {
          ...tier.price,
          '2': `$${discountedPrice}`
        }
      };
    }
    return tier;
  });

  return (
    <div className={cn('min-h-screen flex flex-col w-full items-center py-32', styles.fancyOverlay)}>
      <div className="w-full flex flex-col items-center">
        {/* Hero Section with Enhanced Typography */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-slate-500 dark:from-blue-400 dark:to-slate-300 [background-clip:text]">
            Simple, transparent pricing
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Start for free, upgrade as you grow. Cancel at any time.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="mb-16">
          <div className="bg-white/5 backdrop-blur-xl rounded-full p-1 inline-flex relative">
            {frequencies.map((option) => (
              <button
                key={option.value}
                onClick={() => setFrequency(option)}
                className={cn(
                  'px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative',
                  frequency.value === option.value
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                {option.label}
                {option.value === '2' && (
                  <span className="absolute -top-3 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                    Save 17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
          {updatedTiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-2xl overflow-hidden',
                tier.highlighted ? styles.fancyGlassContrast : 'bg-white/5 backdrop-blur-sm',
                'border border-slate-200/10 dark:border-slate-700/30',
                'transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
              )}
            >
              {tier.highlighted && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-slate-500" />
              )}
              
              <div className="p-8">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  {tier.highlighted && (
                    <span className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <p className="mt-4 text-slate-600 dark:text-slate-400">
                  {tier.description}
                </p>

                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {typeof tier.price === 'string' ? tier.price : 
                     (tier.price as Record<string, string>)[frequency.value]}
                  </span>
                  <span className="ml-1 text-slate-500 dark:text-slate-400">
                    {frequency.priceSuffix}
                  </span>
                  {frequency.value === '2' && typeof tier.price === 'object' && (tier.price as Record<string, string>)['1'] !== '$0' && (
                    <span className="ml-2 text-sm text-green-500 font-medium">
                      (2 months free)
                    </span>
                  )}
                </div>

                <Button
                  className={cn(
                    'mt-8 w-full py-6 text-base font-medium transition-all duration-200',
                    tier.highlighted
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                  )}
                >
                  {tier.cta}
                </Button>

                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center text-slate-700 dark:text-slate-300">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info Section */}
        <div className="mt-20 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Have questions? <a href="/contact" className="text-blue-500 hover:text-blue-600">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
} 