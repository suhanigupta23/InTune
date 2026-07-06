// very small helper – can be replaced with nanoid or any library
export default function generateAnon() {
  const adjectives = ['Sky', 'Moon', 'Star', 'Sun', 'River', 'Cloud'];
  const word = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num  = Math.floor(100 + Math.random() * 900); // 100-999
  return `${word}_${num}`;    // e.g. 'Moon_452'
}
