const path = require('path');

const nextConfig = {
  // point tracing at the monorepo root (one level up from web/)
  outputFileTracingRoot: path.join(__dirname, '../'),
};

module.exports = nextConfig;