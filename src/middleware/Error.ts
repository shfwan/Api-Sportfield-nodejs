import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export const ErrorMiddleware: ErrorHandler = (error, context) => {


    if (error instanceof ZodError) {
        return context.json({ message: error.flatten() }, 400);
    } else if (error instanceof HTTPException) {
        return context.json({ message: error.message }, { status: error.status });
    } else {
        return context.json({ message: error.message }, 500);
    }
}