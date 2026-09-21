def shift_string(s, k):
    result = []
    for char in s:
        if char.isalpha():  # only shift letters
            base = ord('A') if char.isupper() else ord('a')
            shifted = (ord(char) - base + k) % 26 + base
            result.append(chr(shifted))
        else:
            result.append(char)  # keep non-letters unchanged
    return ''.join(result)

# Example usage:
text = "Hello, World!"
k = 3
print(shift_string(text, k))  # Khoor, Zruog!
