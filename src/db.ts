import mariadb from "mariadb";
import "dotenv/config";
import { env } from "./env";

export const pool = mariadb.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONN_LIMIT
});

export const GET_EVENTS_QUERY = `
  SELECT event_id, event_name FROM events
`;

export const GET_ACTORS_QUERY = `
  SELECT actor_id, actor_name, actor_role FROM actors
`;

export const GET_ACTORS_IN_EVENTS_QUERY = `
  SELECT event_id, actor_id, mic FROM actors_in_events
`;

export const GET_ACTORS_FOR_EVENT_QUERY = `
  SELECT a.actor_id, a.actor_name, a.actor_role, aie.mic
  FROM actors a
  JOIN actors_in_events aie ON a.actor_id = aie.actor_id
  WHERE aie.event_id = ?
`;

export const ASSIGN_ACTOR_TO_EVENT_QUERY = `
  INSERT INTO actors_in_events (event_id, actor_id, mic) VALUES (?, ?, ?)
`;