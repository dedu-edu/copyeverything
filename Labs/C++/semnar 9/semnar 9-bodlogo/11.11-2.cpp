#include <iostream>
using namespace std;
int sum(int a,int b,int &addition){
    return addition=a+b;
}
int main() {
    int a,b,c=0;
    cin>>a>>b;
    cout<<sum(a,b,c);
    return 0;
}
