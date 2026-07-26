import express from "express";
import cors from "cors";
import { collectionName, connection } from "./dbconfig.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";

const app = express();

app.use(express.json());

const allowedOrigins = [
  'https://mern-frontend-jade.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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
    userId: req.user._id, // 👈 Task ke saath User ID save kar rahe hain
    userEmail: req.user.email, // 👈 Store user email for automatic reminders
    emailSent: false
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
  // Always reset emailSent on any update so reminder fires again
  fields.emailSent = false;
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
  // Check cookie first, then fallback to Authorization header
  let token = req.cookies['token'];
  if (!token && req.headers['authorization']) {
    token = req.headers['authorization'].replace('Bearer ', '');
  }
  
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

// Check and send pending reminder emails
async function checkAndSendReminders() {
  try {
    const db = await connection();
    const collection = db.collection(collectionName);
    
    const now = new Date();
    const tasks = await collection.find({
      dueDate: { $exists: true, $ne: "" },
      emailSent: { $ne: true }
    }).toArray();
    
    let sentCount = 0;
    
    for (const task of tasks) {
      const taskDueDate = new Date(task.dueDate);
      if (isNaN(taskDueDate.getTime())) continue;
      
      const timeDiff = taskDueDate.getTime() - now.getTime();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      
      // Due within 24 hours (future) or very recently passed (last 10 min)
      if (timeDiff > -10 * 60 * 1000 && timeDiff <= twentyFourHoursMs) {
        const recipientEmail = task.userEmail || "no-email@example.com";
        const taskTitle = task.title || "Untitled Task";
        const taskDesc = task.description || "No description provided.";
        
        console.log(`✉️ Sending reminder email for task "${taskTitle}" to ${recipientEmail}...`);
        
        const mailOptions = {
          from: process.env.EMAIL_USER || '"MERN Task Manager" <noreply@example.com>',
          to: recipientEmail,
          subject: `⏰ Reminder: Task "${taskTitle}" is due soon!`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #325fc0; border-bottom: 2px solid #325fc0; padding-bottom: 8px;">Task Deadline Reminder</h2>
              <p>Hello,</p>
              <p>This is an automated notification that one of your tasks is approaching its deadline:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ff4d4d;">
                <p style="margin: 4px 0;"><strong>Task:</strong> ${taskTitle}</p>
                <p style="margin: 4px 0;"><strong>Description:</strong> ${taskDesc}</p>
                <p style="margin: 4px 0;"><strong>Due Date:</strong> ${taskDueDate.toLocaleString()}</p>
                <p style="margin: 4px 0;"><strong>Priority:</strong> ${task.priority || "Low"}</p>
              </div>
              <p>Please log in to your dashboard and complete it as soon as possible.</p>
              <p style="margin-top: 25px; font-size: 12px; color: #888;">This is an automated system email from MERN Task Manager. Please do not reply directly.</p>
            </div>
          `
        };
        
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });
          
          try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully to ${recipientEmail} for task: "${taskTitle}"`);
            sentCount++;
          } catch (err) {
            console.error(`❌ Failed to send email to ${recipientEmail}:`, err.message);
          }
        } else {
          console.log(`⚠️ SMTP Credentials not configured. SIMULATED EMAIL ALERT:`);
          console.log(`-----------------------------------------------`);
          console.log(`TO: ${mailOptions.to}`);
          console.log(`SUBJECT: ${mailOptions.subject}`);
          console.log(`BODY (HTML stripped): \n${mailOptions.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}`);
          console.log(`-----------------------------------------------`);
          sentCount++;
        }
        
        await collection.updateOne(
          { _id: task._id },
          { $set: { emailSent: true } }
        );
      }
    }
    return sentCount;
  } catch (error) {
    console.error("❌ checkAndSendReminders error:", error.message);
    throw error;
  }
}

// Expose public GET route to manually trigger email alerts (perfect for Serverless Vercel Cron Jobs!)
app.get("/send-reminders", async (req, resp) => {
  try {
    console.log("⏰ GET /send-reminders API invoked manually or by cron!");
    const sentCount = await checkAndSendReminders();
    resp.send({
      success: true,
      message: `Checked tasks and processed ${sentCount} reminders.`,
      sentCount
    });
  } catch (error) {
    resp.status(500).send({
      success: false,
      message: "Failed to trigger email alerts",
      error: error.message
    });
  }
});

// Start background email alert scheduler (runs locally, on server environments)
function startEmailScheduler() {
  console.log("⏰ Background Task Email Reminder Scheduler Started!");
  setInterval(async () => {
    try {
      await checkAndSendReminders();
    } catch (err) {
      console.error("❌ Scheduled reminder error:", err.message);
    }
  }, 60000);
}

const PORT = process.env.PORT || 7700;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startEmailScheduler(); // 👈 Start local notifier scheduler on startup
});