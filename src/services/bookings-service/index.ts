import { forbiddenError, notFoundError, unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

import ticketRepository from "@/repositories/ticket-repository";

async function getBooking(userId: number) {
  const findBooking = await bookingRepository.findBookings(userId);

  if (!findBooking) {
    throw notFoundError();
  }
  return findBooking;
}

async function createBooking(userId: number, roomId: number) {
  await roomCheck(roomId);

  const insertBooking = bookingRepository.createBooking(userId, roomId);
  return insertBooking;
}

async function ticketCheck(enrollmentId: number) {
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollmentId);
  if (!ticket) {
    throw notFoundError();
  }
}
async function roomCheck(roomId: number) {
  const room = await bookingRepository.findRooms(roomId);
  if (!room) {
    throw notFoundError();
  }

  if (room.Booking.length >= room.capacity) {
    throw forbiddenError();
  }
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  await roomCheck(roomId);
  const updateData = await bookingRepository.bookingProcessment(userId, bookingId);
  return updateData;
}
const bookingService = {
  getBooking,
  createBooking,
  updateBooking,

  ticketCheck,
  roomCheck,
};

export default bookingService;
