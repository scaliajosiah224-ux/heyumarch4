import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Zap, Crown, Check, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth, API } from '../App';

const Purchase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('credits');
  const [packages, setPackages] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [packagesRes, plansRes] = await Promise.all([
        axios.get(`${API}/payments/packages`, { withCredentials: true }),
        axios.get(`${API}/payments/subscriptions`, { withCredentials: true })
      ]);
      setPackages(packagesRes.data.packages);
      setPlans(plansRes.data.plans);
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    setPurchasing(packageId);
    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        package_id: packageId,
        origin_url: window.location.origin
      }, {
        withCredentials: true
      });

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to initiate checkout');
      setPurchasing(null);
    }
  };

  const getPackageIcon = (index) => {
    const icons = [Coins, Zap, Sparkles, Crown];
    return icons[index % icons.length];
  };

  return (
    <div data-testid="purchase-screen" className="min-h-screen pb-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-fuchsia-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-light px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Get Credits</h1>
            <p className="text-white/60 text-sm">Current balance: {user?.credits} credits</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4">
          <button
            data-testid="tab-credits"
            onClick={() => setActiveTab('credits')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'credits'
                ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-400 border border-amber-500/30'
                : 'text-white/50'
            }`}
          >
            Credit Packs
          </button>
          <button
            data-testid="tab-subscriptions"
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 text-fuchsia-400 border border-fuchsia-500/30'
                : 'text-white/50'
            }`}
          >
            Subscriptions
          </button>
        </div>
      </header>

      <main className="p-4 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'credits' ? (
          <>
            <p className="text-white/60 text-sm mb-4">
              1 credit = 1 SMS or 1 call minute • 4 credits = 1 MMS
            </p>
            <div className="grid gap-4">
              {packages.map((pkg, index) => {
                const Icon = getPackageIcon(index);
                return (
                  <button
                    key={pkg.package_id}
                    data-testid={`package-${pkg.package_id}`}
                    onClick={() => handlePurchase(pkg.package_id)}
                    disabled={purchasing === pkg.package_id}
                    className={`glass-panel p-5 text-left transition-all hover:border-amber-500/50 ${
                      pkg.popular ? 'border-amber-500/30 relative overflow-hidden' : ''
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        POPULAR
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          pkg.popular 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 animate-pulse-glow'
                            : 'bg-gradient-to-br from-amber-500/30 to-orange-500/30'
                        }`}>
                          <Icon className={`w-7 h-7 ${pkg.popular ? 'text-white' : 'text-amber-400'}`} />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{pkg.name}</p>
                          <p className="text-amber-400 font-semibold">{pkg.credits} credits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black text-2xl">${pkg.price}</p>
                        <p className="text-white/40 text-sm">
                          ${(pkg.price / pkg.credits).toFixed(3)}/credit
                        </p>
                      </div>
                    </div>
                    {purchasing === pkg.package_id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
                        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-white/60 text-sm mb-4">
              Upgrade for more features and credits each month
            </p>
            <div className="grid gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.plan_id}
                  data-testid={`plan-${plan.plan_id}`}
                  className={`glass-panel p-5 transition-all ${
                    plan.plan_id === 'unlimited' 
                      ? 'border-fuchsia-500/30 relative overflow-hidden' 
                      : ''
                  }`}
                >
                  {plan.plan_id === 'unlimited' && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-fuchsia-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      BEST VALUE
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-bold text-xl">{plan.name}</p>
                      <p className="text-white/50 text-sm">
                        {plan.credits_per_month === -1 
                          ? 'Unlimited usage' 
                          : `${plan.credits_per_month} credits/month`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-2xl">
                        ${plan.price}
                        <span className="text-white/40 text-sm font-normal">/mo</span>
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                        <Check className="w-4 h-4 text-fuchsia-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    data-testid={`subscribe-${plan.plan_id}`}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.plan_id === 'free'
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : plan.plan_id === 'unlimited'
                        ? 'gummy-btn'
                        : 'gummy-btn-secondary'
                    }`}
                    disabled={plan.plan_id === 'free'}
                  >
                    {plan.plan_id === 'free' 
                      ? 'Current Plan' 
                      : plan.plan_id === user?.subscription_type
                      ? 'Current Plan'
                      : 'Coming Soon'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Purchase;
