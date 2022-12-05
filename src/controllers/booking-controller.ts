import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const showBookings = await bookingService.getBooking(userId);

    return res.status(httpStatus.OK).send(showBookings);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);

  try {
    const createBooking = await bookingService.createBooking(userId, roomId);
    return res.status(httpStatus.OK).send(createBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);
  const bookingId = Number(req.params.bookingId);

  try {
    const update = await bookingService.updateBooking(userId, roomId, bookingId);
    return res.status(httpStatus.OK).send(update);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
