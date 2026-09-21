letter = input("enter your string: ")
size = len(letter)
reverse = []
for i in range(1,size+1):
    reverse.append(letter[-i])
out = "".join(reverse)
print(out)