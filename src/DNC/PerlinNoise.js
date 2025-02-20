// A fixed permutation table for our noise function. I have no idea why this is optimal, but in Perlin we trust.
const permutation = [
  151, 160, 137, 91, 90, 15,
  131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
  140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
  21, 10, 23, 190, 6, 148, 247, 120, 234, 75,
  0, 26, 197, 62, 94, 252, 219, 203, 117, 35,
  11, 32, 57, 177, 33, 88, 237, 149, 56, 87,
  174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
  71, 134, 139, 48, 27, 166, 77, 146, 158, 231,
  83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
  65, 25, 63, 161, 1, 216, 80, 73, 209, 76,
  132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
  116, 188, 159, 86, 164, 100, 109, 198, 173, 186,
  3, 64, 52, 217, 226, 250, 124, 123, 5, 202,
  38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
  59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
  223, 183, 170, 213, 119, 248, 152, 2, 44, 154,
  163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
  129, 22, 39, 253, 19, 98, 108, 110, 79, 113,
  224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
  251, 34, 242, 193, 238, 210, 144, 12, 191, 179,
  162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
  49, 192, 214, 31, 181, 199, 106, 157, 184, 84,
  204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72,
  243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];

// Duplicate the permutation table to avoid overflow.
const p = new Array(512);
for (let i = 0; i < 256; i++) {
  p[i] = permutation[i];
  p[256 + i] = permutation[i];
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
  return a + t * (b - a);
}

function grad(hash, x, y) {
  // Convert low 4 bits of hash code into 12 gradient directions.
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : (h === 12 || h === 14 ? x : 0);
  // Return the dot product with (x, y) using positive or negative values.
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function perlinNoise2D(x, y) { // We can turn this into a class later. Output range is -1 to 1.
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = p[p[X] + Y];
  const ab = p[p[X] + Y + 1];
  const ba = p[p[X + 1] + Y];
  const bb = p[p[X + 1] + Y + 1];

  const x1 = lerp(u, grad(aa, xf, yf), grad(ba, xf - 1, yf));
  const x2 = lerp(u, grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1));
  const result = lerp(v, x1, x2);

  return result;
}

export function perlinNoise2DNorm(x, y) { // Normalised the output so the range is 0 to 1.
    return (perlinNoise2D(x, y) + 1) / 2;
    //console.log(noise_value);
    //return noise_value;
}

// This is kind of tricky, it's based on ken's improved noise but it's going to be hard to debug and verify that it's working until we can visualise it. I understand most of the math, but even a small typo could throw it all off.
// We can either just keep working towards implementation and pray, or export a texture based on the noise value for a given x,y range.
// One of the input values to the noise function has to be a non-whole number, otherwise we will always be returned 0. Multiple ways to mitigate this, including just adding a constant offset to the inputs.
