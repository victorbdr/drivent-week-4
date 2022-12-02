import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBookings, createBooking, changeBooking } from "@/controllers/booking-controller";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/", createBooking)
  .put("/:bookingId", changeBooking);
export { bookingsRouter };
