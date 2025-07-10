import jwt from "jsonwebtoken";
import { NotFoundError, UserAttrs, UserModel } from "@tabletennisshop/common";
import { Password } from "@tabletennisshop/common";

export class UserService {
    static async findUserByLoginString(loginString: string): Promise<UserAttrs | null> {
        const client = await UserModel.findOne({
            $or: [
                { email: loginString },
                { username: loginString }
            ]
        });
        return client;
    }
    static async authenticateUser({
        email,
        password
    }: {
        email: string;
        password: string;
    }): Promise<{ clientJwt: string, currentUser: any, message: string }> {
        const client: UserAttrs | null = await this.findUserByLoginString(email);
        // If the client is not found, throw an error
        if (!client) {
            throw new NotFoundError("Email or Password is incorrect!");
        }

        const isPasswordCorrect = await Password.compare(password, client.password);
        // If the password is incorrect, throw an error
        if (!isPasswordCorrect) {
            throw new NotFoundError("Email or Password is incorrect!");
        }
        // Generate a JWT token for the client
        const clientJwt = jwt.sign(
            {
                username: client.username,
                email: client.email,
            },
            "secretkey"
        );

        return {
            clientJwt: clientJwt,
            currentUser: {
                username: client.username,
                email: client.email,
            },
            message: "auth.signin.success"
        };
    }

    static async addUser({
        email,
        password,
        full_name,
        address,
        province,
        district,
        ward,
        phone_number
    }: {
        email: string;
        password: string;
        full_name?: string;
        address?: string;
        province?: string;
        district?: string;
        ward?: string;
        phone_number?: string;
    }) {
        const client = new UserModel({
            email,
            password,
            full_name,
            address,
            province,
            district,
            ward,
            phone_number
        });
        await client.save();
        return client;
    }
}
