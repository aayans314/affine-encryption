import { useState, useMemo } from 'react';
import './App.css';
import { affineEncrypt, affineDecrypt, modInverse } from './utils/affine';

function App() {
  const [text, setText] = useState('');
  const [a, setA] = useState(5);
  const [b, setB] = useState(8);

  const error = useMemo(() => {
    try {
      modInverse(a);
      return null;
    } catch (e) {
      return "Invalid 'a' value. Must be coprime to 26.";
    }
  }, [a]);

  const encrypted = useMemo(() => {
    if (error) return '';
    return affineEncrypt(text, a, b);
  }, [text, a, b, error]);

  const decrypted = useMemo(() => {
    if (error) return '';
    return affineDecrypt(encrypted, a, b);
  }, [encrypted, a, b, error]);

  // Visualizer: Show mapping for A-Z
  const mapping = useMemo(() => {
    if (error) return [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet.split('').map(char => ({
      original: char,
      mapped: affineEncrypt(char, a, b)
    }));
  }, [a, b, error]);

  return (
    <div className="container">
      <h1>Affine Cipher</h1>

      <div className="controls">
        <div className="input-group">
          <label htmlFor="a-input">Key A (Multiplier)</label>
          <input
            id="a-input"
            type="number"
            value={a}
            onChange={(e) => setA(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="b-input">Key B (Shift)</label>
          <input
            id="b-input"
            type="number"
            value={b}
            onChange={(e) => setB(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="text-input">
        <label htmlFor="text-input">Input Text</label>
        <input
          id="text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something..."
        />
      </div>

      <div className="results">
        <div className="result-box">
          <span className="result-label">Encrypted</span>
          <div className="result-text">{encrypted || '...'}</div>
        </div>

        {/* Optional: Show decrypted to prove it works, or maybe just the mapping */}
        <div className="result-box" style={{ borderColor: '#00f2fe' }}>
          <span className="result-label" style={{ color: '#00f2fe' }}>Decrypted Check</span>
          <div className="result-text">{decrypted || '...'}</div>
        </div>
      </div>

      {/* Mini Visualizer */}
      {!error && (
        <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '5px', paddingBottom: '10px' }}>
            {mapping.map(m => (
              <div key={m.original} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{m.original}</span>
                <span style={{ fontSize: '0.8rem' }}>↓</span>
                <span style={{ fontWeight: 'bold', color: '#4facfe' }}>{m.mapped}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
