import { forbiddenError, notFoundError, unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function getBooking(userId: number) {
  const findBooking = await bookingRepository.findBookings(userId);

  if (!findBooking) {
    throw notFoundError();
  }
}

async function createBooking(userId: number, roomId: number) {
  await roomCheck(roomId);

  const insertBooking = bookingRepository.createBooking(userId, roomId);
  return insertBooking;
}

async function roomCheck(roomId: number) {
  const room = await bookingRepository.findRooms(roomId);

  return room;
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

  roomCheck,
};

export default bookingService;
