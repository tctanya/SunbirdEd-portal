/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

let envVariables = require('../../environmentVariablesHelper.js')
let httpWrapper = require('./httpWrapper.js')
let HttpStatus = require('http-status-codes')
const _ = require('lodash')
let AppError = require('./ErrorInterface.js')

/**
 * Class which privides a services for dataService calls
 */
class DataService {
    /**
     * Caller of the constructor as follows
     * Eg: let dataServiceInstance = new DataService({endPoint:'data/v1/notification/audience', service:httpServiceInst, token:'someToken'})
     */
  constructor ({service } = {}) {
    /**
     * @param {Class}  - Which is used to invoke a http service call, Default it's making httpService call
     */
    this.service = service || httpService
  }

    /**
     * Which is used ge the sentCount details
     * @param  {Array} locationIds  - List of location identifiers ex: ['32432','43423']
     * @return {Int}                - Which returns sum of userCount
     */
  getAudience (locationIds, token) {
    return new Promise((resolve, reject) => {
      const DEFAULT_ENDPOINT = 'data/v1/notification/audience'
      let options = {
        method: 'POST',
        uri: envVariables.DATASERVICE_URL + DEFAULT_ENDPOINT,
        headers: this.service.getRequestHeader(token),
        body: {
          'request': {
            'locationIds': locationIds,
            'userListReq': false,
            'estimatedCountReq': false
          }
        },
        json: true
      }
      this.service.call(options).then((data) => {
        let locations = _.get(data, 'body.result.locations')
        resolve(_.sumBy(locations, 'userCount'))
      }).catch((error) => {
        reject(new AppError({
          message: 'Unable to get the sent count',
          status: HttpStatus.INTERNAL_SERVER_ERROR
        }))
      })
    })
  }

  /**
   * Which is used to get the geo location
   * @param  {Array} orgIds  - List of org identifiers
   * @return {Object}        - Which returns the org details.
   */
  getGeoLocations (orgIds) {
    return new Promise((resolve, reject) => {
      try {
        const DEFAULT_ENDPOINT = 'org/v1/search'
        let requestObj = {
          'filters': {
            'id': orgIds
          },
          'fields': ['id', 'locationId']
        }

        let options = {
          'method': 'POST',
          'uri': envVariables.DATASERVICE_URL + DEFAULT_ENDPOINT,
          'body': {
            'request': requestObj
          },
          'json': true
        }
        options.headers = this.service.getRequestHeader(token)
        let data = new Promise((resolve, reject) => {
          this.service.call(options).then((data) => {
            resolve(data.body.result.response)
          }).catch((error) => {
            reject(error)
          })
        })
        resolve(data)
      } catch (error) {
        throw error
      }
    })
  }
}
module.exports = DataService
