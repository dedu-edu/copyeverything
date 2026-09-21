#include <iostream>
using namespace std;
int main() {
    int b = 3; // buildings
    int f = 5; // floors
    int d = 4; // doors per floor
    int doorNumber;
    cout << "Enter door number (1 to 60): ";
    cin >> doorNumber;
    if (doorNumber < 1 || doorNumber > 60) {
        cout << "Invalid door number!" << endl;
        return 1;
    }
    int bIndex = (doorNumber - 1) / (f * d);
    int fIndex = ((doorNumber - 1) % (f * d)) / d;
    int dIndex = (doorNumber - 1) % d;
    cout << "Building: " << (bIndex + 1) << ", "
         << "Floor: " << (fIndex + 1) << ", "
         << "Door: " << (dIndex + 1) << ". " << endl;
    return 0;
}
