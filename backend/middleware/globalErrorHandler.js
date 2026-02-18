export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
};
