export type Vector2 = { x: number; y: number };
export type Vector2Like = { x: number | string; y: number | string };

export class Matrix<T> {
  private map = new Map<string, T>();

  private static toKey(vector: Vector2Like): string {
    const x = typeof vector.x === "number" ? vector.x : parseInt(vector.x);
    const y = typeof vector.y === "number" ? vector.y : parseInt(vector.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new TypeError("Coordinates must be finite numbers");
    }
    if (x < 0 || y < 0) {
      throw new RangeError("Negative coordinates are not allowed");
    }
    return `${x},${y}`;
  }

  private static keyToVector(key: string): Vector2 {
    const [x, y] = key.split(",").map(Number);
    return { x: x!, y: y! };
  }

  get(key: Vector2Like): T | undefined {
    return this.map.get(Matrix.toKey(key));
  }

  *readRow(y: number): Generator<T | undefined> {
    for (let x = 0; x <= this.maxX(); x++) {
      yield this.get({ x, y });
    }
  }

  *readColumn(x: number): Generator<T | undefined> {
    for (let y = 0; y <= this.maxY(); y++) {
      yield this.get({ x, y });
    }
  }

  set(key: Vector2Like, value: T): void {
    this.map.set(Matrix.toKey(key), value);
  }

  setRow(y: number, values: T[]): void {
    let i = 0;
    for (let x = 0; x <= this.maxX(); x++) {
      this.set({ x, y }, values[i++]!);
    }
  }

  setColumn(x: number, values: T[]): void {
    let i = 0;
    for (let y = 0; y <= this.maxY(); y++) {
      this.set({ x, y }, values[i++]!);
    }
  }

  delete(key: Vector2Like): boolean {
    return this.map.delete(Matrix.toKey(key));
  }

  has(key: Vector2Like): boolean {
    return this.map.has(Matrix.toKey(key));
  }

  coords(): MapIterator<Vector2> {
    return this.map.keys().map((key) => Matrix.keyToVector(key));
  }

  entries(): MapIterator<[Vector2, T]> {
    return this.map
      .entries()
      .map(([key, value]) => [Matrix.keyToVector(key), value]);
  }

  count(): number {
    return this.map.size;
  }

  maxX(): number {
    const coords = this.coords();
    return Math.max(...coords.map((c) => c.x));
  }

  maxY(): number {
    const coords = this.coords();
    return Math.max(...coords.map((c) => c.y));
  }

  clear() {
    this.map.clear();
  }

  toString(
    serializer?: (coords: Vector2, value: T | undefined) => string
  ): string {
    const arr = Array.from({ length: this.maxY() + 1 }, (_, y) =>
      Array.from({ length: this.maxX() + 1 }, (_, x) => {
        const coords = { x, y };
        const value = this.get(coords);
        return serializer ? serializer(coords, value) : String(value);
      })
    );
    return arr.map((row) => row.join("")).join("\n");
  }
}
