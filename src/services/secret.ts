import { SecretStore } from '../utils/config'
import * as E from 'fp-ts/Either'

export class SecretSrv {
  private store: SecretStore

  constructor(store: SecretStore) {
    this.store = store
  }

  public get(key: string): E.Either<Error, string> {
    if (!this.store.has(key)) {
      return E.left(new Error(`Key: ${key.toString()} is not provided`))
    }

    return E.right(this.store.get(key) as string)
  }
}
