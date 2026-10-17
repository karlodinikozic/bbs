import {Prisma} from "../../generated/prisma/client";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

export function isUniqueConstraintError(err: any) {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === UNIQUE_CONSTRAINT_VIOLATION
}