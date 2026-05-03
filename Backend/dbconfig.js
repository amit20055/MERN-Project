import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGO_URI;
const dbname="My-Project2";
export const collectionName="Todo-list";
const client = new MongoClient(url);

 export const connection=async()=>{
    const connect=await client.connect();
    console.log("MongoDB Connected");
    return await connect.db(dbname)

}