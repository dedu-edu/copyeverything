a = input("please enter your word,(max and min 3 characters) ")
ab = a
b = input("please enter your second word: ")
a = a.replace(a[0:2], b[0:2])
b = b.replace(b[0:2], ab[0:2])
print(f'{a} {b}')