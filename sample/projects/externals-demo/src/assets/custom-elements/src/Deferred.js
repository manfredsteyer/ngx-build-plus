/**
 * @template T
 */
export default class Deferred {
  constructor() {
    /**
     * @private
     * @type {T|undefined}
     */
    this._value = undefined;

    /**
     * @private
     * @type {Function|undefined}
     */
    this._resolve = undefined;

    /**
     * @private
     * @type {!Promise<T>}
     */
    this._promise = new Promise(resolve => {
      this._resolve = resolve;

      if (this._value) {
        resolve(this._value);
      }
    });
  }

  /**
   * @param {T} value
   */
  resolve(value) {
    if (this._value) {
      throw new Error('Already resolved.');
    }

    this._value = value;

    if (this._resolve) {
      this._resolve(value);
    }
  }

  /**
   * @return {!Promise<T>}
   */
  toPromise() {
    return this._promise;
  }
}
