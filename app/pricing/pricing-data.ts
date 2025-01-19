export interface PricingTierFrequency {
  id: string;
  value: string;
  label: string;
  priceSuffix: string;
}

export interface PricingTier {
  name: string;
  id: string;
  href: string;
  discountPrice: string | Record<string, string>;
  price: string | Record<string, string>;
  description: string | React.ReactNode;
  features: string[];
  featured?: boolean;
  highlighted?: boolean;
  cta: string;
  soldOut?: boolean;
}

export const frequencies: PricingTierFrequency[] = [
  { id: '1', value: '1', label: 'Monthly', priceSuffix: '/month' },
  { id: '2', value: '2', label: 'Annually', priceSuffix: '/year' },
];

export const tiers: PricingTier[] = [
  {
    name: 'Free',
    id: '0',
    href: '/subscribe',
    price: { '1': '$0', '2': '$0' },
    discountPrice: { '1': '', '2': '' },
    description: `Our free tier plan for students or anyone on a budget.`,
    features: [
      `Leetcode Stats Tracking`,
      `Chrome Extension`,
      `SMS Notifications to keep you on track`,
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: `Sign up`,
  },
  {
    name: 'Starter',
    id: '1',
    href: '/subscribe',
    price: { '1': '$4.99', '2': '$49.99' },
    discountPrice: { '1': '', '2': '' },
    description: `Use Leetr to practice Leetcode and compete with friends.`,
    features: [
      `Leetcode Stats Tracking`,
      `Chrome Extension`,
      `Compete with friends`,
      `SMS notifications to keep you on track`,
      `Access to our Interview prep blogs`,
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: `Get started`,
  },
  {
    name: 'Pro',
    id: '2',
    href: '/contact-us',
    price: { '1': '$7.99', '2': '$79.99' },
    discountPrice: { '1': '', '2': '' },
    description: `Use Leetr to compete with friends and ace your next interview.`,
    features: [
      `Leetcode Stats Tracking`,
      `Chrome Extension`,
      `Compete with friends`,
      `Access to different SMS styles to keep things fun`,
      `SMS notifications to keep you on track`,
      `Access to our Interview prep blogs`,
    ],
    featured: false,
    highlighted: true,
    soldOut: false,
    cta: `Get started`,
  },
]; 