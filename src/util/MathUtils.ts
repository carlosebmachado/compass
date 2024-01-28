export interface Vector2D {
  x: number;
  y: number;
}

export default class MathUtils {
  static coordinateToRadians({ x, y }: Vector2D) {
    return Math.atan2(y, x);
  }

  static radiansToDegrees(radians: number) {
    return radians * (180 / Math.PI);
  }
}
