import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
// This allows us to use environment variables in our codenpm install ioredis

export const redis = new Redis(process.env.UPSTASH_REDIS_URL); // Create a new Redis client using the Upstash Redis URL from environment variables
// The Redis client is used to interact with the Redis database
