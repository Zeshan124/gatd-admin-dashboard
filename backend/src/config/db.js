const mysql = require("mysql");

// Connection pool (better than a single connection: survives idle timeouts and
// handles concurrent requests). timezone 'Z' stores/reads TIMESTAMPs as UTC.
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gatd",
  timezone: "Z",
  charset: "utf8mb4",
});

// Fail fast with a clear message if the DB is unreachable at startup.
pool.getConnection((err, connection) => {
  if (err) {
    console.error(`[db] Could not connect to MySQL '${process.env.DB_NAME}':`, err.code || err.message);
  } else {
    console.log(`[db] Connected to MySQL '${process.env.DB_NAME}' database`);
    connection.release();
  }
});

/**
 * Run a query and return a Promise of the results.
 * @param {string} sql
 * @param {Array} [params]
 * @returns {Promise<any>}
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * Run `work` inside a single transaction. `work` receives a `tx` object with its
 * own `query(sql, params)` bound to the transaction's connection. Commits on
 * success, rolls back on any thrown error, and always releases the connection.
 * @param {(tx: { query: (sql: string, params?: Array) => Promise<any> }) => Promise<any>} work
 * @returns {Promise<any>}
 */
function withTransaction(work) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);

      const txQuery = (sql, params = []) =>
        new Promise((res, rej) => {
          connection.query(sql, params, (qErr, results) => (qErr ? rej(qErr) : res(results)));
        });

      connection.beginTransaction(async (txErr) => {
        if (txErr) {
          connection.release();
          return reject(txErr);
        }
        try {
          const result = await work({ query: txQuery });
          connection.commit((commitErr) => {
            if (commitErr) {
              return connection.rollback(() => {
                connection.release();
                reject(commitErr);
              });
            }
            connection.release();
            resolve(result);
          });
        } catch (workErr) {
          connection.rollback(() => {
            connection.release();
            reject(workErr);
          });
        }
      });
    });
  });
}

module.exports = { pool, query, withTransaction };
