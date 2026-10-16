import type { Request, Response } from "express";

type Params = Record<string,string>

export type  RequestWithBody<TBody> = Request<Params, unknown, TBody>
export type  RequestWithParams<TParams extends  Params> = Request<TParams>
export type  RequestWithQuery<TQuery> = Request<Params, unknown, unknown, TQuery>

export type  ResponseWithBody<TBody> = Response<TBody>