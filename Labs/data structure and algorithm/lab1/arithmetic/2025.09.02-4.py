typ = input("enter the type to begin with: c for celsius, f for farenheit: " ).lower()
if typ == "c":
    temp = int(input("enter the temperature: "))
    print(temp*1.8+32)
elif typ == "f":
    temp = int(input("enter the temperature: "))
    print((temp-32)/1.8)
else:
    print("please enter a valid type")