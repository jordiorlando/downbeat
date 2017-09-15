class Fraction {
  // Fraction constructor
  constructor(...args) {
    this.set(...args);
  }

  // Get whole integer portion
  get whole() {
    return this.fraction[0];
  }

  // Set whole integer portion
  set whole(n) {
    this.fraction[0] = parseInt(n, 10);
  }

  // Get numerator
  get numerator() {
    return this.fraction[1];
  }

  // Set numerator
  set numerator(n) {
    this.fraction[1] = parseInt(n, 10);
  }

  // Get denominator
  get denominator() {
    return this.fraction[2];
  }

  // Set denominator
  set denominator(n) {
    this.fraction[2] = parseInt(n, 10);
  }

  // Normalize the sign
  _sign() {
    for (let i in this.fraction) {
      if (Object.is(this.fraction[i] * 0, -0)) {
        this.fraction[i] *= -1;
        this.negative = !this.negative;
      }
    }

    if (!this.fraction[0] && !this.fraction[1]) {
      this.negative = false;
    }
  }

  // Test equality against another fraction
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

  // Set the value
  set(...args) {
    if (args[0] instanceof Fraction) {
      this.fraction = [...args[0].fraction];
      this.negative = args[0].negative;
    } else {
      let arr = args[0] instanceof Array ? args[0] : args;

      // Convert from float/decimal to fraction
      if (arr.length === 1) {
        arr[0] = parseFloat(arr[0]);
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
      } else {
        arr[1] = parseInt(arr[1], 10);
        arr[2] = parseInt(arr[2], 10);
      }

      arr[0] = parseInt(arr[0], 10);

      this.fraction = [
        isNaN(arr[0]) ? 0 : arr[0],
        isNaN(arr[1]) ? 0 : arr[1],
        isNaN(arr[2]) ? 1 : arr[2]
      ];
      this.negative = false;

      this._sign();
    }

    return this.mixed();
  }

  // Take the absolute value (returns new Fraction)
  abs() {
    let f = new Fraction(this);

    f.negative = false;

    return f;
  }

  // Change the sign (returns new Fraction)
  negate() {
    let f = new Fraction(this);

    if (f.valueOf()) {
      f.negative = !f.negative;
    }

    return f;
  }

  // Calculate the inverse (returns new Fraction)
  invert() {
    let f = new Fraction(this).improper();

    let numerator = f.fraction[1];
    f.fraction[1] = f.fraction[2];
    f.fraction[2] = numerator;

    return f.mixed();
  }

  // Add a fraction (returns new Fraction)
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

  // Subtract a fraction (returns new Fraction)
  subtract(...args) {
    let f = new Fraction(...args).negate();
    return this.add(f);
  }

  // Multiply by a fraction (returns new Fraction)
  multiply(...args) {
    let a = new Fraction(this).improper();
    let b = new Fraction(...args).improper();

    a.fraction[1] *= b.fraction[1];
    a.fraction[2] *= b.fraction[2];

    a.negative = a.negative !== b.negative;

    return a.mixed();
  }

  // Divide by a fraction (returns new Fraction)
  divide(...args) {
    let f = new Fraction(...args).invert();
    return this.multiply(f);
  }

  // Calculate the modulo (returns new Fraction)
  modulo(...args) {
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

  // Calculate the square root (returns new Fraction or decimal approximation)
  sqrt() {
    let a = new Fraction(this).improper();
    a.numerator = Math.sqrt(a.numerator);
    a.denominator = Math.sqrt(a.denominator);

    let approx = Math.sqrt(this);

    return approx === a.valueOf() ? a.mixed() : approx;
  }

  // Normalize the numerator & denominator
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

  // Convert to a mixed fraction
  mixed() {
    while (this.fraction[1] >= this.fraction[2]) {
      this.fraction[0]++;
      this.fraction[1] -= this.fraction[2];
    }

    return this.normalize();
  }

  // Convert to an improper fraction
  improper() {
    while (this.fraction[0]) {
      this.fraction[0]--;
      this.fraction[1] += this.fraction[2];
    }

    return this.normalize();
  }

  // Get the string representation
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

  // Get the decimal approximation
  valueOf() {
    let val = this.whole + this.numerator / this.denominator;
    return this.negative ? -1 * val : val;
  }
}
