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
    client = new MongoClient(url);
    await client.connect();
    console.log("MongoDB Connected");
    dbInstance = client.db(dbname);
    return dbInstance;
}