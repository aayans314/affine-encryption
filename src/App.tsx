import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { affineEncrypt, affineDecrypt, modInverse } from './utils/affine';
import DotGrid from './components/DotGrid';
import SpotlightCard from './components/SpotlightCard';
import BruteForce from './components/BruteForce';

function App() {
  const [text, setText] = useState('');
  const [aStr, setAStr] = useState('5');
  const [bStr, setBStr] = useState('8');
  const [debouncedAStr, setDebouncedAStr] = useState('5');
  const [debouncedBStr, setDebouncedBStr] = useState('8');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAStr(aStr);
      setDebouncedBStr(bStr);
    }, 400);
    return () => clearTimeout(timer);
  }, [aStr, bStr]);

  const a = parseInt(debouncedAStr);
  const b = parseInt(debouncedBStr);

  const error = useMemo(() => {
    if (!debouncedAStr || isNaN(a)) return null;
    try {
      modInverse(a);
      return null;
    } catch (e) {
      return "Invalid 'a' value. Must be coprime to 26.";
    }
  }, [a, debouncedAStr]);

  const inverseA = useMemo(() => {
    if (!debouncedAStr || isNaN(a)) return null;
    try {
      return modInverse(a);
    } catch (e) {
      return null;
    }
  }, [a, debouncedAStr]);

  const result = useMemo(() => {
    if (error || !debouncedAStr || !debouncedBStr || isNaN(a) || isNaN(b)) return '';
    if (mode === 'encrypt') {
      return affineEncrypt(text, a, b);
    } else {
      return affineDecrypt(text, a, b);
    }
  }, [text, a, b, debouncedAStr, debouncedBStr, mode, error]);

  // Visualizer: Show mapping for A-Z
  const mapping = useMemo(() => {
    if (error || !debouncedAStr || !debouncedBStr || isNaN(a) || isNaN(b)) return [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet.split('').map(char => ({
      original: char,
      mapped: affineEncrypt(char, a, b)
    }));
  }, [a, b, debouncedAStr, debouncedBStr, error]);

  const handleModeChange = (newMode: 'encrypt' | 'decrypt') => {
    if (newMode === mode) return;
    if (result) {
      setText(result);
    }
    setMode(newMode);
  };

  return (
    <>
      <div className="background-container">
        <DotGrid
          dotSize={10}
          gap={20}
          baseColor="#1a1a1a"
          activeColor="#4a4a4a"
          proximity={120}
          shockRadius={250}
          shockStrength={2}
          returnDuration={2}
          maxSpeed={500}
        />
      </div>

      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Affine Cipher
        </motion.h1>

        <div className="layout-grid">
          {/* Left Column: Keys & Mode */}
          <SpotlightCard
            layout
            className="glass-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mode-toggle">
              <button
                className={`mode-btn ${mode === 'encrypt' ? 'active' : ''}`}
                onClick={() => handleModeChange('encrypt')}
              >
                Encrypt
              </button>
              <button
                className={`mode-btn ${mode === 'decrypt' ? 'active' : ''}`}
                onClick={() => handleModeChange('decrypt')}
              >
                Decrypt
              </button>
            </div>

            <div className="controls">
              <div className="input-group">
                <label htmlFor="a-input">Key A (Multiplier)</label>
                <input
                  id="a-input"
                  type="number"
                  value={aStr}
                  onChange={(e) => setAStr(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="input-group">
                <label htmlFor="b-input">Key B (Shift)</label>
                <input
                  id="b-input"
                  type="number"
                  value={bStr}
                  onChange={(e) => setBStr(e.target.value)}
                  placeholder="e.g. 8"
                />
              </div>
            </div>

            {inverseA !== null && (
              <motion.div
                className="inverse-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: '1rem' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: '#fff', letterSpacing: '1px' }}>
                    {mode === 'encrypt'
                      ? <span>E(x) = ({a}x + {b}) mod 26</span>
                      : <span>D(x) = {inverseA}(x - {b}) mod 26</span>
                    }
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    <span>a = {a}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>a⁻¹ = {inverseA}</span>
                    <span style={{ margin: '0 0.5rem' }}>⇒</span>
                    <span>({a} × {inverseA}) mod 26 = 1</span>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  className="error"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </SpotlightCard>

          {/* Right Column: Text & Result */}
          <SpotlightCard
            className="glass-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="text-input">
              <label htmlFor="text-input">
                {mode === 'encrypt' ? 'Plain Text' : 'Cipher Text'}
              </label>
              <input
                id="text-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={mode === 'encrypt' ? "Type message to encrypt..." : "Type message to decrypt..."}
                autoComplete="off"
              />
            </div>

            <div className="results" style={{ marginTop: '2rem' }}>
              <div className="result-box">
                <span className="result-label">
                  {mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Output'}
                </span>
                <motion.div
                  key={result}
                  className="result-text"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                >
                  {result || '...'}
                </motion.div>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Bottom Row: Visualizer */}
        {!error && (
          <SpotlightCard
            className="glass-panel full-width"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Cipher Mapping (A → E(x))
            </h3>
            <div className="visualizer-container">
              <div className="visualizer-track">
                {mapping.map(m => (
                  <motion.div
                    key={m.original}
                    className="visualizer-item"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{m.original}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.3 }}>↓</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{m.mapped}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </SpotlightCard>
        )}

        {/* Brute Force Attack Section */}
        <SpotlightCard
          className="glass-panel full-width"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BruteForce
            cipherText={mode === 'encrypt' ? result : text}
            originalText={mode === 'encrypt' ? text : result}
            correctA={!isNaN(a) ? a : undefined}
            correctB={!isNaN(b) ? b : undefined}
          />
        </SpotlightCard>
      </div>
    </>
  );
}

export default App;
