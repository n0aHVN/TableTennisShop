import request from "supertest";
import { app } from "../../app";

it("returns 400 for path-style /api/media without object key", async () => {
  await request(app).get("/api/media/product-images").expect(400);
});

it("returns 404 for /api/media with no bucket or key (no route)", async () => {
  await request(app).get("/api/media").expect(404);
});

it("returns 404 for path-style media when object is missing", async () => {
  await request(app)
    .get("/api/media/product-images/does-not-exist/placeholder.png")
    .expect(404);
});
