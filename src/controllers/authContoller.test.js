const request = require("supertest");
const app = require("../app");
const http = require("http");

let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(3001, done);
}, 10000); // Aumentar o timeout para 10 segundos

afterAll((done) => {
  server.close(done);
}, 10000); // Aumentar o timeout para 10 segundos

describe("Auth Controller", () => {
  it("should register a new user", async () => {
    const res = await request(server).post("/auth/register").send({
      username: "testuser",
      password: "password123",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
  }, 10000); // Aumentar o timeout para 10 segundos

  it("should login a user", async () => {
    const res = await request(server).post("/auth/login").send({
      username: "testuser",
      password: "password123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  }, 10000); // Aumentar o timeout para 10 segundos
});
