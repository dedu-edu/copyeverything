n = int(input("Enter the size of the array: "))
numbers = []
for i in range(n):
    num = int(input(f"Enter your {i+1}th number: "))
    numbers.append(num)
numbers.sort()
rept_data = []
i = 0
while i < n:
    rept = 1
    while i + rept < n and numbers[i] == numbers[i + rept]:
        rept += 1
    rept_data.append(dict(repetition=rept, nm=numbers[i]))
    i += rept
rept_data.sort(key=lambda x: x["repetition"], reverse=True)
print("All frequency data:", rept_data)
if len(rept_data) >= 2:
    print("Second most repeated number:", rept_data[1]["nm"])
else:
    print("Not enough distinct numbers to find a second most repeated.")
