import {Promise} from 'bluebird'
import {InvalidRippleAccount, AccountDomainNotFound, InvalidDomain,
  ValidationPublicKeyNotFound, DnsTxtRecordNotFound,
  AccountLookupError} from './errors'
import validator from 'validator'
import RippleTxt from './ripple_txt'
import request from 'request-promise'
import dns from 'dns'
import url from 'url'

import {validateAccountID} from 'ripple-address-codec'
import {nodePublicAccountID} from 'ripple-keypairs'

Promise.promisifyAll(dns);

const defaultURL = 'https://s1.ripple.com:51234';
const dnsTxtRecordField = 'ripple-validator='

export default class ValidatorDomainVerifier {

  constructor(rippledURL) {
    this.rippledURL = rippledURL || defaultURL;
  }

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
    const domainUrl = url.parse('http://'+domain)
    if (!validator.isFQDN(domainUrl.host)) {
      throw new InvalidDomain(domain)
    }
  }

  async getValidationPublicKeysFromDomain(domain) {
    ValidatorDomainVerifier._validateDomain(domain)
    const rippleTxt = await RippleTxt.get(domain)
    return rippleTxt.validation_public_key || []
  }

  async getDomainHexFromAddress(address) {
    console.log(this.rippledURL)
    return request({
      method: 'POST',
      uri: this.rippledURL,
      json: true,
      body: {
        method: 'account_inf',
        params: [{
          account: address
        }]
      }
    }).then((resp) => {
      console.log(resp)
      if (resp.result.status === "error") {
        throw new AccountLookupError(resp.result.error_message)
      } else if (resp.result.account_data.Domain) {
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
      console.log(err)
      throw new AccountLookupError(err.message)
    }
    const domain = ValidatorDomainVerifier._hexToString(domainHex)

    // Legacy: Look for validator public key in ripple.txt
    try {
      const publicKeys = await this.getValidationPublicKeysFromDomain(domain)
      if (publicKeys.indexOf(validationPublicKey)!==-1 ||
        (masterPublicKey && publicKeys.indexOf(masterPublicKey)!==-1)) {
        return domain
      }
    } catch (err) {
      if (err.type!=='RippleTxtNotFound') {
        throw err
      }
    }

    // Look for validator public key in DNS TXT record
    try {
      const txtRecords = await dns.resolveTxtAsync(domain)
      for (let record of txtRecords) {
        for (let chunk of record) {
          if (chunk===dnsTxtRecordField+validationPublicKey ||
            (masterPublicKey && chunk===dnsTxtRecordField+masterPublicKey)) {
            return domain
          }
        }
      }
    } catch (err) {
      throw new DnsTxtRecordNotFound(domain)
    }

    throw new ValidationPublicKeyNotFound(domain)
  }
}
