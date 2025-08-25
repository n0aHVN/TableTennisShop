import { app } from '../../app';
import request from 'supertest';
it("signout: response with a success message", async()=>{
    const cookie = await global.signin();
    const response = await request(app)
        .get("/api/users/signout")
        .set("Cookie", cookie)
        .send()
        .expect(200);
    expect(response.body).toMatchObject({
        success: true
    });
    console.log(response.get('Set-Cookie'))
    expect(response.get('Set-Cookie')![0]).toMatch(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    );
})