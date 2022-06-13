/* eslint-env node */

module.exports = function parseFlag(flagName, fallback) {
  let flag = process.env[flagName];

  if (flag === 'true') {
    return true;
  } else if (flag === 'false') {
    return false;
  } else {
    return fallback;
  }
};
