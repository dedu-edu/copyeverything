a = 'abcd'
b = a
a = a.replace(a[-1], a[0])
a = a.replace(a[0], b[-1], 1)
print(a)

