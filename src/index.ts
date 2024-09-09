import { serve } from '@hono/node-server'
import app from './app/app'

import * as dotenv from 'dotenv'
dotenv.config()

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
