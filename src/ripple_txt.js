import * as RippleVaultClient from 'ripple-vault-client'
import {RippleTxtNotFound, ValidationPublicKeyNotFound} from './errors'

export default class RippleTxt {

  static async get(domain) {

    return new Promise((resolve, reject) => {
      RippleVaultClient.RippleTxt.get(domain, (error, resp) => {
        if (error || Object.keys(resp).length === 0) {
          return reject(new RippleTxtNotFound(domain)) 
        }
        if (!resp.validation_public_key || resp.validation_public_key.length === 0) {
          return reject(new ValidationPublicKeyNotFound(domain))
        }
        resolve(resp)
      })
    })
  }
}
