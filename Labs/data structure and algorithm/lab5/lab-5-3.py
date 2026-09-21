class Stack:
    def __init__(self):
        self.items = []
    def push(self, data):
        self.items.append(data)
        return self
    def pop(self):
        return self.items.pop()
    def pop_print(self):
        for i in range(len(self.items)):
            print(self.items[len(self.items) - i - 1])
    def print_stack(self):
        return self.items
    def peek(self):
        return self.items[len(self.items) - 1]
steak = Stack()
n = int(input("enter the size of stack: "))
for i in range(n):
    steak.push(input("enter the item: "))
steak.pop_print()
