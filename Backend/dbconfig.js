import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGO_URI;
const dbname = "My-Project2";
export const collectionName = "Todo-list";

let client = null;
let dbInstance = null;

export const connection = async () => {
    if (dbInstance) {
        return dbInstance;
    }
    console.log("Attempting to connect to MongoDB...");
    try {
        client = new MongoClient(url, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        await client.connect();
        console.log("✅ MongoDB Connected Successfully");
        dbInstance = client.db(dbname);
        return dbInstance;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        console.error("❌ Full Error:", error);
        throw error; // Rethrow so the route knows it failed
    }
}