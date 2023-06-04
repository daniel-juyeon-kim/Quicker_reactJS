require('dotenv').config()

const mariadb = require("mariadb");
const env = process.env

export default mariadb.createPool({
  host: env.host,
  user: env.user,
  port: env.port,
  password: env.password
});
