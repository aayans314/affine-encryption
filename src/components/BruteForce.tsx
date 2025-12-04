import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { affineDecrypt } from '../utils/affine';
import './BruteForce.css';

interface BruteForceProps {
    cipherText: string;
    originalText?: string;  // The plaintext to compare against
    correctA?: number;       // The actual 'a' key used
    correctB?: number;       // The actual 'b' key used
}

interface DecryptionAttempt {
    a: number;
    b: number;
    result: string;
    isValid: boolean;
    isCorrect?: boolean;  // Whether this is the correct decryption
}

const validAValues = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]; // Coprime to 26

const BruteForce = ({ cipherText, originalText, correctA, correctB }: BruteForceProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'keys' | 'result'>('keys');

    const allAttempts = useMemo((): DecryptionAttempt[] => {
        if (!cipherText || cipherText.trim() === '') return [];

        const attempts: DecryptionAttempt[] = [];

        // Try all combinations of a and b
        for (let a = 1; a <= 25; a++) {
            for (let b = 0; b <= 25; b++) {
                const isValid = validAValues.includes(a);
                const result = isValid ? affineDecrypt(cipherText, a, b) : '';

                // Check if this is the correct combination
                let isCorrect = false;
                if (isValid) {
                    // Check by keys if we know them
                    if (correctA !== undefined && correctB !== undefined) {
                        isCorrect = (a === correctA && b === correctB);
                    }
                    // Or check by matching the original text
                    else if (originalText) {
                        isCorrect = result.toLowerCase() === originalText.toLowerCase();
                    }
                }

                attempts.push({ a, b, result, isValid, isCorrect });
            }
        }

        return attempts;
    }, [cipherText, originalText, correctA, correctB]);

    const validAttempts = useMemo(() => {
        return allAttempts.filter(attempt => attempt.isValid);
    }, [allAttempts]);

    const filteredAttempts = useMemo(() => {
        let filtered = validAttempts;

        if (searchTerm.trim()) {
            filtered = filtered.filter(attempt =>
                attempt.result.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortBy === 'result') {
            filtered = [...filtered].sort((a, b) => a.result.localeCompare(b.result));
        }

        return filtered;
    }, [validAttempts, searchTerm, sortBy]);

    const totalCombinations = 25 * 26; // 650
    const validCombinations = validAValues.length * 26; // 312

    if (!cipherText || cipherText.trim() === '') {
        return (
            <div className="brute-force-empty">
                <p>Enter some cipher text above to see brute force attack results</p>
            </div>
        );
    }

    return (
        <div className="brute-force-container">
            <div className="brute-force-header">
                <div className="header-content">
                    <h3>Brute Force Attack 🕵️‍♂️</h3>
                    <p className="subtitle">
                        We only have <strong>{validCombinations}</strong> valid key combinations to try
                    </p>
                </div>
                <button
                    className="expand-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '▼ Collapse' : '▶ Show All Combinations'}
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Possible</span>
                    <span className="stat-value">{totalCombinations}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Valid (a coprime to 26)</span>
                    <span className="stat-value highlight">{validCombinations}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Valid 'a' values</span>
                    <span className="stat-value">{validAValues.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Possible 'b' values</span>
                    <span className="stat-value">26</span>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
            >
                {isExpanded && (
                    <div className="attempts-section">
                        <div className="controls-bar">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Filter by decrypted text..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="sort-controls">
                                <span>Sort by:</span>
                                <button
                                    className={sortBy === 'keys' ? 'active' : ''}
                                    onClick={() => setSortBy('keys')}
                                >
                                    Keys
                                </button>
                                <button
                                    className={sortBy === 'result' ? 'active' : ''}
                                    onClick={() => setSortBy('result')}
                                >
                                    Result
                                </button>
                            </div>
                        </div>

                        <div className="results-info">
                            Showing {filteredAttempts.length} of {validCombinations} valid combinations
                        </div>

                        <div className="attempts-grid">
                            {filteredAttempts.map((attempt, index) => (
                                <motion.div
                                    key={`${attempt.a}-${attempt.b}`}
                                    className={`attempt-card ${attempt.isCorrect ? 'correct' : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.01, 1) }}
                                >
                                    {attempt.isCorrect && (
                                        <div className="correct-badge">
                                            ✓ Correct
                                        </div>
                                    )}
                                    <div className="attempt-keys">
                                        <span className="key-badge">a={attempt.a}</span>
                                        <span className="key-badge">b={attempt.b}</span>
                                    </div>
                                    <div className="attempt-result">
                                        {attempt.result}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredAttempts.length === 0 && searchTerm && (
                            <div className="no-results">
                                No results found for "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            <div className="brute-force-explanation">
                <div className="explanation-box">
                    <h4>Issues:</h4>
                    <ul>
                        <li>
                            <strong>Small key space:</strong> Only 312 valid combinations can be tested in milliseconds
                        </li>
                        <li>
                            <strong>No computational security:</strong> Breaking this cipher requires no advanced mathematics
                        </li>
                        <li>
                            <strong>Frequency analysis:</strong> Letter frequencies remain intact, making it even easier to break
                        </li>
                        <li>
                            <strong>Pattern recognition:</strong> Common words like "the", "and", "is" are easily spotted in results
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BruteForce;
