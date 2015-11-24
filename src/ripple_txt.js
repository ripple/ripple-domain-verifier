import * as RippleVaultClient from 'ripple-vault-client'
import {RippleTxtNotFound} from './errors'

export default class RippleTxt {

  static async get(domain) {

    return new Promise((resolve, reject) => {
      RippleVaultClient.RippleTxt.get(domain, (error, resp) => {
        if (error || Object.keys(resp).length === 0) {
          return reject(new RippleTxtNotFound(domain)) 
        }
        resolve(resp)
      })
    })
  }
}
