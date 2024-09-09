import { serve } from '@hono/node-server'
import app from './app/app'

serve({
  fetch: app.fetch,
})
