#include <iostream>
using namespace std;
int sum(int a)
{
    int sum = 0,i=1;
    for(i=1;i<=a;i++)
    {
        sum+=i;
    }
    return sum;
}
int main()
{
    int a;
    cin>>a;
    cout<<sum(a)<<endl;
    return 0;
}