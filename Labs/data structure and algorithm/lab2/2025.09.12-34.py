n = int(input("enter the size of the array: "))
number = []
palindrome = True
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
for i in range(n//2):
    if number[i] != number[-1-i]:
        palindrome = False
        break
if palindrome:
    print("palindrome")
else:
    print("not palindrome")