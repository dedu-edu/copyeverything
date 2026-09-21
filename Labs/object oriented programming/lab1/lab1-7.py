n = int(input())
matrix = []
for _ in range(n):
    matrix.append(list(map(int, input().split())))
main_sum = 0
secondary_sum = 0
for i in range(n):
    main_sum += matrix[i][i]
    secondary_sum += matrix[i][n - 1 - i]
result = abs(main_sum - secondary_sum)
print(result)
