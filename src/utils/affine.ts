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
