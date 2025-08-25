import jwt from "jsonwebtoken";
import { NotFoundError, UserEnum, UserStatusEnum } from "@tabletennisshop/common";
import { Password } from "@tabletennisshop/common";
import { UserAttrs, UserDoc, UserModel } from "../models/user.model";

export class UserService {
    static async findUserByLoginString(loginString: string) {
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
    }): Promise<{ clientJwt: string }> {
        const client= await this.findUserByLoginString(email);
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
                type: client.type,
                _id: client._id.toString() // Ensure the ID is a string
            },
            process.env.JWT_KEY! // Non-null assertion since we check this before starting the app
        );

        return {
            clientJwt: clientJwt
        };
    }
    static async getAllUsers(): Promise<UserAttrs[]> {
        const users = await UserModel.find({});
        return users;
    }
    static async addUser({user, type, status}:{user: UserAttrs, type: UserEnum, status: UserStatusEnum}): Promise<UserDoc>{
        const client = UserModel.build(user);
        client.type = type;
        client.status = status;
        await client.save();
        return client;
    }
}
