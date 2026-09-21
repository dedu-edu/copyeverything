#include <iostream>
using namespace std;
int main()
{
    int n,sum=0;
    cin>>n;
    for(int i=2;i<=n;i+=2)
    {
        sum = sum + (i-1)*i;
    }
    cout<<sum;
}
