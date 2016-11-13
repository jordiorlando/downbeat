class Fraction {
  constructor(...args) {
    this.set(...args);
    // console.log(this.fraction, this.valueOf());
  }

  get whole() {
    return this.fraction[0];
  }

  set whole(n) {
    this.fraction[0] = parseInt(n, 10);
  }

  get numerator() {
    return this.fraction[1];
  }

  set numerator(n) {
    this.fraction[1] = parseInt(n, 10);
  }

  get denominator() {
    return this.fraction[2];
  }

  set denominator(n) {
    this.fraction[2] = parseInt(n, 10);
  }

  _sign() {
    for (let i in this.fraction) {
      if (this.fraction[i] < 0) {
        this.fraction[i] *= -1;
        this.negative = !this.negative;
      }
    }

    if (!this.fraction[0] && !this.fraction[1]) {
      this.negative = false;
    }
  }

  equals(...args) {
    let f = new Fraction(...args);

    this.mixed();

    for (let i in this.fraction) {
      if (this.fraction[i] !== f.fraction[i]) {
        return false;
      }
    }

    return this.negative === f.negative;
  }

  set(...args) {
    if (args[0] instanceof Fraction) {
      this.fraction = [...args[0].fraction];
      this.negative = args[0].negative;
    } else {
      let arr = args[0] instanceof Array ? args[0] : args;

      // Convert from float/decimal
      if (arr.length === 1) {
        let dec = Math.abs(arr[0] - Math.trunc(arr[0]));
        if (dec) {
          for (let d = 2; d <= 4; d++) {
            let n = dec * d;
            if (n === Math.trunc(n)) {
              arr[1] = n;
              arr[2] = d;
              break;
            }
          }
        }
      }

      this.fraction = [
        parseInt(arr[0], 10) || 0,
        parseInt(arr[1], 10) || 0,
        parseInt(arr[2], 10) || 1
      ];
      this.negative = false;

      this._sign();
    }

    return this.mixed();
  }

  abs() {
    let f = new Fraction(this);

    f.negative = false;

    return f;
  }

  negate() {
    let f = new Fraction(this);

    if (f.valueOf()) {
      f.negative = !f.negative;
    }

    return f;
  }

  invert() {
    let f = new Fraction(this).improper();

    let numerator = f.fraction[1];
    f.fraction[1] = f.fraction[2];
    f.fraction[2] = numerator;

    return f.mixed();
  }

  add(...args) {
    let a = new Fraction(this).improper();
    let b = new Fraction(...args).improper();

    a.fraction[1] *= b.fraction[2];
    b.fraction[1] *= a.fraction[2];

    let lcm = a.fraction[2] * b.fraction[2];
    a.fraction[2] = lcm;
    b.fraction[2] = lcm;

    a.fraction[1] += a.negative === b.negative ? b.fraction[1] : -b.fraction[1];

    a._sign();
    return a.mixed();
  }

  subtract(...args) {
    let f = new Fraction(...args).negate();
    return this.add(f);
  }

  multiply(...args) {
    let a = new Fraction(this).improper();
    let b = new Fraction(...args).improper();

    a.fraction[1] *= b.fraction[1];
    a.fraction[2] *= b.fraction[2];

    a.negative = a.negative !== b.negative;

    return a.mixed();
  }

  divide(...args) {
    let f = new Fraction(...args).invert();
    return this.multiply(f);
  }

  mod(...args) {
    let a = new Fraction(this).improper();
    let b = new Fraction(...args).improper();

    let neg = a.negative;
    a.negative = false;
    b.negative = false;

    while (a >= b) {
      a = a.subtract(b);
    }

    a.negative = neg;
    return a.mixed();
  }

  normalize() {
    let gcd = function(a, b) {
      if (!b) {
        return a;
      }

      return gcd(b, a % b);
    };

    let g = gcd(this.fraction[1], this.fraction[2]);

    this.fraction[1] /= g;
    this.fraction[2] /= g;

    return this;
  }

  mixed() {
    while (this.fraction[1] >= this.fraction[2]) {
      this.fraction[0]++;
      this.fraction[1] -= this.fraction[2];
    }

    return this.normalize();
  }

  improper() {
    while (this.fraction[0]) {
      this.fraction[0]--;
      this.fraction[1] += this.fraction[2];
    }

    return this.normalize();
  }

  toString() {
    let sign = this.negative ? '-' : '';

    if (!this.numerator) {
      return `${sign}${this.whole}`;
    }
    if (!this.whole) {
      return `${sign}${this.numerator}/${this.denominator}`;
    }

    return `${sign}${this.whole} ${this.numerator}/${this.denominator}`;
  }

  valueOf() {
    let val = this.whole + this.numerator / this.denominator;
    return this.negative ? -1 * val : val;
  }
}
