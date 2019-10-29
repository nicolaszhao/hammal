const fs = require('fs');
const paths = require('./paths');

const { NODE_ENV } = process.env;
const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  `${paths.dotenv}.local`,
  paths.dotenv,
];

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({ path: dotenvFile }),
    );
  }
});

const HAMMAL_APP = /^HAMMAL_APP_/i;

module.exports = function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter((key) => HAMMAL_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        PUBLIC_URL: publicUrl,
      },
    );

  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
};
