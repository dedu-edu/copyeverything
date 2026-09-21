numbeg1 = int(input("Please enter your beginning number: "))
numbeg2 = int(input("Please enter your ending number: "))
operation = False
first_time_usage = True
while operation == False:
    if first_time_usage == True:
        print("""Choose your operation: 
                  S for (-)
                  P for (+)
                  M for (*)
                  D for (/)
                  """)
        op = input()
        if op == "S" or op == "s":
            output = (numbeg1 - numbeg2)
            print(output)
        elif op == "P" or op == "p":
            output = (numbeg1 + numbeg2)
            print(output)
        elif op == "M" or op == "m":
            output = (numbeg1 * numbeg2)
            print(output)
        elif op == "D" or op == "d":
            output = (numbeg1 / numbeg2)
            print(output)
        else:
            print("Invalid input")
            break
        operation = input("Wish to continue?:Y/N ")
        if operation == "Y" or operation == "y":
            operation = False
            first_time_usage = False
            previous_operation = output
        elif operation == "N" or operation == "n":
            operation = True
    elif first_time_usage == False:
        next_number = int(input("Please enter your next number: "))
        print("""Choose your operation: 
                  S for (-)
                  P for (+)
                  M for (*)
                  D for (/)
                  """)
        op = input()
        if op == "S" or op == "s":
            output = previous_operation - next_number
            print(output)
        elif op == "P" or op == "p":
            output = previous_operation + next_number
            print(output)
        elif op == "M" or op == "m":
            output = previous_operation * next_number
            print(output)
        elif op == "D" or op == "d":
            output = previous_operation / next_number
            print(output)
        else:
            print("Invalid input")
            break
        previous_operation = output
        operation = input("Wish to continue?:Y/N ")
        if operation == "Y" or operation == "y":
            operation = False
        elif operation == "N" or operation == "n":
            operation = True

