num1 = str(1100110)
num2 = str(10101)
a = int(num1, 2)
b = int(num2, 2)
sum = str(a + b)
sum1 = bin(int(sum))
subtract = str(a - b)
subtract1 = bin(int(subtract))
multi = str(a * b)
multi1 = bin(int(multi))
print(f'sum is {sum}, {sum1}'
      f'subtract is {subtract}, {subtract1}'
      f'multi is {multi}, {multi1}')
