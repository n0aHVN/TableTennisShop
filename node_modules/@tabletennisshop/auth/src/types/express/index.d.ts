/**
 * tsconfig.json
 * {
  "compilerOptions": {
    "typeRoots": ["./src/types", "./node_modules/@types"],
    "baseUrl": "./src"
  }
} */

import { UserPayload } from "./UserPayload";

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}