// https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#introduction
import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

beforeEach(() => {
    mockReset(prisma);
});

export const prisma = mockDeep<PrismaClient>();
