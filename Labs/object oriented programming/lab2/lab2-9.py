class Counter:
    def __init__(self, value=0):
        self._value = value

    def increment(self):
        self._value += 1
        print(f"current value {self._value}")
    def decrement(self):
        self._value -= 1
        print(f"current value {self._value}")
    def reset(self):
        self._value = 0
        print(f"current value {self._value}")

count = Counter()
action = True
while action:
    action = input("""What would you like to do? 
    |1 for increment| 2 for decrement| 3 for reset|   
    """)
    if action == "1" :
        count.increment()
    elif action == "2":
        count.decrement()
    elif action == "3":
        count.reset()
    else:
        print("Invalid input")
    action = input("Do you want to continue? (Y/N): ")
    if action.lower() == "n":
        action = False
        print("Thank you for using this program")
    elif action.lower() == "y":
        continue
    else:
        print("Invalid input... exiting")
        break


