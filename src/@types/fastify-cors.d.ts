declare module 'fastify-cors' {
    import { FastifyPlugin } from 'fastify'
  
    interface FastifyCorsOptions {
      origin?: string | boolean | RegExp | (string | RegExp)[] | ((origin: string, cb: (err: Error | null, allow?: boolean) => void) => void)
      methods?: string | string[]
      allowedHeaders?: string | string[]
      exposedHeaders?: string | string[]
      credentials?: boolean
      maxAge?: number
      preflightContinue?: boolean
      optionsSuccessStatus?: number
      preflight?: boolean
      strictPreflight?: boolean
      hideOptionsRoute?: boolean
    }
  
    const fastifyCors: FastifyPlugin<FastifyCorsOptions>
    export default fastifyCors
  } 
  