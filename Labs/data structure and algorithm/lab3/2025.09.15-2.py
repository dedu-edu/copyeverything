class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def Prependd(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def printLL(self):
        current_node = self.head
        while current_node:
            print(current_node.data)
            current_node = current_node.next
n = int(input("enter linked list size: "))
llist = LinkedList()
for i in range(n):
    llist.Prependd(int(input(f"enter node{i+1}'s data: ")))
print(llist.printLL())
llist.Prependd(int(input("enter node to Prepend: ")))
print(llist.printLL())
