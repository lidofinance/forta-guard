import { NextFunction, Request, Response } from 'express'
import { verifyJwt } from 'forta-agent'

export class FortaTokenMiddleware {
  private readonly validateJWT: boolean

  constructor(validateJWT: boolean) {
    this.validateJWT = validateJWT
  }

  public verifyToken() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' })
      }

      try {
        if (!this.validateJWT) {
          next()
          return
        }

        const decoded = await verifyJwt(token)
        if (decoded) {
          next()
          return
        }

        return res.status(401).send({ message: 'Unauthorized: Token verification failed' })
      } catch (error) {
        return res.status(401).send({ message: 'Unauthorized: Invalid token' })
      }
    }
  }
}
