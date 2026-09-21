size = int(input("enter the size of the array: "))
num = []
target = int(input("enter the target number: "))
solution = []
for i in range(size):
    num.append(int(input(f"enter the {i+1}th number: ")))
for j in range(size):
    i = 0
    if len(solution) > 0:
        break
    else:
        for i in range(size):
            if i == j:
                if num[j] + num[i+1] == target:
                    solution.append(j)
                    solution.append(i+1)
                    break
            else:
                if num[j] + num[i] == target:
                    solution.append(j)
                    solution.append(i)
                    break
print(solution)
