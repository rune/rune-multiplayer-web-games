export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

export function getRandomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

export function degreesToRad(degrees: number) {
  return degrees * (Math.PI / 180)
}
