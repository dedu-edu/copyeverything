user_input = int(input("Please enter your number: "))
type_conversion = int(input("Please enter your type: "))
if type_conversion == "b" or type_conversion == "B":
    while user_input != 1:
        output = user_input % 2
        user_input = user_input // 2

#127,364,1025