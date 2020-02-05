const maskString = (str, count) => {
  return str.slice(0, str.length - count) + '*'.repeat(count);
}

export default (email) => {
  const mask = '*';

  const parts = email.match(/([^\s]+)@([^\s\.]+).([a-z]+)/);
  const maskedParts = [];
  for (let i = 1; i <= 3; i += 1) {
    const len = Math.round(parts[i].length * 0.7);
    maskedParts.push(`${maskString(parts[i], len)}`);
  }
  return `${maskedParts[0]}@${maskedParts[1]}.${maskedParts[2]}`;
};

