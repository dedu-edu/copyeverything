class Queue:
    def __init__(self):
        self.items = []
    def enqueue(self, item):
        self.items.append(item)
    def dequeue(self):
        return self.items.pop(0)
    def size(self):
        return len(self.items)
queue = Queue()
n = int(input("Enter the size of queue: "))
for i in range(n):
    queue.enqueue(input("Enter the item: "))
print(f"current size is: {queue.size()}")