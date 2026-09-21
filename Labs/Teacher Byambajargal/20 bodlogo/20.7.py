def least_number(given_number):
    numbers = []
    for i in given_number:
        numbers.append(int(i))
    numbers.sort()
    output = ""
    for number in numbers:
        output += str(number)
    print(output)
least_number(input("Enter the number: "))
