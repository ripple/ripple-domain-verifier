import {InvalidRippleAccount, AccountDomainNotFound, InvalidDomain, ValidationPublicKeyNotFound} from './errors'
import validator from 'validator'
import RippleTxt from './ripple_txt'
import request from 'request-promise'

import {validateAccountID} from 'ripple-address-codec'
import {nodePublicAccountID} from 'ripple-keypairs'

const rippledURL = 'https://s1.ripple.com:51234';


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
    return rippleTxt.validation_public_key
  }

  async getDomainHexFromAddress(address) {
    return request({
      method: 'POST',
      uri: rippledURL,
      json: true,
      body: {
        method: 'account_info',
        params: [{
          account: address
        }]
      }
    }).then((resp) => {
      if (resp.result.account_data.Domain) {
        return resp.result.account_data.Domain;
      } else {
        throw new AccountDomainNotFound(address);
      }
    });
  }

  async verifyValidatorDomain(validationPublicKey, masterPublicKey) {
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
    if (publicKeys.indexOf(validationPublicKey)===-1 &&
        (!masterPublicKey || publicKeys.indexOf(masterPublicKey)===-1)) {
      throw new ValidationPublicKeyNotFound(domain)
    }
    return domain
  }
}
