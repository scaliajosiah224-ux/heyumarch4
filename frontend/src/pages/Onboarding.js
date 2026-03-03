import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, Shield, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    icon: Phone,
    title: "Get a Second Number",
    subtitle: "Instantly",
    description: "Choose from hundreds of area codes and get your private number in seconds.",
    image: "https://images.unsplash.com/photo-1726413980688-a73bdf1c9944?w=400&q=80"
  },
  {
    id: 2,
    icon: MessageSquare,
    title: "Text & Call",
    subtitle: "Over WiFi",
    description: "Send unlimited texts and make crystal-clear calls using your data or WiFi connection.",
    image: "https://images.unsplash.com/photo-1758739660330-03c0304fa119?w=400&q=80"
  },
  {
    id: 3,
    icon: Shield,
    title: "Stay Private",
    subtitle: "Always",
    description: "Keep your personal number safe. Perfect for online dating, business, or Craigslist.",
    image: "https://images.unsplash.com/photo-1689479276174-d1f4d3354fdc?w=400&q=80"
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/auth');
    }
  };

  const handleSkip = () => {
    navigate('/auth');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div 
      data-testid="onboarding-screen" 
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-fuchsia-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Skip Button */}
      <button
        data-testid="skip-btn"
        onClick={handleSkip}
        className="absolute top-6 right-6 text-white/60 hover:text-white text-sm font-medium z-10 transition-colors"
      >
        Skip
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Animated Image Container */}
        <div 
          key={slide.id}
          className="relative mb-8 animate-slide-up"
        >
          <div className="w-64 h-64 md:w-80 md:h-80 relative">
            {/* Glowing Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 rounded-3xl blur-2xl"></div>
            
            {/* Image Container */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden glass-panel flex items-center justify-center">
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-3/4 h-3/4 object-cover rounded-2xl animate-float"
              />
              
              {/* Icon Badge */}
              <div className="absolute bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div 
          key={`text-${slide.id}`}
          className="text-center max-w-md animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
            {slide.title}
          </h1>
          <p className="text-xl md:text-2xl font-bold text-fuchsia-400 mb-4">
            {slide.subtitle}
          </p>
          <p className="text-white/70 text-lg leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              data-testid={`slide-dot-${index}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-fuchsia-500' 
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8 relative z-10">
        <button
          data-testid="next-btn"
          onClick={handleNext}
          className="w-full gummy-btn py-4 text-lg flex items-center justify-center gap-2"
        >
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
