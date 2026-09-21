#include <iostream>
#include <string>
using namespace std;
int main() {
    string name = "Student";
    string &id = name;
    string* ptr=&name;
    cout << id << endl;
    cout << &name<<endl;
    cout << ptr << endl;
    return 0;
}