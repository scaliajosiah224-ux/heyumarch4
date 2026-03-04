import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Phone, Check, Loader2, Wifi, MessageSquare, Image, AlertCircle, Sparkles, Info, Star, Crown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

const popularAreaCodes = [
  { code: '602', city: 'Phoenix, AZ', state: 'AZ' },
  { code: '385', city: 'Salt Lake City, UT', state: 'UT' },
  { code: '480', city: 'Mesa, AZ', state: 'AZ' },
  { code: '623', city: 'Glendale, AZ', state: 'AZ' },
  { code: '520', city: 'Tucson, AZ', state: 'AZ' },
  { code: '928', city: 'Flagstaff, AZ', state: 'AZ' },
  { code: '801', city: 'Salt Lake City, UT', state: 'UT' },
  { code: '435', city: 'St. George, UT', state: 'UT' },
  { code: '469', city: 'Dallas, TX', state: 'TX' },
  { code: '972', city: 'Dallas, TX', state: 'TX' }
];

const NumberSelection = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: area code, 2: number selection, 3: confirm
  const [areaCode, setAreaCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [nearbyNumbers, setNearbyNumbers] = useState([]);
  const [ownedNumbers, setOwnedNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [twilioEnabled, setTwilioEnabled] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOwnedNumbers();
    fetchNearbyNumbers();
  }, []);

  const fetchOwnedNumbers = async () => {
    try {
      const response = await axios.get(`${API}/phone-numbers/twilio-account`, {
        withCredentials: true
      });
      setOwnedNumbers(response.data.numbers || []);
    } catch (error) {
      console.error('Error fetching owned numbers:', error);
    }
  };

  const fetchNearbyNumbers = async () => {
    try {
      const response = await axios.get(`${API}/phone-numbers/nearby`, {
        withCredentials: true
      });
      setNearbyNumbers(response.data.numbers || []);
      setTwilioEnabled(response.data.twilio_enabled);
    } catch (error) {
      console.error('Error fetching nearby numbers:', error);
    }
  };

  const searchNumbers = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/phone-numbers/available`, {
        params: { area_code: code, limit: 20 },
        withCredentials: true
      });
      setAvailableNumbers(response.data.numbers || []);
      setTwilioEnabled(response.data.twilio_enabled);
      if (response.data.error) {
        setError(response.data.error);
      }
      setStep(2);
    } catch (error) {
      toast.error('Failed to search numbers');
      setError(error.response?.data?.detail || 'Failed to search numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/phone-numbers/search`, {
        params: { query: searchQuery, limit: 20 },
        withCredentials: true
      });
      setAvailableNumbers(response.data.numbers || []);
      setTwilioEnabled(response.data.twilio_enabled);
      if (response.data.numbers?.length > 0) {
        setAreaCode(searchQuery);
        setStep(2);
      } else {
        toast.error('No numbers found for this search');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const purchaseNumber = async () => {
    if (!selectedNumber) return;
    
    setPurchasing(true);
    try {
      // If it's an owned number, use add-existing endpoint
      if (selectedNumber.is_owned) {
        await axios.post(`${API}/phone-numbers/add-existing`, {
          phone_number: selectedNumber.phone_number,
          twilio_sid: selectedNumber.twilio_sid
        }, {
          withCredentials: true
        });
      } else {
        // Try to purchase new number
        await axios.post(`${API}/phone-numbers/purchase`, {
          phone_number: selectedNumber.phone_number,
          area_code: selectedNumber.area_code,
          country: selectedNumber.country || 'US'
        }, {
          withCredentials: true
        });
      }
      
      toast.success('Phone number activated!');
      navigate('/dashboard');
    } catch (error) {
      const detail = error.response?.data?.detail;
      const status = error.response?.status;
      
      if (status === 409) {
        toast.error(detail || 'Number no longer available. Please select another.');
        setAvailableNumbers(prev => prev.filter(n => n.phone_number !== selectedNumber.phone_number));
        setSelectedNumber(null);
        setStep(2);
      } else if (status === 402) {
        // Trial account limitation - suggest using existing number
        toast.error('Trial account limitation. Please use your existing Twilio number.');
        setStep(1);
      } else {
        toast.error(detail || 'Failed to activate number');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleAreaCodeSelect = (code) => {
    setAreaCode(code);
    searchNumbers(code);
  };

  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
    setStep(3);
  };

  const handleCustomSearch = () => {
    if (searchQuery.length >= 3) {
      if (/^\d{3}$/.test(searchQuery)) {
        setAreaCode(searchQuery);
        searchNumbers(searchQuery);
      } else {
        handleSearch();
      }
    } else {
      toast.error('Please enter at least 3 characters');
    }
  };

  const filteredCodes = popularAreaCodes.filter(
    ac => ac.code.includes(searchQuery) || ac.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CapabilityBadge = ({ enabled, icon: Icon, label }) => (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
      enabled 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-white/5 text-white/30'
    }`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
      {enabled && <Check className="w-3 h-3" />}
    </div>
  );

  return (
    <div data-testid="number-selection" className="min-h-screen pb-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-fuchsia-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-light px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else navigate(-1);
            }}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {step === 1 ? 'Choose Area Code' : step === 2 ? 'Select Your Number' : 'Confirm Purchase'}
            </h1>
            <p className="text-white/60 text-sm">
              {step === 1 ? 'Pick your preferred location' : step === 2 ? `Area code: ${areaCode}` : 'Review your selection'}
            </p>
          </div>
        </div>
        
        {/* Twilio Status Badge */}
        {twilioEnabled && (
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full w-fit">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Live Numbers from Twilio</span>
          </div>
        )}
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
                disabled={searching}
                className="absolute right-2 top-1/2 -translate-y-1/2 gummy-btn px-4 py-2 text-sm disabled:opacity-50"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* Info Tooltip */}
            <div className="mb-6 flex items-start gap-3 p-4 glass-panel-light rounded-xl">
              <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-white/70 text-sm">
                Local numbers help you connect with people nearby. Choose an area code where your contacts are located for better call/text reception.
              </p>
            </div>

            {/* Your Twilio Numbers (Owned) */}
            {ownedNumbers.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                    Your Twilio Numbers
                  </h2>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                    Already Owned
                  </span>
                </div>
                <div className="space-y-2">
                  {ownedNumbers.map((number) => (
                    <button
                      key={number.phone_number}
                      data-testid={`owned-${number.phone_number}`}
                      onClick={() => handleNumberSelect({ ...number, is_owned: true })}
                      className="w-full glass-panel p-4 flex items-center justify-between hover:border-amber-500/50 transition-all text-left border-amber-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                          <Star className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{number.friendly_name}</p>
                          <p className="text-amber-400 text-xs font-medium">Ready to use • Full capabilities</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {number.capabilities?.voice && <Wifi className="w-4 h-4 text-green-400" />}
                          {number.capabilities?.sms && <MessageSquare className="w-4 h-4 text-green-400" />}
                          {number.capabilities?.mms && <Image className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="gummy-btn px-4 py-2 text-sm">
                          Use This
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Numbers Available Near You */}
            {nearbyNumbers.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                    Numbers Available Now
                  </h2>
                </div>
                <div className="grid gap-2">
                  {nearbyNumbers.slice(0, 5).map((number) => (
                    <button
                      key={number.phone_number}
                      onClick={() => handleNumberSelect(number)}
                      className="glass-panel p-3 flex items-center justify-between hover:border-fuchsia-500/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/30 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-fuchsia-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{number.friendly_name}</p>
                          <p className="text-white/50 text-xs">{number.locality || number.region || `Area ${number.area_code}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {number.capabilities?.voice && <Wifi className="w-3 h-3 text-green-400" />}
                        {number.capabilities?.sms && <MessageSquare className="w-3 h-3 text-green-400" />}
                        {number.capabilities?.mms && <Image className="w-3 h-3 text-green-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

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
        ) : step === 2 ? (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mb-4" />
                <p className="text-white/70">Finding available numbers...</p>
                <p className="text-white/40 text-sm mt-2">Searching Twilio inventory</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Error Loading Numbers</h3>
                <p className="text-white/50 mb-4 max-w-sm">{error}</p>
                <button
                  onClick={() => searchNumbers(areaCode)}
                  className="gummy-btn px-6 py-3"
                >
                  Try Again
                </button>
              </div>
            ) : availableNumbers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No Numbers Available</h3>
                <p className="text-white/50 mb-4">No numbers found for area code {areaCode}</p>
                <button
                  onClick={() => setStep(1)}
                  className="gummy-btn-secondary px-6 py-3"
                >
                  Try Another Area Code
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/70 text-sm">
                    {availableNumbers.length} numbers available
                  </p>
                  {availableNumbers[0]?.is_real && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Real Numbers
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 mb-24">
                  {availableNumbers.map((number) => (
                    <button
                      key={number.phone_number}
                      data-testid={`number-${number.phone_number}`}
                      onClick={() => handleNumberSelect(number)}
                      className="w-full glass-panel p-4 text-left transition-all hover:border-fuchsia-500/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-fuchsia-400" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-lg">
                              {number.friendly_name}
                            </p>
                            <p className="text-white/50 text-sm">
                              {number.locality || number.region || `Area ${number.area_code}`}
                            </p>
                          </div>
                        </div>
                        <div className="gummy-btn px-4 py-2 text-sm">
                          Select
                        </div>
                      </div>
                      
                      {/* Capabilities */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <CapabilityBadge 
                          enabled={number.capabilities?.voice} 
                          icon={Wifi} 
                          label="Voice" 
                        />
                        <CapabilityBadge 
                          enabled={number.capabilities?.sms} 
                          icon={MessageSquare} 
                          label="SMS" 
                        />
                        <CapabilityBadge 
                          enabled={number.capabilities?.mms} 
                          icon={Image} 
                          label="MMS" 
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* Step 3: Confirmation */
          <div className="py-8">
            <div className="glass-panel p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse-glow">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Number</h2>
                <p className="text-white/60">You're about to activate:</p>
              </div>
              
              <div className="bg-black/30 rounded-2xl p-6 mb-6">
                <p className="text-center text-3xl font-black text-white mb-2">
                  {selectedNumber?.friendly_name}
                </p>
                <p className="text-center text-white/50">
                  {selectedNumber?.phone_number}
                </p>
                {selectedNumber?.locality && (
                  <p className="text-center text-white/40 text-sm mt-2">
                    {selectedNumber.locality}, {selectedNumber.region}
                  </p>
                )}
              </div>
              
              {/* Capabilities Summary */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {selectedNumber?.capabilities?.voice && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Wifi className="w-5 h-5" />
                    <span className="font-medium">Voice</span>
                  </div>
                )}
                {selectedNumber?.capabilities?.sms && (
                  <div className="flex items-center gap-2 text-green-400">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">SMS</span>
                  </div>
                )}
                {selectedNumber?.capabilities?.mms && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Image className="w-5 h-5" />
                    <span className="font-medium">MMS</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 text-sm text-white/60 mb-6">
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  This will be your primary number
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Receive calls and texts instantly
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Keep active to maintain your number
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                data-testid="cancel-btn"
                onClick={() => {
                  setSelectedNumber(null);
                  setStep(2);
                }}
                className="flex-1 gummy-btn-secondary py-4"
              >
                Choose Different
              </button>
              <button
                data-testid="confirm-btn"
                onClick={purchaseNumber}
                disabled={purchasing}
                className="flex-1 gummy-btn py-4 disabled:opacity-50"
              >
                {purchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Activating...
                  </span>
                ) : (
                  'Confirm & Continue'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NumberSelection;
