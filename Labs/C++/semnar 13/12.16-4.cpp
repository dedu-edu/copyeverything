#include <iostream>
using namespace std;
int main()
{
    int n,i,out=0;
    cin>>n;
    i = n;
    while (i>0)
    {
        i = n;
        n = n / 10;
        out += 1;
    }
    cout<<out-1<<endl;
}