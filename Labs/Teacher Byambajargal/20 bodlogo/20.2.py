def fibonacci(k):
    a, b = 1, 1
    found = False
    order = 0
    while not found:
        if a % k == 0:
            found = True
            return a, order+1
        else:
            order += 1
        a, b = b, a+b
divider = int(input("enter the divider: "))
found_number = fibonacci(divider)
print(f'''the smallest number that's dividable by {divider} is {found_number[0]}. the {found_number[1]}th number on the list''')