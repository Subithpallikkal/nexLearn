const path = require("path");

/** Pin tracing to this app so Next doesn’t pick a parent folder’s package-lock (e.g. Documents/). */
/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
