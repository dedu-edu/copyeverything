#include <iostream>
using namespace std;
int main() {
    int a;
    cout << "Enter a number: ";
    cin >> a;
    a = a % 10;
    cout << "last digit is: " << a;
    return 0;
}
