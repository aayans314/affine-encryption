import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { affineEncrypt, affineDecrypt, modInverse, composeAffineKeys } from '../utils/affine';
import './CompositionDemo.css';

const CompositionDemo = () => {
    // First affine function
    const [a1Str, setA1Str] = useState('5');
    const [b1Str, setB1Str] = useState('8');

    // Second affine function
    const [a2Str, setA2Str] = useState('3');
    const [b2Str, setB2Str] = useState('7');

    const [plaintext, setPlaintext] = useState('hello');

    const a1 = parseInt(a1Str);
    const b1 = parseInt(b1Str);
    const a2 = parseInt(a2Str);
    const b2 = parseInt(b2Str);

    // Check validity
    const error1 = useMemo(() => {
        if (!a1Str || isNaN(a1)) return null;
        try {
            modInverse(a1);
            return null;
        } catch {
            return "a₁ must be coprime to 26";
        }
    }, [a1, a1Str]);

    const error2 = useMemo(() => {
        if (!a2Str || isNaN(a2)) return null;
        try {
            modInverse(a2);
            return null;
        } catch {
            return "a₂ must be coprime to 26";
        }
    }, [a2, a2Str]);

    // Calculate composed keys
    const composedKeys = useMemo(() => {
        if (error1 || error2 || isNaN(a1) || isNaN(b1) || isNaN(a2) || isNaN(b2)) {
            return null;
        }
        return composeAffineKeys(a1, b1, a2, b2);
    }, [a1, b1, a2, b2, error1, error2]);

    // Encryption steps
    const step1 = useMemo(() => {
        if (error1 || !plaintext) return '';
        return affineEncrypt(plaintext, a1, b1);
    }, [plaintext, a1, b1, error1]);

    const step2 = useMemo(() => {
        if (error2 || !step1) return '';
        return affineEncrypt(step1, a2, b2);
    }, [step1, a2, b2, error2]);

    // Direct composition
    const directComposition = useMemo(() => {
        if (!composedKeys || !plaintext) return '';
        return affineEncrypt(plaintext, composedKeys.a, composedKeys.b);
    }, [plaintext, composedKeys]);

    // Decryption with single inverse
    const decrypted = useMemo(() => {
        if (!composedKeys || !step2) return '';
        return affineDecrypt(step2, composedKeys.a, composedKeys.b);
    }, [step2, composedKeys]);

    const hasError = error1 || error2;

    return (
        <div className="composition-container">
            <div className="composition-header">
                <h3>Function Composition</h3>
                <p className="composition-subtitle">
                    Demonstrate that two affine functions compose into a single affine function with one inverse
                </p>
            </div>

            <div className="composition-theory">
                <div className="theory-box">
                    <h4>Mathematical Proof</h4>
                    <div className="proof-steps">
                        <div className="proof-step">
                            <span className="step-label">Given:</span>
                            <div className="formula">
                                <span>f₁(x) = a₁x + b₁ (mod 26)</span>
                                <span>f₂(x) = a₂x + b₂ (mod 26)</span>
                            </div>
                        </div>
                        <div className="proof-step">
                            <span className="step-label">Composition:</span>
                            <div className="formula">
                                <span>f₂(f₁(x)) = f₂(a₁x + b₁)</span>
                                <span>= a₂(a₁x + b₁) + b₂</span>
                                <span>= a₂a₁x + a₂b₁ + b₂</span>
                            </div>
                        </div>
                        <div className="proof-step highlight">
                            <span className="step-label">Result:</span>
                            <div className="formula">
                                <span><strong>f(x) = ax + b (mod 26)</strong></span>
                                <span>where a = (a₁ × a₂) mod 26</span>
                                <span>and b = (a₂ × b₁ + b₂) mod 26</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="input-section">
                <label>Plaintext to demonstrate:</label>
                <input
                    type="text"
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    placeholder="Enter text..."
                    className="plaintext-input"
                />
            </div>

            <div className="functions-grid">
                {/* Function 1 */}
                <motion.div
                    className="function-card function-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Function 1 (f₁)</h4>
                    <div className="formula-display">
                        f₁(x) = {a1}x + {b1} (mod 26)
                    </div>
                    <div className="key-inputs">
                        <div className="input-group">
                            <label>a₁</label>
                            <input
                                type="number"
                                value={a1Str}
                                onChange={(e) => setA1Str(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>b₁</label>
                            <input
                                type="number"
                                value={b1Str}
                                onChange={(e) => setB1Str(e.target.value)}
                            />
                        </div>
                    </div>
                    {error1 && <div className="error-msg">{error1}</div>}
                </motion.div>

                {/* Function 2 */}
                <motion.div
                    className="function-card function-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Function 2 (f₂)</h4>
                    <div className="formula-display">
                        f₂(x) = {a2}x + {b2} (mod 26)
                    </div>
                    <div className="key-inputs">
                        <div className="input-group">
                            <label>a₂</label>
                            <input
                                type="number"
                                value={a2Str}
                                onChange={(e) => setA2Str(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>b₂</label>
                            <input
                                type="number"
                                value={b2Str}
                                onChange={(e) => setB2Str(e.target.value)}
                            />
                        </div>
                    </div>
                    {error2 && <div className="error-msg">{error2}</div>}
                </motion.div>
            </div>

            {!hasError && composedKeys && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="composition-result">
                        <h4>Composed Function</h4>
                        <div className="composed-formula">
                            <div className="calculation">
                                <span>a = (a₁ × a₂) mod 26 = ({a1} × {a2}) mod 26 = <strong>{composedKeys.a}</strong></span>
                                <span>b = (a₂ × b₁ + b₂) mod 26 = ({a2} × {b1} + {b2}) mod 26 = <strong>{composedKeys.b}</strong></span>
                            </div>
                            <div className="final-formula">
                                f(x) = <strong>{composedKeys.a}x + {composedKeys.b}</strong> (mod 26)
                            </div>
                        </div>
                    </div>

                    <div className="demonstration-section">
                        <h4>Step-by-Step Demonstration</h4>
                        <div className="demo-flow">
                            <div className="demo-step">
                                <span className="step-number">1</span>
                                <div className="step-content">
                                    <div className="step-title">Original Text</div>
                                    <div className="step-value">{plaintext || '...'}</div>
                                </div>
                            </div>

                            <div className="arrow">↓ Apply f₁</div>

                            <div className="demo-step">
                                <span className="step-number">2</span>
                                <div className="step-content">
                                    <div className="step-title">After f₁(x)</div>
                                    <div className="step-value">{step1 || '...'}</div>
                                </div>
                            </div>

                            <div className="arrow">↓ Apply f₂</div>

                            <div className="demo-step">
                                <span className="step-number">3</span>
                                <div className="step-content">
                                    <div className="step-title">After f₂(f₁(x))</div>
                                    <div className="step-value">{step2 || '...'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="comparison-section">
                            <div className="comparison-box verification">
                                <h5>Verification</h5>
                                <p>Direct composition f(x) = {composedKeys.a}x + {composedKeys.b}:</p>
                                <div className="comparison-value">{directComposition}</div>
                            </div>

                            <div className="comparison-box inverse">
                                <h5>Single Inverse Decryption</h5>
                                <p>Decrypt with f⁻¹ where a = {composedKeys.a}, b = {composedKeys.b}:</p>
                                <div className="comparison-value">{decrypted}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CompositionDemo;
