#include <iostream>
#include <string>
using namespace std;
int main()
{
    int n,j=1;
    cout<<"enter your number:";
    cin>>n;
    for (int i = 1; i <= n; i++)
    {
        j = i * j;
        cout<<i<<"!="<<j<<endl;
    }
    return 0;
}