export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err.code === 11000) {
    status = 409;
    message = "Duplicate value, this record already exists";
  }
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
