import dotenv from 'dotenv'
import * as E from 'fp-ts/Either'

type secretKey = string
type rpcUrl = string
export type SecretStore = Map<secretKey, rpcUrl>

export const mantleUrlLabel: string = 'mantleUrl'

export type Config = {
  nodeEnv: string
  port: number
  appName: string
  metricPrefix: string
  store: SecretStore
}

export function getConfig(): E.Either<Error, Config> {
  if (typeof process.env.PORT === 'undefined') {
    const configResult = dotenv.config()

    if (configResult.error) {
      return E.left(new Error(`Error loading .env file: cause: ${configResult.error}`))
    }
  }

  const store = new Map<secretKey, rpcUrl>()

  if (process.env.MANTLE_URL === '') {
    return E.left(new Error(`Env does not provider mantleUrl`))
  }

  store.set(mantleUrlLabel, process.env.MANTLE_URL as unknown as string)

  const out: Config = {
    nodeEnv: process.env.NODE_ENV as string,
    port: process.env.PORT as unknown as number,
    appName: process.env.APP_NAME as unknown as string,
    metricPrefix: (process.env.APP_NAME as unknown as string).replace(/-| /g, '_') + '_',
    store: store,
  }

  return E.right(out)
}
