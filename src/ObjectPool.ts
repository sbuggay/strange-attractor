export default class ObjectPool<T> {
    private pool: Array<T>;
    private index: number = 0;
    private size: number;
    
    constructor(size: number, from: () => T) {
        this.size = size;
        this.pool = Array.from(new Array(this.size), from);
    }

    get(): T {
        const ret = this.pool[this.index++];
        this.index = this.index % this.size;
        return ret;
    }
}