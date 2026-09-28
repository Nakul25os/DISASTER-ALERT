import React, { useState, useRef, useEffect } from 'react'
import {
  getIndianStates,
  getCitiesForState,
  getLocalitiesForCity,
} from '../data/indianLocations'
import { MapPin, ChevronDown, Check, Search, X, RotateCcw } from 'lucide-react'

export default function LocationSelector({
  state = '',
  city = '',
  location = '',
  onChange,
  required = true,
  className = '',
}) {
  const [selectedState, setSelectedState] = useState(state)
  const [selectedCity, setSelectedCity] = useState(city)
  const [selectedLocality, setSelectedLocality] = useState(location)

  // Keep internal state in sync with props if passed
  useEffect(() => {
    if (state !== undefined && state !== selectedState) setSelectedState(state)
  }, [state])
  useEffect(() => {
    if (city !== undefined && city !== selectedCity) setSelectedCity(city)
  }, [city])
  useEffect(() => {
    if (location !== undefined && location !== selectedLocality) setSelectedLocality(location)
  }, [location])

  // Dropdown open states
  const [stateOpen, setStateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [localityOpen, setLocalityOpen] = useState(false)

  // Search terms
  const [stateSearch, setStateSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [localitySearch, setLocalitySearch] = useState('')

  // Refs for click outside
  const stateRef = useRef(null)
  const cityRef = useRef(null)
  const localityRef = useRef(null)

  // Data lists
  const allStates = getIndianStates()
  const availableCities = getCitiesForState(selectedState)
  const availableLocalities = getLocalitiesForCity(selectedState, selectedCity)

  // Filtered lists
  const filteredStates = allStates.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase().trim())
  )
  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase().trim())
  )
  const filteredLocalities = availableLocalities.filter((l) =>
    l.toLowerCase().includes(localitySearch.toLowerCase().trim())
  )

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setStateOpen(false)
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false)
      }
      if (localityRef.current && !localityRef.current.contains(e.target)) {
        setLocalityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifyChange = (newState, newCity, newLocality) => {
    if (onChange) {
      onChange({
        state: newState,
        city: newCity,
        location: newLocality,
      })
    }
  }

  const handleSelectState = (st) => {
    setSelectedState(st)
    setSelectedCity('')
    setSelectedLocality('')
    setStateOpen(false)
    setStateSearch('')
    notifyChange(st, '', '')
  }

  const handleSelectCity = (ct) => {
    setSelectedCity(ct)
    setSelectedLocality('')
    setCityOpen(false)
    setCitySearch('')
    notifyChange(selectedState, ct, '')
  }

  const handleSelectLocality = (loc) => {
    setSelectedLocality(loc)
    setLocalityOpen(false)
    setLocalitySearch('')
    notifyChange(selectedState, selectedCity, loc)
  }

  const handleReset = () => {
    setSelectedState('')
    setSelectedCity('')
    setSelectedLocality('')
    setStateSearch('')
    setCitySearch('')
    setLocalitySearch('')
    notifyChange('', '', '')
  }

  const hasSelection = selectedState || selectedCity || selectedLocality

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden inputs to feed native form submission (FormData) */}
      <input type="hidden" name="state" value={selectedState} required={required} />
      <input type="hidden" name="city" value={selectedCity} required={required} />
      <input type="hidden" name="location" value={selectedLocality} required={required} />

      <div className="flex items-center justify-between text-xs px-0.5">
        <label className="text-slate-400 font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-accent-blue" />
          Location & Region Details
        </label>
        {hasSelection && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-slate-400 hover:text-accent-blue flex items-center gap-1 transition-colors"
            title="Reset location selection"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* 1. STATE DROPDOWN */}
      <div className="relative" ref={stateRef}>
        <button
          type="button"
          onClick={() => {
            setStateOpen(!stateOpen)
            setCityOpen(false)
            setLocalityOpen(false)
          }}
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-left flex items-center justify-between transition-colors ${
            stateOpen
              ? 'border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.2)]'
              : selectedState
              ? 'border-white/20 text-headline'
              : 'border-white/10 text-slate-400'
          }`}
        >
          <span className="truncate">{selectedState || 'Select Indian State / UT'}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              stateOpen ? 'rotate-180 text-accent-blue' : ''
            }`}
          />
        </button>

        {stateOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#0e1320] border border-white/15 shadow-2xl p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Search filter */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                placeholder="Search state or UT..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-accent-blue"
                autoFocus
              />
              {stateSearch && (
                <button
                  type="button"
                  onClick={() => setStateSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
              {filteredStates.length > 0 ? (
                filteredStates.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectState(st)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      st === selectedState
                        ? 'bg-accent-blue text-white font-medium'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{st}</span>
                    {st === selectedState && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">No matching states found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. CITY DROPDOWN */}
      <div className="relative" ref={cityRef}>
        <button
          type="button"
          disabled={!selectedState}
          onClick={() => {
            if (!selectedState) return
            setCityOpen(!cityOpen)
            setStateOpen(false)
            setLocalityOpen(false)
          }}
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-left flex items-center justify-between transition-colors ${
            !selectedState
              ? 'opacity-50 cursor-not-allowed border-white/5 text-slate-500'
              : cityOpen
              ? 'border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.2)]'
              : selectedCity
              ? 'border-white/20 text-headline'
              : 'border-white/10 text-slate-400'
          }`}
        >
          <span className="truncate">
            {selectedCity || (selectedState ? 'Select City / District' : 'Select State first')}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              cityOpen ? 'rotate-180 text-accent-blue' : ''
            }`}
          />
        </button>

        {cityOpen && selectedState && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#0e1320] border border-white/15 shadow-2xl p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Search filter */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder={`Search city in ${selectedState}...`}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-accent-blue"
                autoFocus
              />
              {citySearch && (
                <button
                  type="button"
                  onClick={() => setCitySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => handleSelectCity(ct)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      ct === selectedCity
                        ? 'bg-accent-blue text-white font-medium'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{ct}</span>
                    {ct === selectedCity && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  <p>No matching cities found</p>
                  {citySearch.trim() && (
                    <button
                      type="button"
                      onClick={() => handleSelectCity(citySearch.trim())}
                      className="mt-2 text-accent-blue hover:underline font-medium text-[11px]"
                    >
                      Use "{citySearch.trim()}" as city
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. LOCALITY / LOCATION DROPDOWN */}
      <div className="relative" ref={localityRef}>
        <div className="relative">
          <input
            type="text"
            disabled={!selectedCity}
            value={selectedLocality}
            onChange={(e) => {
              setSelectedLocality(e.target.value)
              setLocalitySearch(e.target.value)
              notifyChange(selectedState, selectedCity, e.target.value)
            }}
            onFocus={() => {
              if (selectedCity) setLocalityOpen(true)
            }}
            placeholder={
              !selectedCity
                ? 'Select State & City first'
                : 'Select or type Locality / Neighborhood'
            }
            className={`w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border outline-none text-headline transition-colors ${
              !selectedCity
                ? 'opacity-50 cursor-not-allowed border-white/5 text-slate-500'
                : localityOpen
                ? 'border-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                : 'border-white/10'
            }`}
          />
          <button
            type="button"
            disabled={!selectedCity}
            onClick={() => {
              if (selectedCity) setLocalityOpen(!localityOpen)
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white disabled:opacity-40"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                localityOpen ? 'rotate-180 text-accent-blue' : ''
              }`}
            />
          </button>
        </div>

        {localityOpen && selectedCity && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#0e1320] border border-white/15 shadow-2xl p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 mb-1 text-[11px] text-slate-400 border-b border-white/10 flex items-center justify-between">
              <span>Popular Localities in {selectedCity}</span>
              <span className="text-[10px] text-accent-blue">Or type above</span>
            </div>

            {/* List of localities */}
            <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
              {filteredLocalities.length > 0 ? (
                filteredLocalities.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleSelectLocality(loc)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      loc === selectedLocality
                        ? 'bg-accent-blue text-white font-medium'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{loc}</span>
                    {loc === selectedLocality && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  <p>No exact locality match in list.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    You can freely type your custom neighborhood or area in the input box!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
