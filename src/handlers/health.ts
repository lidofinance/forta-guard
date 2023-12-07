import { Request, Response } from 'express'
import { Gauge } from 'prom-client'

type HealthResponse = {
  status: string
}

export class HealthHandler {
  private healtGauge: Gauge

  constructor(healtGauge: Gauge) {
    this.healtGauge = healtGauge
  }

  public health(_req: Request, res: Response): void {
    const out: HealthResponse = {
      status: 'ok',
    }

    this.healtGauge.set(1)

    res.json(out)
  }
}
