class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class Queue:
    def __init__(self):
        self.front = None
        self.rear = None

    def enqueue(self, data):
        new_node = Node(data)
        if self.rear is None:
            self.front = self.rear = new_node
        else:
            self.rear.next = new_node
            self.rear = new_node

    def dequeue(self):
        if self.front is None:
            return None
        dequeued = self.front.data
        self.front = self.front.next
        if self.front is None:
            self.rear = None
        return dequeued

    def is_empty(self):
        return self.front is None

    def print_queue(self):
        current = self.front
        while current:
            print(current.data, end=" ")
            current = current.next
        print()

def push(push_q, pop_q, data):
    pop_q.enqueue(data)

    while not push_q.is_empty():
        pop_q.enqueue(push_q.dequeue())

    return pop_q, push_q


def pop(push_q):
    if push_q.is_empty():
        print("Stack is empty!")
        return None
    return push_q.dequeue()


def print_stack(stack_q):
    stack_q.print_queue()

push_q = Queue()
pop_q = Queue()

amount = int(input("amount: "))
for _ in range(amount):
    data = input("data: ")
    push_q, pop_q = push(push_q, pop_q, data)

print_stack(push_q)
pop(push_q)

print_stack(push_q)

