import {InvalidRippleAccount, InvalidDomain} from './errors'
import {UInt160, Account, Remote} from 'ripple-lib'
import validator from 'validator'
import RippleTxt from './ripple_txt'

export class AccountDomainVerifier {

  async getDomainForRippleAddress(rippleAddress) {
    this._validateRippleAddress(rippleAddress)
    return 'stevenzeiler.com'
  }

  async getValidationPublicKeyFromDomain(domain) {
    this._validateDomain(domain) 
    const rippleTxt = await RippleTxt.get(domain)
    return rippleTxt.validation_public_key[0]
  }

  async verifyDomainRippleAccount(domain, validationPublicKey) {
    let publicKey = await this.getValidationPublicKeyFromDomain(domain)
    let domainHex = await this.getDomainHexFromAddress(publicKey) 
    assert.strictEqual(this._stringToHex(domain), domainHex)
  }

  async getDomainHexFromAddress(address) {
    return new Promise((resolve, reject) => {
      const remote = new Remote({
        servers: [ 'wss://s1.ripple.com:443' ]
      })
      remote.connect((error) => {
        if (error) { return reject(error) }
        const account = new Account(remote, address)      
        account.getInfo((error, info) => {
          if (error) {
            reject(error)
          } else {
            resolve(info.account_data.Domain)
          }
        })
      })
    })
  }

  _validateRippleAddress(rippleAddress) {
    if (!UInt160.is_valid(rippleAddress)) {
      throw new InvalidRippleAccount(rippleAddress)
    }
  }

  _validateDomain(domain) {
    if (!validator.isFQDN(domain)) {
      throw new InvalidDomain(domain)
    }
  }

  static _stringToHex(string) {
    var s = string.toLowerCase()
    let hex = Array.prototype.map.call(s, function (c) {
      var b = c.charCodeAt(0);

      return b < 16 ? "0" + b.toString(16) : b.toString(16);
    }).join("");
    return hex.toUpperCase()
  }
}
