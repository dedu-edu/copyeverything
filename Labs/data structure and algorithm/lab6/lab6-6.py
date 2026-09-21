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
            print(current.data, end=" ")
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

def checking_operation(operation_list):
    stack1 = Stack()
    for operation in operation_list:
        if operation == "push":
            stack1.push("-")
        elif operation == "pop":
            status = stack1.pop()
            if status == None:
                return "invalid operation sequence"
        else:
            continue
    return "valid operation sequence"
operation_list = []
for i in range(int(input("enter the amount of operation: "))):
    operation_list.append(input(""))
print(checking_operation(operation_list))

