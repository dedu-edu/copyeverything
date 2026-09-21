txt = input('Enter a string: ')
string = []
for i in txt:
    if i.isalpha():
        string.append(i)
out = "".join(string)
length = len(out)
i = 0
d = -1
e = 0
while i < length:
    if string[i] == string[d]:
        i += 1
        d -= 1
        e += 1
    else:
        print("not palindrom")
        break
    if e == length:
        print("palindorm")