class Stack:
    def __init__(self):
        self.items = []
    def push(self, data):
        self.items.append(data)
        return self
    def pop(self):
        return self.items.pop()
    def print_stack(self):
        return self.items
    def peek(self):
        return self.items[len(self.items) - 1]
steak = Stack()
n = int(input("enter the size of stack: "))
for i in range(n):
    steak.push(input("enter the item: "))
print(steak.peek())

