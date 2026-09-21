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

    def Insertt(self,data,index):
        if index == 0:
            self.Prependd(data)
        new_node = Node(data)
        current_node = self.head
        index_to_search = index
        current_index = 0
        while current_node:
            if current_index == index_to_search:
                break
            current_node = current_node.next
            current_index += 1
        if current_node is None:
            return
        new_node.next = current_node.next
        current_node.next = new_node

    def Appendd(self, data):
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

    def DeleteAtIndex(self,index):
        current_node = self.head
        if index == 0:
            self.head = self.head.next
        index_to_search = index
        current_index = 0

        while current_node:
            if current_index == index_to_search-1:
               break
            current_node = current_node.next
            current_index += 1
        if current_node is None:
            return
        current_node.next = current_node.next.next

    def GetLength(self):
        current_node = self.head
        length = 0
        while current_node:
            length += 1
            current_node = current_node.next
        return length

    def GetIndexValue(self, index):
        current_node = self.head
        index_to_search = index
        current_index = 0
        while current_node:
            if current_index == index_to_search:
                return current_node.data
            current_node = current_node.next
            current_index += 1

    def ReverseLinkedList(self):
        reverse = None
        current_node = self.head
        while current_node:
            next_node = current_node.next
            current_node.next = reverse
            prev = current_node
            current_node = next_node
        return reverse

    def FindInLinkedList(self, data):
        current_node = self.head
        item_to_search = data
        while current_node:
            if current_node.data == item_to_search:
                return True
            current_node = current_node.next
        return False

    def MergeTwoLinkedLists(self,llist2):
        current_node = self.head
        while current_node.next:
            current_node = current_node.next
        current_node.next = llist2.head

n = int(input("enter linked list size: "))
llist1 = LinkedList()
for i in range(n):
    llist1.Appendd(int(input(f"enter node{i + 1}'s data: ")))
llist1.printLL()
llist2 = LinkedList()
for i in range(n):
    llist2.Appendd(int(input(f"enter node{i + 1}'s data: ")))
llist1.MergeTwoLinkedLists(llist2)
llist1.printLL()
