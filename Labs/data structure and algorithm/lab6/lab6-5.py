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

    def peek(self):
        if self.top is None:
            return None
        return self.top.data

    def is_empty(self):
        return self.top is None

    def print_stack(self):
        current = self.top
        while current:
            print(current.data, end=" ")
            current = current.next
        print()

def enqueue(en_stack, de_stack, data):
    en_stack.push(data)
    return en_stack, de_stack

def dequeue(en_stack, de_stack):
    if de_stack.is_empty():
        while not en_stack.is_empty():
            de_stack.push(en_stack.pop())

    if de_stack.is_empty():
        print("Empty")
        return en_stack, de_stack, None

    popped = de_stack.pop()
    return en_stack, de_stack, popped

def print_queue(en_stack, de_stack):
    front_part = []
    current = de_stack.top
    while current:
        front_part.append(current.data)
        current = current.next

    back_part = []
    current = en_stack.top
    while current:
        back_part.append(current.data)
        current = current.next

    for data in reversed(front_part):
        print(data, end=" ")
    for data in back_part:
        print(data, end=" ")
    print()


# --- Main ---
enqueue_stack = Stack()
dequeue_stack = Stack()

amount = int(input("Enter number of elements: "))
for _ in range(amount):
    data = input("data: ")
    enqueue_stack, dequeue_stack = enqueue(enqueue_stack, dequeue_stack, data)

print_queue(enqueue_stack, dequeue_stack)
enqueue_stack, dequeue_stack, removed = dequeue(enqueue_stack, dequeue_stack)
print_queue(enqueue_stack, dequeue_stack)

