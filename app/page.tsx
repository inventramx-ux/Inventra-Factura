import Link from 'next/link';
import { ArrowRight, Check, Brain } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const features = [
  {
    title: 'Multi-Platform Intelligence',
    description: 'Analyze trending products across Amazon, AliExpress, and Google in one unified dashboard.',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Our AI identifies winning products before they go viral, giving you the competitive edge.',
  },
  {
    title: 'Real-Time Trends',
    description: 'Track search volume, sales data, and trend scores updated in real-time.',
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep dive into product performance with comprehensive charts and metrics.',
  },
  {
    title: 'Verified Data',
    description: 'All product data is verified and sourced directly from official platform APIs.',
  },
  {
    title: 'Smart Recommendations',
    description: 'Get personalized product suggestions based on your niche and preferences.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Access to product screener',
      'Up to 50 product searches/day',
      'Basic trend analytics',
      'Amazon & AliExpress data',
      'Email support',
    ],
    cta: 'Start building',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing sellers',
    features: [
      'Unlimited product searches',
      'Advanced AI insights',
      'All platforms including Google',
      'Export data to CSV',
      'Priority support',
      'Custom alerts',
    ],
    cta: 'Coming Soon',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'API access',
      'Team collaboration',
      'White-label reports',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Coming Soon',
    highlighted: false,
  },
];

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <p className="bg-white/10 px-4 py-2 rounded-full w-fit flex items-center gap-2 border border-white/10 text-sm text-gray-300 mb-8">
              <Brain size={14} />
              Powered by AI
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight">
              Find your next bestselling
              <br />
              product with Inventra
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl mb-10">
              Meet the system for modern product research.
              <br />
              Streamline discovery, analysis, and sourcing decisions.
            </p>

            <div className="flex items-center gap-6">
              <Link href="/sign-up" className="btn-primary inline-flex items-center gap-2">
                Start building
              </Link>
              <Link href="#features" className="btn-secondary inline-flex items-center gap-1">
               Learn more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-medium text-white mb-4">
              Everything you need to win at e-commerce
            </h2>
            <p className="text-gray-400">
              Powerful tools and insights to help you make data-driven inventory decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-medium text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-400">
              Start for free and upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border ${plan.highlighted ? 'border-white/30 bg-white/5' : 'border-white/10'}`}
              >
                <div className="mb-6">
                  <h3 className="text-white font-medium mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-medium text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                      <Check size={14} className="text-white flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.highlighted ? '/sign-up' : '#'}
                  className={`block text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${plan.highlighted
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-medium text-white mb-4">
            Ready to find your next best-seller?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of sellers who use InventrAI to discover winning products.
          </p>
          <Link href="/sign-up" className="btn-primary inline-flex items-center gap-2">
            Get started free
          </Link>
          <p className="text-xs text-gray-600 mt-4">No credit card required</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}