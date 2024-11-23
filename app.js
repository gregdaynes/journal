import Path from 'path'
import AutoLoad from '@fastify/autoload'

// Pass --options via CLI arguments in command to enable these options.
export const options = {}

export default async function (fastify, opts) {
  // Place here your custom code!
  opts = Object.assign({
    knexConfig: process.env.KNEX_CONFIGURATION
  }, opts)

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: Path.join(import.meta.dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: Path.join(import.meta.dirname, 'routes'),
    options: Object.assign({}, opts),
    routeParams: true,
    autoHooks: true,
    cascadeHooks: true,
  })
}
