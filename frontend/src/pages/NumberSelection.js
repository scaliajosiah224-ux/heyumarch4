import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Phone, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

const popularAreaCodes = [
  { code: '212', city: 'New York, NY' },
  { code: '310', city: 'Los Angeles, CA' },
  { code: '312', city: 'Chicago, IL' },
  { code: '415', city: 'San Francisco, CA' },
  { code: '305', city: 'Miami, FL' },
  { code: '702', city: 'Las Vegas, NV' },
  { code: '206', city: 'Seattle, WA' },
  { code: '512', city: 'Austin, TX' }
];

const NumberSelection = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: area code, 2: number selection
  const [areaCode, setAreaCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const searchNumbers = async (code) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/phone-numbers/available`, {
        params: { area_code: code },
        withCredentials: true
      });
      setAvailableNumbers(response.data.numbers);
      setStep(2);
    } catch (error) {
      toast.error('Failed to search numbers');
    } finally {
      setLoading(false);
    }
  };

  const purchaseNumber = async () => {
    if (!selectedNumber) return;
    
    setPurchasing(true);
    try {
      await axios.post(`${API}/phone-numbers/purchase`, {
        area_code: areaCode
      }, {
        withCredentials: true
      });
      
      toast.success('Phone number activated!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to purchase number');
    } finally {
      setPurchasing(false);
    }
  };

  const handleAreaCodeSelect = (code) => {
    setAreaCode(code);
    searchNumbers(code);
  };

  const handleCustomSearch = () => {
    if (searchQuery.length === 3 && /^\d+$/.test(searchQuery)) {
      setAreaCode(searchQuery);
      searchNumbers(searchQuery);
    } else {
      toast.error('Please enter a valid 3-digit area code');
    }
  };

  const filteredCodes = popularAreaCodes.filter(
    ac => ac.code.includes(searchQuery) || ac.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div data-testid="number-selection" className="min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-fuchsia-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-light px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => step === 1 ? navigate(-1) : setStep(1)}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {step === 1 ? 'Choose Area Code' : 'Select Your Number'}
            </h1>
            <p className="text-white/60 text-sm">
              {step === 1 ? 'Pick your preferred location' : `Area code: ${areaCode}`}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 relative z-10">
        {step === 1 ? (
          <>
            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                data-testid="area-code-search"
                type="text"
                placeholder="Search area code or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
                className="w-full gummy-input pl-12 pr-24"
              />
              <button
                data-testid="search-btn"
                onClick={handleCustomSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 gummy-btn px-4 py-2 text-sm"
              >
                Search
              </button>
            </div>

            {/* Popular Area Codes */}
            <h2 className="text-white/70 text-sm font-semibold mb-3 uppercase tracking-wider">
              Popular Locations
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(searchQuery ? filteredCodes : popularAreaCodes).map((ac) => (
                <button
                  key={ac.code}
                  data-testid={`area-code-${ac.code}`}
                  onClick={() => handleAreaCodeSelect(ac.code)}
                  className="glass-panel p-4 text-left hover:border-fuchsia-500/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg group-hover:text-fuchsia-400 transition-colors">
                        {ac.code}
                      </p>
                      <p className="text-white/60 text-sm">{ac.city}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mb-4" />
                <p className="text-white/70">Finding available numbers...</p>
              </div>
            ) : (
              <>
                <p className="text-white/70 text-sm mb-4">
                  {availableNumbers.length} numbers available
                </p>
                
                <div className="space-y-3 mb-24">
                  {availableNumbers.map((number) => (
                    <button
                      key={number.phone_number}
                      data-testid={`number-${number.phone_number}`}
                      onClick={() => setSelectedNumber(number)}
                      className={`w-full glass-panel p-4 text-left transition-all ${
                        selectedNumber?.phone_number === number.phone_number
                          ? 'border-fuchsia-500 bg-fuchsia-500/10'
                          : 'hover:border-fuchsia-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-fuchsia-400" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-lg">
                              {number.friendly_name}
                            </p>
                            <p className="text-white/50 text-sm">
                              SMS • Voice • MMS
                            </p>
                          </div>
                        </div>
                        {selectedNumber?.phone_number === number.phone_number && (
                          <div className="w-8 h-8 rounded-full bg-fuchsia-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Purchase Button */}
                {selectedNumber && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 glass-panel-light">
                    <button
                      data-testid="purchase-btn"
                      onClick={purchaseNumber}
                      disabled={purchasing}
                      className="w-full gummy-btn py-4 text-lg disabled:opacity-50"
                    >
                      {purchasing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Activating...
                        </span>
                      ) : (
                        'Activate This Number'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default NumberSelection;
