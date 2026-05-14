import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";  
import errorHandler from "./src/middlewares/errorHandler.js";
import createUserTable from "./src/data/createUserTable.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/api", userRoutes);

//error handling
app.use(errorHandler);

//Create users table before server starts
createUserTable();


// Test PostgreSQL Connection
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    
    res.status(200).json({
      success: true,
      database: result.rows[0].current_database,
    });

  } catch (error) {
    console.error("Database Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});