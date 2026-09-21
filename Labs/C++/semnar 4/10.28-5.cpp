#include <iostream>
#include <string>
using namespace std;
int main() {
    int n,mx=0,count=1;
    cin >> n;
    int arr[n]{};
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    for (int j = 0; j < n; j++) {
        if (arr[j] > mx) {
            mx = arr[j];
        }
        else if (arr[j] == mx) {
            count = count + 1;
        }
    }
    cout << mx << endl;
    cout << count << endl;
    return 0;
}