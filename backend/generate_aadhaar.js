const verhoeffTableD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const verhoeffTableP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

function validateAadhaar(aadhaarString) {
  const clean = aadhaarString.replace(/\s/g, "");
  if (clean.length !== 12 || !/^\d+$/.test(clean)) return false;
  
  let c = 0;
  const myArray = clean.split("").map(Number).reverse();
  for (let i = 0; i < myArray.length; i++) {
    c = verhoeffTableD[c][verhoeffTableP[i % 8][myArray[i]]];
  }
  return c === 0;
}

// Generate valid 12-digit Aadhaar numbers
const validNumbers = [];
while (validNumbers.length < 5) {
  // Generate random 11 digits (first digit should be 2-9)
  const firstDigit = Math.floor(Math.random() * 8) + 2; // 2 to 9
  let baseNum = firstDigit.toString();
  for (let i = 0; i < 10; i++) {
    baseNum += Math.floor(Math.random() * 10).toString();
  }
  
  // Try all possible check digits (0-9) to see which one makes it valid
  for (let d = 0; d <= 9; d++) {
    const candidate = baseNum + d;
    if (validateAadhaar(candidate)) {
      validNumbers.push(candidate);
      break;
    }
  }
}

console.log("VALID AADHAAR NUMBERS:");
validNumbers.forEach(n => {
  console.log(`${n.substring(0, 4)} ${n.substring(4, 8)} ${n.substring(8, 12)}`);
});
