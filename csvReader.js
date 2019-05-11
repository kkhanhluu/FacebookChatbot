var fs = require('fs');

var inputFile='data.csv';
let objectArray = []; 
const buf = fs.readFileSync(inputFile, "utf-8");  
const stringArray = buf.split(','); 
for (let i = 0; i < 12; i += 6) {
    objectArray.push({
        question: stringArray[i], 
        a: stringArray[i + 1],
        b: stringArray[i + 2],
        c: stringArray[i + 3],
        d: stringArray[i + 4],
        correct: stringArray[i + 5],
    });
}
objectArray.forEach(element => {
    console.log(element);
});