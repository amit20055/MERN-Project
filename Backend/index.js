import express from "express";
import cors from "cors";
import { collectionName, connection } from "./dbconfig.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cors({
  origin:true,
  credentials:true
}));
app.use(cookieParser());

app.post("/signup", async (req, resp) => {
  const userData = req.body;

  if (userData.email && userData.password) {
    const db = await connection();
    const collection = await db.collection("users");
    const result = await collection.insertOne(userData);
    if (result) {
      // 👈 Token mein Database wala ID (insertedId) daal rahe hain
      jwt.sign({ ...userData, _id: result.insertedId }, "Google", { expiresIn: "5d" }, (error, token) => {
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
      // 👈 Token mein pura user document (jisne _id bhi hai) daal rahe hain
      jwt.sign({ ...result }, "Google", { expiresIn: "5d" }, (error, token) => {
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
  const taskData = {
    ...req.body,
    userId: req.user._id // 👈 Task ke saath User ID save kar rahe hain
  };
  const collection = await db.collection(collectionName);
  const result = await collection.insertOne(taskData);
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
  // 👈 Sirf wahi tasks laao jo is user ke hain
  const result = await collection.find({ userId: req.user._id }).toArray();
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

  // 👈 Check ki user sirf apna hi task update kare
  const result = await collection.updateOne({ _id: new ObjectId(_id), userId: req.user._id }, update);
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
  // 👈 Sirf apna task dhoondo
  const result = await collection.findOne({ _id: new ObjectId(id), userId: req.user._id });
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
  // 👈 Check ki user sirf apna hi task delete kare
  const result = await collection.deleteOne({ _id: new ObjectId(id), userId: req.user._id });
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
  // 👈 Sirf wahi tasks delete karo jo is user ke hain
  const result = await collection.deleteMany({ _id: { $in: deleteTaskIds }, userId: req.user._id });
  if (result.acknowledged) {
    resp.send({ message: "Task deleted successfully", success: true, result });
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
    req.user = decoded; // 👈 Token se user ka data req mein save kar liya
    next();
    
  })

}


const PORT = process.env.PORT || 7700;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});