#include <iostream>
using namespace std;
int main() {
    int sum[4]={12,13,14,15},add=0;
    cin>>sum[0];
    cin>>sum[1];
    cin>>sum[2];
    cin>>sum[3];
    for (int i = 0; i < 4; i++) {
        add = add + sum[i];
    }
    cout << add << endl;
    return 0;
}
