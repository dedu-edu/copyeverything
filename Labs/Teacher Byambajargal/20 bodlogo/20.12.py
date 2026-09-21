def dividers_and_their_sum(given_number):
    divider_count = 0
    sum_of_dividers = 0
    for i in range(1, given_number+1):
        if given_number % i == 0:
            print(i)
            divider_count += 1
            sum_of_dividers += i
    print(f'The sum of all dividers is {sum_of_dividers}')
    print(f'The total amount of dividers is {divider_count}')

dividers_and_their_sum(int(input("please enter your number: ")))