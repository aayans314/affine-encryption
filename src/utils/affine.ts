export const modInverse = (a: number, m: number = 26): number => {
  for (let x = 0; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  throw new Error("No inverse exists. 'a' must be coprime to 26.");
};

export const affineEncrypt = (text: string, a: number, b: number): string => {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i].toLowerCase();
    if (/[a-z]/.test(ch)) {
      const x = ch.charCodeAt(0) - 'a'.charCodeAt(0);
      const y = (a * x + b) % 26;
      out += String.fromCharCode(y + 'a'.charCodeAt(0));
    } else {
      out += ch;
    }
  }
  return out;
};

export const affineDecrypt = (text: string, a: number, b: number): string => {
  try {
    const aInv = modInverse(a);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i].toLowerCase();
      if (/[a-z]/.test(ch)) {
        const y = ch.charCodeAt(0) - 'a'.charCodeAt(0);
        // Javascript % operator can return negative numbers, so we need to handle that
        let x = (aInv * (y - b)) % 26;
        if (x < 0) x += 26;
        out += String.fromCharCode(x + 'a'.charCodeAt(0));
      } else {
        out += ch;
      }
    }
    return out;
  } catch (e) {
    return "Error: Invalid 'a' value";
  }
};

/**
 * Compose two affine functions into a single affine function
 * If f1(x) = a1*x + b1 and f2(x) = a2*x + b2
 * Then f2(f1(x)) = a2*(a1*x + b1) + b2 = (a2*a1)*x + (a2*b1 + b2)
 * Returns the combined keys { a, b } where:
 *   a = (a1 * a2) mod 26
 *   b = (a2 * b1 + b2) mod 26
 */
export const composeAffineKeys = (
  a1: number,
  b1: number,
  a2: number,
  b2: number
): { a: number; b: number } => {
  const a = (a1 * a2) % 26;
  const b = (a2 * b1 + b2) % 26;
  return { a, b };
};
