#include <iostream>
using namespace std;
int main()
{
    int n,sum_of_factorial=0,j=1,factorial=1;
    cin>>n;
    for(int i=1;i<=n;i++)
    {
        while(j <= i)

        {
            factorial = factorial * j;
            j += 1;
        }
        sum_of_factorial = sum_of_factorial + factorial;
    }
    cout<<sum_of_factorial;
}