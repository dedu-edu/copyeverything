given_number = input("Enter a number: ")
if given_number == "".join(reversed(given_number)):
    print("Yes this number is palindrome")
else:
    print("No this number is not palindrome")