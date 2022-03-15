import { logger } from "./util.js"
import config from './config.js'
import { Controller } from './controller.js'

const controller = new Controller()

async function routes(request, response) {
  const { method, url } = request

  if (method === 'GET' && url === '/') {
    response.writeHead(302, {
      'Location': config.location.home
    })

    return response.end()
  }

  if (method === 'GET' && url === '/home') {
    const { stream } = await controller.getFileStream(config.pages.homeHTML)
    return stream.pipe(response)
  }
}

export function handler(request, response) {
  return routes(request, response)
    .catch(error => logger.error(`Deu ruim ${error.stack}`))
}
