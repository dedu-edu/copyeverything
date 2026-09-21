#include <iostream>
using namespace std;
int main()
//find triangles parameter
{
    int a,b;
    cin>>a>>b;
    if(a>b){
        cout<<b;
    }
    else if(b>a){
        cout<<a;
    }
    else{
        cout<<b;
    }
    return 0;
}