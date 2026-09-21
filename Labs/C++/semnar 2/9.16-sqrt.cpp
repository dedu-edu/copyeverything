#include <iostream>
#include <cmath>
using namespace std;
int main() {
    int a,b;
    cout<<"Enter a number: ";
    cin>>a;
    b = sqrt(a);
    b = round(b);
    if (pow(b, 2)==a) {
        cout << "the number is valid";
    }
    else {
        cout << "the number is not valid";
    }
    return 0;
}