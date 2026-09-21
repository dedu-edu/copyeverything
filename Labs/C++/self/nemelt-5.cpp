#include <iostream>
#include <string>
using namespace std;
int main() {
    long long int a;
    cout<<"Enter a number: ";
    cin>>a;
    string b = to_string(a);
    a = b.length();
    cout<<"ene too "<<a<<" oron toi";
    return 0;
}