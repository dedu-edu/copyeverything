class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, data):
        new_node = Node(data)
        new_node.next = self.top
        self.top = new_node

    def pop(self):
        if self.top is None:
            return None
        popped = self.top.data
        self.top = self.top.next
        return popped

    def print_stack(self):
        current = self.top
        while current:
            print(current.data, end="")
            current = current.next

    def peek(self):
        if self.top is None:
            print("Stack is empty")
        print(self.top.data)

    def length(self):
        if self.top is None:
            return 0
        leng = 0
        current = self.top
        while current:
            leng += 1
            current = current.next
        return leng

n = int(input("enter number: "))
stack1 = Stack()
while n > 0:
    data = n % 2
    stack1.push(data)
    n = n // 2
stack1.print_stack()