#include <iostream>
#include <cmath>
using namespace std;
int main() {
    int x,n;
    cout<<"Enter a number: ";
    cin>>x;
    cout<<"enter the power: ";
    cin>>n;
    x = pow(x,n);
    cout<<x;
    return 0;
}