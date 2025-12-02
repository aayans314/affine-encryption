def mod_inverse(a, m=26):
    for x in range(m):
        if (a * x) % m == 1:
            return x
    raise ValueError("no inverse exists")

def affine_encrypt(text, a, b):
    out = ""
    for ch in text.lower():
        if ch.isalpha():
            x = ord(ch) - ord('a')
            y = (a * x + b) % 26
            out += chr(y + ord('a'))
        else:
            out += ch
    return out

def affine_decrypt(text, a, b):
    a_inv = mod_inverse(a)
    out = ""
    for ch in text.lower():
        if ch.isalpha():
            y = ord(ch) - ord('a')
            x = (a_inv * (y - b)) % 26
            out += chr(x + ord('a'))
        else:
            out += ch
    return out

mode = input("type 'e' to encrypt or 'd' to decrypt: ").strip().lower()
text = input("enter text: ")
a = int(input("enter a (must be coprime with 26): "))
b = int(input("enter b: "))

if mode == 'e':
    print(affine_encrypt(text, a, b))
elif mode == 'd':
    print(affine_decrypt(text, a, b))
else:
    print("unknown option")
