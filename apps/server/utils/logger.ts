import pino from "pino"
import dotenv from "dotenv"
dotenv.config()

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  })
})

export default logger 