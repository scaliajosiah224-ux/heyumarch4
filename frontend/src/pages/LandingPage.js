import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, MessageSquare, Shield, Voicemail, Users, Lock, 
  Wifi, Sparkles, Check, Star, ChevronRight, Play,
  Menu, X, ArrowRight, Zap, Globe, Heart, Gift,
  Rocket, Crown, PartyPopper, Music, Smile, Coffee
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Phone, title: 'Second Number', desc: 'Get a real US/Canada number instantly', color: 'from-fuchsia-500 to-pink-500', emoji: '📱' },
    { icon: Shield, title: 'Privacy First', desc: 'Keep your personal number safe & private', color: 'from-cyan-400 to-blue-500', emoji: '🛡️' },
    { icon: Wifi, title: 'WiFi Calling', desc: 'Crystal clear calls over any connection', color: 'from-green-400 to-emerald-500', emoji: '📶' },
    { icon: Voicemail, title: 'Smart Voicemail', desc: 'Auto-transcription of all messages', color: 'from-amber-400 to-orange-500', emoji: '🎙️' },
    { icon: Users, title: 'Multi-Number', desc: 'Manage up to 10 numbers per account', color: 'from-purple-400 to-violet-500', emoji: '👥' },
    { icon: Lock, title: 'PIN Lock', desc: '4-digit PIN keeps your app secure', color: 'from-rose-400 to-red-500', emoji: '🔐' }
  ];

  const steps = [
    { num: '1', title: 'Sign Up Free', desc: 'Create your account in seconds with email or Google', icon: Sparkles, color: 'from-fuchsia-500 to-purple-600' },
    { num: '2', title: 'Pick Your Number', desc: 'Choose from hundreds of area codes across US & Canada', icon: Phone, color: 'from-cyan-500 to-blue-600' },
    { num: '3', title: 'Start Texting!', desc: 'Your new number is ready instantly - no SIM required!', icon: MessageSquare, color: 'from-green-500 to-emerald-600' }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: '/forever',
      desc: 'Perfect for trying it out',
      features: ['1 Phone Number', '25 Free Credits', 'SMS & Voice Calls', 'Basic Voicemail'],
      cta: 'Start Free',
      popular: false,
      gradient: 'from-slate-600/20 to-slate-700/20',
      iconBg: 'from-slate-400 to-slate-500'
    },
    {
      name: 'Personal',
      price: '$4.99',
      period: '/month',
      desc: 'Best value for individuals',
      features: ['1 Phone Number', 'Unlimited Texts', 'Unlimited Calls', 'Voicemail Transcription', 'No Ads', 'Priority Support'],
      cta: 'Get Personal',
      popular: true,
      gradient: 'from-fuchsia-600/30 to-purple-600/30',
      iconBg: 'from-fuchsia-500 to-purple-600'
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      desc: 'For power users',
      features: ['5 Phone Numbers', 'Unlimited Everything', 'Team Features', 'API Access', '24/7 Support', 'Custom Voicemail'],
      cta: 'Go Pro',
      popular: false,
      gradient: 'from-cyan-600/20 to-blue-600/20',
      iconBg: 'from-cyan-500 to-blue-600'
    }
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Freelancer', text: 'Finally I can keep my personal and work life separate! The call quality is amazing.', avatar: '👩‍💼', rating: 5, color: 'from-pink-500 to-rose-500' },
    { name: 'Mike R.', role: 'Small Business', text: 'Managing multiple business lines from one app has been a game-changer for my team.', avatar: '👨‍💻', rating: 5, color: 'from-blue-500 to-indigo-500' },
    { name: 'Jessica L.', role: 'Digital Nomad', text: 'I use this for all my online shopping and dating apps. Privacy is priceless!', avatar: '🌍', rating: 5, color: 'from-purple-500 to-violet-500' }
  ];

  const stats = [
    { value: '10K+', label: 'Happy Users', icon: Heart },
    { value: '50M+', label: 'Messages Sent', icon: MessageSquare },
    { value: '4.9', label: 'App Rating', icon: Star },
    { value: '24/7', label: 'Support', icon: Coffee }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0529] via-[#120320] to-[#0D0415] overflow-hidden">
      {/* Animated Background - Bubbly Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large animated blobs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-600/30 to-pink-600/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-purple-600/25 to-violet-600/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 -left-20 w-[350px] h-[350px] bg-gradient-to-br from-cyan-600/20 to-blue-600/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute -bottom-40 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-pink-600/20 to-rose-600/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '6s' }}></div>
        
        {/* Floating bubbles */}
        <div className="absolute top-20 left-[10%] w-4 h-4 bg-fuchsia-400/40 rounded-full animate-float"></div>
        <div className="absolute top-40 right-[20%] w-6 h-6 bg-cyan-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-[30%] w-3 h-3 bg-purple-400/50 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-[15%] w-5 h-5 bg-pink-400/40 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-60 left-[25%] w-4 h-4 bg-amber-400/30 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0D0415]/95 backdrop-blur-2xl shadow-2xl shadow-fuchsia-500/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Bubbly Style */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/40 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-bounce-subtle"></div>
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">Gummy<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Text</span></span>
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full transition-all duration-300"></div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'Pricing'].map((item, i) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="relative text-white/70 hover:text-white transition-colors font-medium group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
                </a>
              ))}
              <button 
                onClick={() => navigate('/auth')}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full text-white font-bold shadow-lg shadow-fuchsia-500/30 group-hover:shadow-fuchsia-500/50 transition-all group-hover:scale-105">
                  Get Started Free ✨
                </div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-6 border-t border-white/10 pt-6 animate-slide-up">
              <div className="flex flex-col gap-4">
                {['Features', 'How It Works', 'Pricing'].map(item => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-white/70 hover:text-white font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <button onClick={() => navigate('/auth')} className="text-white/70 hover:text-white text-left py-2 font-medium">Login</button>
                <button onClick={() => navigate('/auth')} className="gummy-btn py-3 text-center mt-2">
                  Get Started Free ✨
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Super Bubbly */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left relative z-10">
              {/* Floating Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 mb-8 animate-bounce-subtle">
                <PartyPopper className="w-5 h-5 text-fuchsia-400" />
                <span className="text-fuchsia-300 font-semibold">Join 10,000+ Happy Users! 🎉</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-8">
                Your{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 animate-gradient bg-[length:200%_200%]">
                    Second Number
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 150 2 198 8" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop stopColor="#D946EF"/>
                        <stop offset="0.5" stopColor="#EC4899"/>
                        <stop offset="1" stopColor="#06B6D4"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <br />
                <span className="text-white">Awaits</span>{' '}
                <span className="inline-block animate-wiggle">🎊</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Get a <span className="text-fuchsia-400 font-semibold">real US or Canada</span> phone number in seconds. 
                Text, call, and voicemail – all over WiFi. 
                <span className="text-cyan-400 font-semibold"> Keep your privacy!</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <button 
                  onClick={() => navigate('/auth')}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:blur-2xl"></div>
                  <div className="relative px-8 py-4 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 rounded-2xl text-white text-lg font-bold shadow-2xl shadow-fuchsia-500/30 group-hover:shadow-fuchsia-500/50 transition-all group-hover:scale-105 flex items-center gap-3 border-t border-white/20">
                    <Rocket className="w-5 h-5" />
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                <button 
                  onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl text-white text-lg font-semibold transition-all flex items-center justify-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-fuchsia-500/30 transition-colors">
                    <Play className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  See How It Works
                </button>
              </div>

              {/* Trust Badges - Bubbly Style */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {['🧑‍💼', '👩‍🎨', '👨‍💻', '👩‍🔬', '🧑‍🚀'].map((emoji, i) => (
                    <div 
                      key={i} 
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 border-2 border-[#0D0415] flex items-center justify-center text-xl shadow-lg hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    ))}
                    <span className="ml-2 text-amber-400 font-bold">4.9</span>
                  </div>
                  <p className="text-white/50 text-sm font-medium">from 2,000+ happy reviews</p>
                </div>
              </div>
            </div>

            {/* Right: Phone Mockup - Super Fancy */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/50 via-purple-500/30 to-cyan-500/50 rounded-[4rem] blur-3xl scale-90 animate-glow-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 to-blue-500/30 rounded-[4rem] blur-2xl scale-95 animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Phone Frame - Glossy */}
                <div className="relative w-72 md:w-80 bg-gradient-to-br from-[#3d1a5a] via-[#2a1040] to-[#1a0825] rounded-[3rem] p-3 shadow-2xl border border-white/10">
                  {/* Phone Inner Glow */}
                  <div className="absolute inset-3 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] pointer-events-none"></div>
                  
                  <div className="bg-gradient-to-b from-[#150820] to-[#0D0415] rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-black/40">
                      <span className="text-white/70 text-xs font-medium">9:41</span>
                      <div className="w-24 h-7 bg-black rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-[#1a1a1a] rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-4 h-4 text-white/70" />
                        <div className="w-7 h-3 rounded-sm border border-white/70 relative">
                          <div className="absolute inset-0.5 right-1 bg-green-400 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-5 pb-10">
                      {/* Phone Number Display */}
                      <div className="text-center mb-5 p-4 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 rounded-2xl border border-fuchsia-500/20">
                        <p className="text-fuchsia-300/70 text-sm font-medium mb-1">Your Number</p>
                        <p className="text-white font-black text-2xl tracking-wide">(415) 555-0123</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">Active</span>
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-medium">Unlimited</span>
                        </div>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex gap-2 mb-5 p-1.5 bg-black/30 rounded-2xl">
                        {['Messages', 'Calls', 'Voicemail'].map((tab, i) => (
                          <div 
                            key={tab} 
                            className={`flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                              i === 0 
                                ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30' 
                                : 'text-white/40 hover:text-white/60'
                            }`}
                          >
                            {tab}
                          </div>
                        ))}
                      </div>
                      
                      {/* Message Preview */}
                      <div className="space-y-3">
                        {[
                          { name: 'Mom', msg: 'Are you coming for dinner?', time: '2m', unread: true, emoji: '❤️', color: 'from-pink-500 to-rose-500' },
                          { name: 'Work', msg: 'Meeting moved to 3pm', time: '15m', unread: false, emoji: '💼', color: 'from-blue-500 to-indigo-500' },
                          { name: 'Amazon', msg: 'Your package was delivered!', time: '1h', unread: false, emoji: '📦', color: 'from-amber-500 to-orange-500' }
                        ].map((chat, i) => (
                          <div 
                            key={i} 
                            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-fuchsia-500/20 cursor-pointer group"
                          >
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${chat.color} flex items-center justify-center text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                              {chat.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm truncate">{chat.name}</p>
                              <p className="text-white/50 text-xs truncate">{chat.msg}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/40 text-xs font-medium">{chat.time}</p>
                              {chat.unread && (
                                <div className="w-5 h-5 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-full ml-auto mt-1 flex items-center justify-center shadow-lg shadow-fuchsia-500/50">
                                  <span className="text-white text-[10px] font-bold">1</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements - Bouncy */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-fuchsia-500/50 animate-float border-2 border-white/20">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-float border-2 border-white/20" style={{ animationDelay: '1s' }}>
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-1/2 -right-12 w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/40 animate-float border-2 border-white/20" style={{ animationDelay: '2s' }}>
                  <Check className="w-7 h-7 text-white" />
                </div>
                <div className="absolute top-1/4 -left-10 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/40 animate-float border-2 border-white/20" style={{ animationDelay: '1.5s' }}>
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Bubbly Cards */}
      <section className="py-12 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div 
                key={i}
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-fuchsia-500/30 transition-all text-center hover:scale-105 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-fuchsia-400 group-hover:scale-110 transition-transform" />
                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-white/50 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Bubbly Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">Packed with Features 🚀</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Everything You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Need</span>
            </h2>
            <p className="text-white/60 text-xl max-w-2xl mx-auto">
              A complete second phone experience with all the features you'd expect and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className={`group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-fuchsia-500/40 transition-all duration-500 cursor-pointer overflow-hidden ${activeFeature === i ? 'scale-105 border-fuchsia-500/50' : ''}`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 border-2 border-white/20`}>
                  <feature.icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce-subtle">{feature.emoji}</div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Fun Steps */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 mb-6">
              <Globe className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-semibold">Super Easy Setup ⚡</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">3 Steps</span>
            </h2>
            <p className="text-white/60 text-xl max-w-2xl mx-auto">
              Getting your second number takes less than a minute. No complicated setup required!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {/* Connector Line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-1 bg-gradient-to-r from-fuchsia-500/50 via-purple-500/30 to-transparent rounded-full"></div>
                )}
                
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-fuchsia-500/40 transition-all duration-300 text-center group-hover:scale-105">
                  {/* Step Number - Bubbly */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity`}></div>
                    <div className={`relative w-full h-full bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/20`}>
                      <span className="text-5xl font-black text-white">{step.num}</span>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg border border-white/20`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button 
              onClick={() => navigate('/auth')}
              className="group relative inline-flex"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all"></div>
              <div className="relative px-10 py-5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 rounded-2xl text-white text-xl font-bold shadow-2xl shadow-fuchsia-500/30 group-hover:shadow-fuchsia-500/50 transition-all group-hover:scale-105 flex items-center gap-3 border-t border-white/20">
                <Gift className="w-6 h-6" />
                Get Your Number Now
                <Sparkles className="w-6 h-6" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section - Clean & Bubbly */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-6">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-semibold">Simple Pricing 💰</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Choose Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Plan</span>
            </h2>
            <p className="text-white/60 text-xl max-w-2xl mx-auto">
              Start free forever or upgrade for unlimited power. No hidden fees, cancel anytime!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div 
                key={i}
                className={`relative group rounded-3xl transition-all duration-500 ${plan.popular ? 'scale-105 z-10' : 'hover:scale-105'}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full text-white font-bold shadow-xl shadow-fuchsia-500/40 text-sm flex items-center gap-2 z-20">
                    <Star className="w-4 h-4 fill-white" />
                    Most Popular
                  </div>
                )}
                
                <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${plan.gradient} border ${plan.popular ? 'border-fuchsia-500/50' : 'border-white/10'} hover:border-fuchsia-500/40 transition-all overflow-hidden h-full`}>
                  {/* Background Glow for Popular */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5"></div>
                  )}
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.iconBg} flex items-center justify-center mb-6 shadow-xl border-2 border-white/20`}>
                      {i === 0 ? <Sparkles className="w-8 h-8 text-white" /> : i === 1 ? <Heart className="w-8 h-8 text-white" /> : <Rocket className="w-8 h-8 text-white" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/50 mb-6">{plan.desc}</p>
                    
                    <div className="mb-8">
                      <span className="text-5xl font-black text-white">{plan.price}</span>
                      <span className="text-white/50 text-lg font-medium">{plan.period}</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-3 text-white/80">
                          <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-fuchsia-400" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => navigate('/auth')}
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-105 border-t border-white/20' 
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Bubbly Cards */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 mb-6">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-pink-300 font-semibold">Customer Love 💕</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Loved by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">Thousands</span>
            </h2>
            <p className="text-white/60 text-xl">See what our amazing users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-fuchsia-500/40 transition-all duration-300 hover:scale-105"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[1,2,3,4,5].map(j => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                  ))}
                </div>
                
                <p className="text-white/80 mb-8 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-2xl shadow-lg border-2 border-white/20`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold">{testimonial.name}</p>
                    <p className="text-white/50">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Super Bubbly */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-purple-600/20 to-pink-600/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0415]/80 to-transparent"></div>
            
            {/* Floating bubbles */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-fuchsia-500/20 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
            
            <div className="relative z-10 p-12 md:p-16 text-center">
              <div className="inline-block mb-8 animate-bounce-subtle">
                <div className="text-6xl">🎉</div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-white/70 text-xl mb-10 max-w-xl mx-auto">
                Join thousands of users who trust GummyText for their second phone number. 
                <span className="text-fuchsia-400 font-semibold"> Start free today!</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/auth')}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all"></div>
                  <div className="relative px-10 py-5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 rounded-2xl text-white text-xl font-bold shadow-2xl shadow-fuchsia-500/30 group-hover:shadow-fuchsia-500/50 transition-all group-hover:scale-105 flex items-center gap-3 border-t border-white/20">
                    <Rocket className="w-6 h-6" />
                    Get Your Free Number
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
              
              <p className="text-white/40 text-sm mt-8">No credit card required • Setup in 60 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">GummyText</span>
              </div>
              <p className="text-white/50 leading-relaxed">Your second phone number, simplified. Privacy made easy.</p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Download App', 'Updates'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Contact', 'Support'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-bold mb-6">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-white/50 hover:text-fuchsia-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40">© 2026 GummyText. All rights reserved. Made with ❤️</p>
            <div className="flex items-center gap-6">
              <span className="text-white/40 text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Powered by Twilio
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
