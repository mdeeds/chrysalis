export class Library {
  private books: Map<string, string>;

  constructor() {
    this.books = new Map<string, string>();
  }

  mergeFromObject(other: any) {
    for (const libraryName of Object.keys(other)) {
      this.books.set(libraryName, other[libraryName]);
    }
  }

  toObject() {
    const result: any = {};
    for (const libraryName of this.books.keys()) {
      result[libraryName] = this.books.get(libraryName);
    }
    return result;
  }

  getCode(libraryName: string) {
    if (this.books.has(libraryName)) {
      return this.books.get(libraryName);
    } else {
      return `/* No such library: ${libraryName} */`;
    }
  }

  size() {
    return this.books.size;
  }

  libraryNames() {
    return this.books.keys();
  }
}