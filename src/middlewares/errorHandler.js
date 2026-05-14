// Centralized error handling
const errorHandling = (err, req, res, next) => {
    
    const statusCode = res.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({ success: false, message });
};


export default errorHandling;
