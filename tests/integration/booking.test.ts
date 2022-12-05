import app, { init } from "@/app";
import { prisma } from "@/config";

import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import { createPrivateKey } from "crypto";
import { response } from "express";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createBooking,
  createTicketType,
  createUser,
  createTicket,
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createRoomWithHotelId,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const user = await createUser();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when there's no booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with existing booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        roomId: booking.roomId,
        userId: booking.userId,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      });
    });
  });
});
describe("POST /booking", () => {
  it("should respond with status 401 if there's no token", async () => {
    const response = await server.post("/booking");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if the token isn't valid", async () => {
    const token = faker.lorem.word();
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});
describe("when token is valid", () => {
  it("should respond with status 404 if there's no enrollment", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createTicketTypeRemote();
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });
  it("should respond with status 404 if there's no ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);

    const hotel = await createHotel();
    await createRoomWithHotelId(hotel.id);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 403 when room is full", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();

    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await createBooking(user.id, room.id);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
  it("should respond with status 404 when room doesn't exist", async () => {
    const user = await createUser();

    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    await createRoomWithHotelId(hotel.id);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 0 });
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it("should respond with status 200 and with existing booking data", async () => {
    const user = await createUser();
    const ticketType = await createTicketTypeWithHotel();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await createBooking(user.id, room.id);
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toBe(httpStatus.OK);
  });
});
describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if there's no token", async () => {
    const response = await server.put("/booking/1");
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });
  it("should repsond with status 401 if token isn't valid", async () => {
    const token = faker.lorem.word();
    const response = await server.put("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });
});
describe("when token is valid", () => {
  it("should respond with status 404 if there's no room", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    await createRoomWithHotelId(hotel.id);
    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });
  it("should respond with status 403 if booking is full", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);

    const hotel = await createHotel();
    await createRoomWithHotelId(hotel.id);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it("should respond with status 200 and with updated booking data", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const room2 = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);
    const response = await server
      .put(`/booking/${booking.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId: room2.id });
    expect(response.status).toEqual(httpStatus.OK);
  });
});
