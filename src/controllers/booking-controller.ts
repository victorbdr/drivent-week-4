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
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const createBooking = await bookingService.createBooking(userId, roomId);
    return res.status(httpStatus.CREATED).send(createBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const updateBooking = await bookingService.updateBooking(userId, roomId);
    return res.status(httpStatus.OK).send(updateBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
