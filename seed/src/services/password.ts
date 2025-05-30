import bcrypt from 'bcrypt';
export class Password{
    static async toHash(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
    static async compare(input_password: string, stored_password: string): Promise<boolean>{
        return bcrypt.compare(input_password, stored_password);
    }
}