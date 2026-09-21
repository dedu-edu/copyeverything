#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;
#define PI 3.14159265

int main ()
{
    double n,sum=1;
    double sumcos=0,sumsin=0;
    cin>>n;

        for(int j=1;j<=n;j++)
        {
            sumcos= sumcos + cos(j);
            sumsin= sumsin + sin(j);
            sum = sum * sumcos/sumsin;
        }


    cout<<fixed<<setprecision(3)<<sum;
    return 0;
}