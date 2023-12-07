import { Request, Response } from 'express'
import { SecretSrv } from '../services/secret'
import * as E from 'fp-ts/Either'

export class SecretHlr {
  private readonly secretSrv: SecretSrv

  constructor(secretSrv: SecretSrv) {
    this.secretSrv = secretSrv
  }

  public getSecret(req: Request, res: Response): void {
    if (req.params.urlKey === null) {
      res.status(400).send('Mandatory field: urlKey is missing')
      return
    }

    const rpcUrl = this.secretSrv.get(req.params.urlKey)
    if (E.isLeft(rpcUrl)) {
      res.status(404).send(`${req.params.urlKey} is not found`)
      return
    }

    res.send(rpcUrl.right)
  }
}
