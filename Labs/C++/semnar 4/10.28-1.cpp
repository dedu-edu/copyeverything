#include <iostream>
#include <string>
using namespace std;
int main() {
    struct {
        string name;
        int age;
        string code;
        int phonenumber;
    }input;
    cin >> input.name >> input.age >> input.code >> input.phonenumber;
    cout << input.name << " " << input.age << " " << input.code << " "<< input.phonenumber << endl;
    return 0;
}
