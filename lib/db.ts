import mysql from "mysql2/promise";

function createPool(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}) {
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
  });
}

export const authDb = createPool({
  host: process.env.DB_AUTH_HOST || "localhost",
  port: parseInt(process.env.DB_AUTH_PORT || "3306"),
  user: process.env.DB_AUTH_USER || "root",
  password: process.env.DB_AUTH_PASSWORD || "",
  database: process.env.DB_AUTH_NAME || "auth",
});

export const charactersDb = createPool({
  host: process.env.DB_CHARACTERS_HOST || "localhost",
  port: parseInt(process.env.DB_CHARACTERS_PORT || "3306"),
  user: process.env.DB_CHARACTERS_USER || "root",
  password: process.env.DB_CHARACTERS_PASSWORD || "",
  database: process.env.DB_CHARACTERS_NAME || "characters",
});

export const websiteDb = createPool({
  host: process.env.DB_WEBSITE_HOST || "localhost",
  port: parseInt(process.env.DB_WEBSITE_PORT || "3306"),
  user: process.env.DB_WEBSITE_USER || "root",
  password: process.env.DB_WEBSITE_PASSWORD || "",
  database: process.env.DB_WEBSITE_NAME || "lordaeron_website",
});
