import { app } from "../../app";
import request from "supertest";

it("responds with details about the current user", async () => {
    const cookie = await global.signin();
    const response = await request(app)
        .get("/api/users/currentuser")
        .set("Cookie", cookie)
        .send()
        .expect(200);

    console.log(response.body);
});