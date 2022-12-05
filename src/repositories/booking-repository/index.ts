import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBookings(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: { Room: true },
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function bookingProcessment(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: { roomId: roomId },
  });
}

async function findRooms(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      Booking: true,
    },
  });
}

export type createBookingParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;

const bookingRepository = {
  findBookings,
  createBooking,
  bookingProcessment,
  findRooms,
};

export default bookingRepository;
