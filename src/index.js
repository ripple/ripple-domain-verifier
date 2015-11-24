import {InvalidRippleAccount, AccountDomainNotFound, InvalidDomain, ValidationPublicKeyNotFound} from './errors'
import {Account, Remote} from 'ripple-lib'
import validator from 'validator'
import RippleTxt from './ripple_txt'

import {validateAccountID} from 'ripple-address-codec';
import {nodePublicAccountID} from 'ripple-keypairs';

export default class ValidatorDomainVerifier {

  static _hexToString(hex) {
    let str = ''
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  static _validateRippleAddress(rippleAddress) {
    if (!validateAccountID(rippleAddress)) {
      throw new InvalidRippleAccount(rippleAddress)
    }
  }

  static _validateDomain(domain) {
    if (!validator.isFQDN(domain)) {
      throw new InvalidDomain(domain)
    }
  }

  async getValidationPublicKeysFromDomain(domain) {
    ValidatorDomainVerifier._validateDomain(domain)
    const rippleTxt = await RippleTxt.get(domain)
    if (!rippleTxt.validation_public_key || rippleTxt.validation_public_key.length === 0) {
      throw new ValidationPublicKeyNotFound(domain)
    }
    return rippleTxt.validation_public_key
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
          remote.disconnect()
          if (error) {
            reject(error)
          } else if (!info.account_data.Domain) {
            reject(new AccountDomainNotFound(address))
          } else {
            resolve(info.account_data.Domain)
          }
        })
      })
    })
  }

  async verifyValidatorDomain(validationPublicKey) {
    const account_id = nodePublicAccountID(validationPublicKey);
    ValidatorDomainVerifier._validateRippleAddress(account_id)
    let domainHex
    try {
      domainHex = await this.getDomainHexFromAddress(account_id)
    } catch (err) {
      throw new AccountDomainNotFound(account_id)
    }
    const domain = ValidatorDomainVerifier._hexToString(domainHex)
    const publicKeys = await this.getValidationPublicKeysFromDomain(domain)
    if (publicKeys.indexOf(validationPublicKey)===-1) {
      throw new ValidationPublicKeyNotFound(domain)
    }
    return domain
  }
}