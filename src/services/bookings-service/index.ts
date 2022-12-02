import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

import ticketRepository from "@/repositories/ticket-repository";
import { Booking } from "@prisma/client";

async function getBooking(userId: number) {
  const findBooking = await bookingRepository.findBookings(userId);

  if (!findBooking) {
    throw notFoundError();
  }
  return findBooking;
}

async function createBooking(userId: number, roomId: number) {
  await roomCheck(roomId);
  const bookingData = {
    userId,
    roomId,
  };
  const insertBooking = bookingRepository.createBooking(bookingData);
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
    throw notFoundError;
  }
}

async function updateBooking(userId: number, roomId: number) {
  await roomCheck(roomId);
  const updateData = await bookingRepository.bookingProcessment(userId);
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
