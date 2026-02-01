// define functions for database connection, transactions and close.

import { Pool } from 'pg'

type Config = {
  host?: string,
  user?: string,
  password?: string,
  database?: string,
  connectionTimeoutMillis?: number, // number of milliseconds to wait before timing out when connecting a new client
  idleTimeoutMillis?: number, // number of milliseconds a client must sit idle in the pool and not be checked out
  max?: number, // maximum number of clients the pool should contain, default 10
  min?: number, // minimum number of clients the pool should hold on to and _not_ destroy with the idleTimeoutMillis, default 0
  allowExitOnIdle?: boolean, // Setting `allowExitOnIdle: true` in the config will allow the node event loop to exit as soon as all clients in the pool are idle, even if their socket is still open
  maxLifetimeSeconds?: number // Sets a max overall life for the connection. 60000 means 60 seconds regardless if idle or not, default 0
}

// Configs
const configs : Config = {
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_REG_USER,
  password: process.env.POSTGRES_REG_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 20,
  min: 0,
  allowExitOnIdle: false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxLifetimeSeconds: 60000
}

// Create pool instance to handle all client instances of the app
let pool: Pool | undefined;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(configs);

    pool.on('error', (err) => {
      process.exit(1);
    });
  }

  return pool;
};

// Shut down pool when app shuts down
export const shutDownPool = async () => {
    if (pool) {
        await pool.end();
    }
}