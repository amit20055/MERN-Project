import express from "express";
import cors from "cors";
import { collectionName, connection } from "./dbconfig.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

// Fix for SSL/TLS compatibility issue between Render and MongoDB Atlas
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();

app.use(express.json());
app.use(cors({
  origin:true,
  credentials:true
}));
app.use(cookieParser());

app.get("/ping", (req, res) => {
  res.send({ 
    mongo_uri_exists: !!process.env.MONGO_URI, 
    mongo_uri_prefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 10) : null 
  });
});

app.post("/signup", async (req, resp) => {
  const userData = req.body;

  if (userData.email && userData.password) {
    const db = await connection();
    const collection = await db.collection("users");
    const result = await collection.insertOne(userData);
    if (result) {
      jwt.sign(userData, "Google", { expiresIn: "5d" }, (error, token) => {
        resp.send({
          success:true,
          message:"signup done",
          token
        })
      });
    }
  }else{
    resp.send({
          success:false,
          message:"signup not done",
        
        })

  }

});

app.post("/login", async (req, resp) => {
  const userData = req.body;

  if (userData.email && userData.password) {
    const db = await connection();
    const collection = await db.collection("users");
    const result = await collection.findOne({email:userData.email,password:userData.password});
    if (result) {
      jwt.sign(userData, "Google", { expiresIn: "5d" }, (error, token) => {
        resp.send({
          success:true,
          message:"login done",
          token
        })
      });
    }else{
      resp.send({
          success:false,
          message:"user not found",
        
        })

    }
  }else{
    resp.send({
          success:false,
          message:"login not done",
        
        })

  }

});

app.post("/add-task",verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const result = await collection.insertOne(req.body);
  if (result) {
    resp.send({
      message: "New task added successfully",
      success: true,
      result,
    });
  } else {
    resp.send({ message: "Failed to add new task", success: false });
  }
});

app.get("/tasks",verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const result = await collection.find().toArray();
  if (result) {
    resp.send({ message: "Tasks list fectched", success: true, result });
  } else {
    resp.send({ message: "error try after sometime", success: false });
  }
});



app.put("/update-task",verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const { _id, ...fields } = req.body;
  const update = { $set: fields };
  console.log(fields);

  const result = await collection.updateOne({ _id: new ObjectId(_id) }, update);
  if (result) {
    resp.send({ message: "Tasks data updated", success: true, result });
  } else {
    resp.send({ message: "error try after sometime", success: false });
  }
});

app.get("/task/:id",verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const id = req.params.id;
  const result = await collection.findOne({ _id: new ObjectId(id) });
  if (result) {
    resp.send({ message: "Task found", success: true, result });
  } else {
    resp.send({ message: "Task not found", success: false });
  }
});

app.delete("/delete/:id",verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const id = req.params.id;
  const collection = await db.collection(collectionName);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result) {
    resp.send({ message: "Task deleted successfully", success: true, result });
  } else {
    resp.send({ message: "error try after sometime", success: false });
  }
});

app.delete("/delete-multiple",verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const ids = req.body;

  const deleteTaskIds = ids.map((item) => new ObjectId(item));

  const collection = await db.collection(collectionName);
  const result = await collection.deleteMany({ _id: { $in: deleteTaskIds } });
  if (result) {
    resp.send({ message: "Task deleted successfully", success: result });
  } else {
    resp.send({ message: "error try after sometime", success: false });
  }
});

function verifyJwtToken(req,resp,next){
  const token= req.cookies['token'];
  jwt.verify(token,'Google',(error,decoded)=>{
    if(error){
      return resp.send({
        message:"invalid token",
        success:false

      })
    }
    next();
    
  })

}


const PORT = process.env.PORT || 7700;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});