const prompt = require('prompt-sync')()

var biggestDivider = 1
var givenNum = prompt("Дурын тоо оруулна уу: ")

if (givenNum == 0) {
    console.log("Тэг")
} else {
    for (var dividingNum = 2; dividingNum <= givenNum - 1; dividingNum++) {
        if (givenNum % dividingNum == 0) {
            biggestDivider = dividingNum
        }
    }
    console.log(`Хамгийн их хуваагч нь ${biggestDivider}`)
}
