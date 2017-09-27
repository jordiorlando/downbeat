class Fraction {
  // Fraction constructor
  constructor(...args) {
    this.set(...args);
  }

  // Get whole integer portion
  get whole() {
    return this.values[0];
  }

  // Set whole integer portion
  set whole(n) {
    this.values[0] = parseInt(n, 10);
  }

  // Get numerator
  get numerator() {
    return this.values[1];
  }

  // Set numerator
  set numerator(n) {
    this.values[1] = parseInt(n, 10);
  }

  // Get denominator
  get denominator() {
    return this.values[2];
  }

  // Set denominator
  set denominator(n) {
    this.values[2] = parseInt(n, 10);
  }

  // Get fraction
  get fraction() {
    return this.values.slice(1);
  }

  // Normalize the sign
  _sign() {
    for (let i in this.values) {
      if (Object.is(this.values[i] * 0, -0)) {
        this.values[i] *= -1;
        this.negative = !this.negative;
      }
    }

    if (!this.values[0] && !this.values[1]) {
      this.negative = false;
    }
  }

  // Test equality against another fraction
  equals(...args) {
    let f = new Fraction(...args);

    this.mixed();

    for (let i in this.values) {
      if (this.values[i] !== f.values[i]) {
        return false;
      }
    }

    return this.negative === f.negative;
  }

  // Set the value
  set(...args) {
    if (args[0] instanceof Fraction) {
      this.values = [...args[0].values];
      this.negative = args[0].negative;
    } else {
      let arr = args[0] instanceof Array ? args[0] : args;

      // Convert from float/decimal to fraction
      if (arr.length === 1) {
        let decimal = parseFloat(arr[0]);
        arr[0] = parseInt(arr[0], 10);
        let digits = decimal.toString().length - arr[0].toString().length - 1;

        if (digits > 0) {
          arr[2] = Math.pow(10, digits);
          arr[1] = Math.abs(arr[0] - decimal) * arr[2];
        }
      }

      arr[0] = parseInt(arr[0], 10);
      arr[1] = parseInt(arr[1], 10);
      arr[2] = parseInt(arr[2], 10);

      this.values = [
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

    let numerator = f.values[1];
    f.values[1] = f.values[2];
    f.values[2] = numerator;

    return f.mixed();
  }

  // Add a fraction (returns new Fraction)
  add(...args) {
    let a = new Fraction(this).improper();
    let b = new Fraction(...args).improper();

    a.values[1] *= b.values[2];
    b.values[1] *= a.values[2];

    let lcm = a.values[2] * b.values[2];
    a.values[2] = lcm;
    b.values[2] = lcm;

    a.values[1] += a.negative === b.negative ? b.values[1] : -b.values[1];

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

    a.values[1] *= b.values[1];
    a.values[2] *= b.values[2];

    a.negative = a.negative !== b.negative;

    return a.mixed();
  }

  // Divide by a fraction (returns new Fraction)
  divide(...args) {
    let f = new Fraction(...args);
    if (!f.equals(0)) {
      return this.multiply(f.invert());
    }
  }

  // Calculate the modulo (returns new Fraction)
  modulo(...args) {
    let a = new Fraction(this).improper();
    let b = new Fraction(...args).improper();
    b.negative = false;

    if (a.negative) {
      while (a <= 0) {
        a = a.add(b);
      }
    } else {
      while (a >= b) {
        a = a.subtract(b);
      }
    }

    return a.mixed();
  }

  // Calculate the square root (returns new Fraction or decimal approximation)
  sqrt() {
    let a = new Fraction(this).improper();
    a.numerator = Math.sqrt(a.numerator);
    a.denominator = Math.sqrt(a.denominator);

    let approx = Math.sqrt(this);

    return approx === a.valueOf() ? a.mixed() : new Fraction(approx);
  }

  // Round to the nearest given denominator (returns new Fraction)
  round(...args) {
    if (args[0] instanceof Array) {
      args = args[0];
    }

    if (!args.length) {
      args.push(1);
    }

    let a = new Fraction(this).mixed();

    if (!args.includes(a.denominator)) {
      let decimal = a.numerator / a.denominator;
      let leastError = 1;

      for (let denominator of args) {
        let numerator = Math.round(decimal * denominator);
        let error = Math.abs(numerator / denominator - decimal);
        if (error < leastError || (error === leastError && denominator < a.denominator)) {
          leastError = error;
          a.numerator = numerator;
          a.denominator = denominator;
        }
      }

      // Check if the fraction equals 1
      if (a.numerator === a.denominator) {
        a.whole++;
        a.numerator = 0;
        a.denominator = 1;
      }
    }

    return a;
  }

  // Normalize the numerator & denominator
  normalize() {
    let gcd = function(a, b) {
      if (!b) {
        return a;
      }

      return gcd(b, a % b);
    };

    let g = gcd(this.values[1], this.values[2]);

    this.values[1] /= g;
    this.values[2] /= g;

    return this;
  }

  // Convert to a mixed fraction
  mixed() {
    while (this.values[1] >= this.values[2]) {
      this.values[0]++;
      this.values[1] -= this.values[2];
    }

    return this.normalize();
  }

  // Convert to an improper fraction
  improper() {
    while (this.values[0]) {
      this.values[0]--;
      this.values[1] += this.values[2];
    }

    return this.normalize();
  }

  // Get the string representation
  toString() {
    let str = `${this.negative ? '-' : ''}${this.whole ? this.whole : ''}`;

    // HACK: replace with unicode entities externally?
    if (this.numerator === 0) {
      return str;
    } else if (this.numerator === 1 && this.denominator === 2) {
      return `${str}½`;
    } else if (this.numerator === 1 && this.denominator === 3) {
      return `${str}⅓`;
    } else if (this.numerator === 2 && this.denominator === 3) {
      return `${str}⅔`;
    } else if (this.numerator === 1 && this.denominator === 4) {
      return `${str}¼`;
    } else if (this.numerator === 3 && this.denominator === 4) {
      return `${str}¾`;
    } else if (this.numerator === 1 && this.denominator === 5) {
      return `${str}⅕`;
    } else if (this.numerator === 2 && this.denominator === 5) {
      return `${str}⅖`;
    } else if (this.numerator === 3 && this.denominator === 5) {
      return `${str}⅗`;
    } else if (this.numerator === 4 && this.denominator === 5) {
      return `${str}⅘`;
    } else if (this.numerator === 1 && this.denominator === 6) {
      return `${str}⅙`;
    } else if (this.numerator === 5 && this.denominator === 6) {
      return `${str}⅚`;
    } else if (this.numerator === 1 && this.denominator === 8) {
      return `${str}⅛`;
    } else if (this.numerator === 3 && this.denominator === 8) {
      return `${str}⅜`;
    } else if (this.numerator === 5 && this.denominator === 8) {
      return `${str}⅝`;
    } else if (this.numerator === 7 && this.denominator === 8) {
      return `${str}⅞`;
    }

    return `${str}${this.numerator}/${this.denominator}`;
  }

  // Get the decimal approximation
  valueOf() {
    let val = this.whole + this.numerator / this.denominator;
    return this.negative ? -1 * val : val;
  }

  toJSON() {
    let fraction = [this.negative ? -this.values[0] : this.values[0], this.values[1], this.values[2]];
    return fraction[1] === 0 ? fraction[0] : fraction;
  }
}
