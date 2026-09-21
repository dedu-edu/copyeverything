class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def Appendd(self,data):
        new_node = Node(data)
        if self.head == None:
            self.head = new_node
            return
        current_node = self.head
        while current_node.next:
            current_node = current_node.next
        current_node.next = new_node


    def printLL(self):
        current_node = self.head
        while current_node:
            print(current_node.data)
            current_node = current_node.next

n = int(input("enter linked list size: "))
llist = LinkedList()
llist.Appendd(int(input("enter node to Append: ")))
llist.Appendd(int(input("enter node to Append: ")))
print(llist.printLL())
