import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBookings(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: { Room: true },
  });
}

async function createBooking(booking: createBookingParams) {
  return prisma.booking.create({
    data: {
      ...booking,
    },
  });
}

async function bookingProcessment(bookingId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      Room: {},
    },
  });
}

async function findRooms(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}
export type createBookingParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;

const bookingRepository = { findBookings, createBooking, bookingProcessment, findRooms };

export default bookingRepository;
