import { NotFoundHandler } from "hono";

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      error: "not_found",
      message: `${c.req.method} ${c.req.path} Not found`,
      status: 404,
    },
    404,
  );
};
