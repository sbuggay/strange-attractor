export default class CircularBuffer<T> {
    public size: number;
    public start: number;
    public end: number;
    public buffer: Array<T>;

    constructor(size: number, from?: () => T) {
        this.size = size;
        this.start = 0;
        this.end = 0;
        if (from) {
            this.buffer = Array.from(new Array(size), from);
        }
        else {
            this.buffer = new Array(size);
        }
    }

    push(element: T) {
        this.buffer[this.end] = element;
        this.end++;
        this.end = this.end % this.size;
    }

    shift(): T {
        const value = this.buffer[this.start];
        this.start++;
        this.start = this.start % this.size;
        return value;
    }

    single(): T[] {
        if (this.start < this.end) {
            return this.buffer.slice(this.start, this.end);
        }
        else if (this.start > this.end) {
            return this.buffer.slice(this.end).concat(this.buffer.slice(0, this.start));
        }
        return [];
    }

    get length() {
        if (this.start < this.end) {
            return this.end - this.start;
        }
        else if (this.start > this.end) {
            return this.end + this.size - this.start;
        }
        return 0;
    }
}