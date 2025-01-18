import { config } from 'dotenv'
import { resolve } from 'path'

// Load the .env.test file for testing
config({
  path: resolve(__dirname, '../.env.test')
}) 