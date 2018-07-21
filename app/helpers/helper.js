const helper = {
  randomString: length => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i)
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  },

  randomPassword: length => {
    const chars1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const chars2 = 'abcdefghijklmnopqrstuvwxyz';
    const chars3 = '0123456789';
    const chars4 = '!.';
    let result = '';
    for (let i = length; i > 0; --i) {
      if (i == length) {
        result += chars1[Math.round(Math.random() * (chars1.length - 1))];
      }

      if (i < length && i >= length - 2) {
        result += chars2[Math.round(Math.random() * (chars2.length - 1))];
      }

      if (i <= length - 3 && i >= length - 4) {
        result += chars3[Math.round(Math.random() * (chars3.length - 1))];
      }

      if (i == 1) {
        result += chars4[Math.round(Math.random() * (chars4.length - 1))];
      }
    }

    return result;
  },

  compareStrings: (a, b) => {
    // Assuming you want case-insensitive comparison
    a = a.toLowerCase();
    b = b.toLowerCase();

    return a < b ? -1 : a > b ? 1 : 0;
  },

  compareDates: (a, b) => {
    return a < b ? -1 : a > b ? 1 : 0;
  }
};

module.exports = helper;
