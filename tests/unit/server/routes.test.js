import { jest, expect, describe, test, beforeEach } from '@jest/globals'
import { handler } from '../../../server/routes'
import TestUtil from '../_util/testUtil'
import config from '../../../server/config'
import { Controller } from '../../../server/controller'

describe('Routes - test switch for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })
  
  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/'

    await handler(...params.values())

    expect(params.response.writeHead).toHaveBeenCalledWith(302, { Location: config.location.home })
    expect(params.response.end).toHaveBeenCalled()
  })
  test('GET /home - should response with home/index.html file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/home'
    const mockFileStream = TestUtil.generateReadableStream()
    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValueOnce({
      stream: mockFileStream
    })
    jest.spyOn(mockFileStream, 'pipe').mockReturnValueOnce()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(config.pages.homeHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
  })
  test('GET /controller - should response with controller/index.html file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/controller'
    const mockFileStream = TestUtil.generateReadableStream()
    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValueOnce({
      stream: mockFileStream
    })
    jest.spyOn(mockFileStream, 'pipe').mockReturnValueOnce()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(config.pages.controllerHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
  })
  test('GET /index.html - should response with file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/index.html'
    const expectedType = '.html'
    const mockFileStream = TestUtil.generateReadableStream()
    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValueOnce({
      stream: mockFileStream,
      type: expectedType
    })
    jest.spyOn(mockFileStream, 'pipe').mockReturnValueOnce()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith('/index.html')
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': config.constants.CONTENT_TYPE[expectedType] })
  })
  test('GET /file.ext - should respond with file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/file.ext'
    const expectedType = '.ext'
    const mockFileStream = TestUtil.generateReadableStream()
    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValueOnce({
      stream: mockFileStream,
      type: expectedType
    })
    jest.spyOn(mockFileStream, 'pipe').mockReturnValueOnce()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith('/file.ext')
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).not.toHaveBeenCalledWith(200, { 'Content-Type': config.constants.CONTENT_TYPE[expectedType] })
  })

  test('GET /unknown - should respond with 404', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/unknown'
    const expectedType = '.ext'

    await handler(...params.values())

    expect(params.response.writeHead).toHaveBeenCalledWith(404)
    expect(params.response.end).toHaveBeenCalled()
  })
  describe('exceptions', () => {
    test('given inexistent file it should response with 404', async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/index.png'
      jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockRejectedValueOnce(new Error('ENOENT'))

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(404)
      expect(params.response.end).toHaveBeenCalled()
    })
    test('given an error it should response with 500', async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/index.png'
      jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockRejectedValueOnce(new Error('any_error'))

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(500)
      expect(params.response.end).toHaveBeenCalled() 
    })
  })
})