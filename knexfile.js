require('dotenv').config();

function buildMySqlSsl() {
  if (process.env.DB_SSL !== 'true') {
    return undefined;
  }

  const ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  // Optional CA certificate for providers like Aiven.
  // Store PEM content as base64 in DB_SSL_CA_B64.
  if (process.env.DB_SSL_CA_B64) {
    ssl.ca = Buffer.from(process.env.DB_SSL_CA_B64, 'base64').toString('utf8');
  }

  return ssl;
}

const connection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

const ssl = buildMySqlSsl();
if (ssl) {
  connection.ssl = ssl;
}

module.exports = {
  client: 'mysql2',
  connection
};
