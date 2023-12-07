import { NextFunction, Request, Response } from 'express'

export async function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url

  // Log request information
  console.log(`[${timestamp}] ${method} ${url}`)

  // Continue to the next middleware
  next()
}
