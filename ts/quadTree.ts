import { Log } from "./log";

export class BoundingBox {
  x: number;
  y: number;
  radius: number;
  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  containsPoint(x: number, y: number) {
    if (x >= this.x - this.radius &&
      y >= this.y - this.radius &&
      x < this.x + this.radius &&
      y < this.y + this.radius) {
      return true;
    } else {
      return false;
    }
  }

  intersects(other: BoundingBox) {
    for (let dx of [-1, 1]) {
      for (let dy of [-1, 1]) {
        if (other.containsPoint(this.x - this.radius * dx,
          this.y + this.radius * dy)) {
          return true;
        }
        if (this.containsPoint(other.x - other.radius * dx,
          other.y + other.radius * dy)) {
          return true;
        }
      }
    }
    return false;
  }
  toString() {
    const r = this.radius;
    return `[${this.x - r}..${this.x + r}, ${this.y - r}..${this.y + r}]`
  }
}

class QuadEntry<T> {
  x: number;
  y: number;
  value: T;
  constructor(x: number, y: number, value: T) {
    this.x = x;
    this.y = y;
    this.value = value;
  }
}

export class QuadTree<T> {
  private static kMaxCapacity = 10;
  private boundary: BoundingBox;
  private children: QuadTree<T>[];
  private entries: QuadEntry<T>[];

  constructor(boundary: BoundingBox) {
    this.boundary = boundary;
    this.children = null;
    this.entries = [];
  }

  getBoundary() {
    return this.boundary;
  }

  insert(x: number, y: number, value: T) {
    return this.insertEntry(new QuadEntry(x, y, value));
  }

  allEntries(): T[] {
    const result: T[] = [];
    this.appendFromRange(this.boundary, result);
    return result;
  }

  appendFromRange(query: BoundingBox, output: T[]) {
    if (!query.intersects(this.boundary)) {
      return;
    }
    if (this.children === null) {
      for (let entry of this.entries) {
        if (query.containsPoint(entry.x, entry.y)) {
          output.push(entry.value);
        }
      }
    } else {
      for (let child of this.children) {
        child.appendFromRange(query, output);
      }
    }
  }

  private insertEntry(entry: QuadEntry<T>) {
    if (!this.boundary.containsPoint(entry.x, entry.y)) {
      return false;
    }
    if (this.children === null) {
      this.entries.push(entry);
      if (this.entries.length > QuadTree.kMaxCapacity) {
        this.subdivide();
      }
    } else {
      for (const child of this.children) {
        if (child.insertEntry(entry)) {
          break;
        }
      }
    }
    return true;
  }

  private subdivide() {
    this.children = [];
    const bb = this.boundary;
    for (let dx of [-1, 1]) {
      for (let dy of [-1, 1]) {
        const childBB = new BoundingBox(
          bb.x + dx * (bb.radius / 2),
          bb.y + dy * (bb.radius / 2),
          bb.radius / 2.0);
        const child = new QuadTree<T>(childBB);
        this.children.push(child);
      }
    }
    for (const entry of this.entries) {
      let pushed = false;
      for (let child of this.children) {
        if (child.insertEntry(entry)) {
          pushed = true;
          break;
        }
      }
      if (!pushed) {
        Log.error(`Failed to subdivide: ${entry.x}, ${entry.y}`);
        Log.error(`Box: ${this.boundary.toString()}`)
      }
    }
    this.entries = null;
  }
}