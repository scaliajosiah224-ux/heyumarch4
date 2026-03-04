import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, MessageSquare, Shield, Voicemail, Users, Lock, 
  Wifi, Sparkles, Check, Star, ChevronRight, Play,
  Menu, X, ArrowRight, Zap, Globe
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Phone, title: 'Second Number', desc: 'Get a real US/Canada number instantly', color: 'from-fuchsia-500 to-purple-600' },
    { icon: Shield, title: 'Privacy First', desc: 'Keep your personal number safe & private', color: 'from-cyan-500 to-blue-600' },
    { icon: Wifi, title: 'WiFi Calling', desc: 'Crystal clear calls over any connection', color: 'from-green-500 to-emerald-600' },
    { icon: Voicemail, title: 'Smart Voicemail', desc: 'Auto-transcription of all messages', color: 'from-amber-500 to-orange-600' },
    { icon: Users, title: 'Multi-Number', desc: 'Manage up to 10 numbers per account', color: 'from-pink-500 to-rose-600' },
    { icon: Lock, title: 'PIN Lock', desc: '4-digit PIN keeps your app secure', color: 'from-violet-500 to-purple-600' }
  ];

  const steps = [
    { num: '01', title: 'Sign Up Free', desc: 'Create your account in seconds with email or Google', icon: Sparkles },
    { num: '02', title: 'Pick Your Number', desc: 'Choose from hundreds of area codes across US & Canada', icon: Phone },
    { num: '03', title: 'Start Texting & Calling', desc: 'Your new number is ready instantly - no SIM required!', icon: MessageSquare }
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      desc: 'Perfect for getting started',
      features: ['1 Phone Number', '25 Credits/Month', 'SMS & Voice Calls', 'Basic Voicemail', 'PIN Lock Security'],
      cta: 'Start Free',
      popular: false,
      color: 'from-gray-500/20 to-gray-600/20'
    },
    {
      name: 'Unlimited',
      price: '$9.99',
      period: '/month',
      desc: 'Best for regular users',
      features: ['3 Phone Numbers', 'Unlimited Texts', 'Unlimited Calls', 'Voicemail Transcription', 'Priority Support', 'No Ads'],
      cta: 'Go Unlimited',
      popular: true,
      color: 'from-fuchsia-500/30 to-purple-600/30'
    },
    {
      name: 'Business',
      price: '$14.99',
      period: '/month',
      desc: 'For power users & teams',
      features: ['10 Phone Numbers', 'Unlimited Everything', 'Team Management', 'API Access', '24/7 Support', 'Custom Voicemail'],
      cta: 'Go Business',
      popular: false,
      color: 'from-cyan-500/20 to-blue-600/20'
    }
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Freelancer', text: 'Finally I can keep my personal and work life separate! The call quality is amazing.', avatar: 'S', rating: 5 },
    { name: 'Mike R.', role: 'Small Business', text: 'Managing 5 business lines from one app has been a game-changer for my team.', avatar: 'M', rating: 5 },
    { name: 'Jessica L.', role: 'Digital Nomad', text: 'I use this for all my online shopping and dating apps. Privacy is priceless!', avatar: 'J', rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0529] via-[#0D0415] to-[#0D0415]">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0D0415]/90 backdrop-blur-xl shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white font-heading">GummyText</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a>
              <button 
                onClick={() => navigate('/auth')}
                className="text-white/70 hover:text-white transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className="gummy-btn px-6 py-2.5 text-sm"
              >
                Get Started Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 animate-fade-in">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-white/70 hover:text-white">Features</a>
                <a href="#how-it-works" className="text-white/70 hover:text-white">How It Works</a>
                <a href="#pricing" className="text-white/70 hover:text-white">Pricing</a>
                <button onClick={() => navigate('/auth')} className="text-white/70 hover:text-white text-left">Login</button>
                <button onClick={() => navigate('/auth')} className="gummy-btn py-3 text-center">Get Started Free</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span className="text-fuchsia-300 text-sm font-medium">Join 10,000+ Happy Users</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Second Number</span> Awaits
              </h1>
              
              <p className="text-xl text-white/70 mb-8 max-w-xl mx-auto lg:mx-0">
                Get a real US or Canada phone number in seconds. Text, call, and voicemail – all over WiFi. Keep your personal number private.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/auth')}
                  className="gummy-btn px-8 py-4 text-lg flex items-center justify-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  className="gummy-btn-secondary px-8 py-4 text-lg flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  See How It Works
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['bg-fuchsia-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500'].map((bg, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full ${bg} border-2 border-[#0D0415] flex items-center justify-center text-white text-sm font-bold`}>
                      {['S', 'M', 'J', 'K'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-white/50 text-sm">4.9/5 from 2,000+ reviews</p>
                </div>
              </div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/40 to-cyan-500/40 rounded-[3rem] blur-3xl scale-90"></div>
                
                {/* Phone Frame */}
                <div className="relative w-72 md:w-80 bg-gradient-to-br from-[#2a1040] to-[#1a0825] rounded-[3rem] p-3 shadow-2xl border border-white/10">
                  <div className="bg-[#0D0415] rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-black/30">
                      <span className="text-white/70 text-xs">9:41</span>
                      <div className="w-20 h-6 bg-black rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-4 h-4 text-white/70" />
                        <div className="w-6 h-3 rounded-sm border border-white/70">
                          <div className="w-4 h-full bg-green-400 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-4 pb-8">
                      <div className="text-center mb-4">
                        <p className="text-white/50 text-sm">Your Number</p>
                        <p className="text-white font-bold text-2xl">(415) 555-0123</p>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex gap-2 mb-4">
                        {['Messages', 'Calls', 'Voicemail'].map((tab, i) => (
                          <div key={tab} className={`flex-1 py-2 rounded-xl text-center text-xs font-medium ${i === 0 ? 'bg-fuchsia-500/30 text-fuchsia-300' : 'text-white/40'}`}>
                            {tab}
                          </div>
                        ))}
                      </div>
                      
                      {/* Message Preview */}
                      <div className="space-y-3">
                        {[
                          { name: 'Mom', msg: 'Are you coming for dinner?', time: '2m', unread: true },
                          { name: 'Work', msg: 'Meeting moved to 3pm', time: '15m', unread: false },
                          { name: 'Amazon', msg: 'Your package was delivered!', time: '1h', unread: false }
                        ].map((chat, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-pink-500' : i === 1 ? 'bg-blue-500' : 'bg-amber-500'}`}>
                              {chat.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">{chat.name}</p>
                              <p className="text-white/50 text-xs truncate">{chat.msg}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/40 text-xs">{chat.time}</p>
                              {chat.unread && <div className="w-2 h-2 bg-fuchsia-500 rounded-full ml-auto mt-1"></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-float animation-delay-1000">
                  <Phone className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">Packed with Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              A complete second phone experience with all the features you'd expect and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="group glass-panel p-6 hover:border-fuchsia-500/30 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Simple Setup</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready in 3 Steps
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Getting your second number takes less than a minute. No complicated setup required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector Line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-fuchsia-500/50 to-transparent"></div>
                )}
                
                <div className="glass-panel p-8 text-center relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 rounded-3xl flex items-center justify-center border border-fuchsia-500/30">
                    <span className="text-3xl font-black text-fuchsia-400">{step.num}</span>
                  </div>
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/auth')}
              className="gummy-btn px-10 py-4 text-lg"
            >
              Get Your Number Now
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Start free forever or upgrade for unlimited power. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div 
                key={i}
                className={`glass-panel p-8 relative ${plan.popular ? 'border-fuchsia-500/50 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full text-white text-sm font-bold">
                    Most Popular
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 border border-white/10`}>
                  {i === 0 ? <Sparkles className="w-8 h-8 text-white/70" /> : i === 1 ? <Zap className="w-8 h-8 text-fuchsia-300" /> : <Users className="w-8 h-8 text-cyan-300" />}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/50 mb-4">{plan.desc}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/50">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-white/70">
                      <Check className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/auth')}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular ? 'gummy-btn' : 'gummy-btn-secondary'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Loved by Thousands
            </h2>
            <p className="text-white/60 text-lg">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="glass-panel p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(j => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-white/80 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-pink-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-white/50 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-12 text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 to-purple-600/20"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users who trust GummyText for their second phone number. Start free today!
              </p>
              <button 
                onClick={() => navigate('/auth')}
                className="gummy-btn px-10 py-4 text-lg inline-flex items-center gap-2"
              >
                Get Your Free Number
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-white">GummyText</span>
              </div>
              <p className="text-white/50">Your second phone number, simplified.</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-white/50 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-white/50 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Download App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">© 2026 GummyText. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm">Powered by Twilio</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 15s ease-in-out infinite;
        }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default LandingPage;
