import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

// Append TLS bypass params to handle OpenSSL compatibility issues on Render
const baseUrl = process.env.MONGO_URI;
const url = baseUrl.includes('?') 
    ? baseUrl + '&tls=true&tlsAllowInvalidCertificates=true'
    : baseUrl + '?tls=true&tlsAllowInvalidCertificates=true';
const dbname = "My-Project2";
export const collectionName = "Todo-list";

let client = null;
let dbInstance = null;

export const connection = async () => {
    if (dbInstance) {
        return dbInstance;
    }
    client = new MongoClient(url, {
        tls: true,
        tlsAllowInvalidCertificates: true,
        serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    console.log("MongoDB Connected");
    dbInstance = client.db(dbname);
    return dbInstance;
}