import {Promise} from 'bluebird'
import {InvalidRippleAccount, AccountDomainNotFound, InvalidDomain,
  ValidationPublicKeyNotFound, DnsTxtRecordNotFound} from './errors'
import validator from 'validator'
import RippleTxt from './ripple_txt'
import request from 'request-promise'
import dns from 'dns'
import url from 'url'

import {decodeNodePublic} from 'ripple-address-codec'
import {verify} from 'ripple-keypairs'

Promise.promisifyAll(dns);

const dnsTxtPubKey = 'ripple-validator='
const dnsTxtSig = 'ripple-domain-signature='

function validateDomain(domain) {
  const domainUrl = url.parse('http://'+domain)
  if (!validator.isFQDN(domainUrl.host)) {
    throw new InvalidDomain(domain)
  }
  return domainUrl.host
}

async function getValidationPublicKeysFromDomain(domain) {
  validateDomain(domain)
  console.log(domain)
  const rippleTxt = await RippleTxt.get(domain)
  return rippleTxt.validation_public_key || []
}

function bytesToHex(a) {
  return a.map(function(byteValue) {
    const hex = byteValue.toString(16).toUpperCase();
    return hex.length > 1 ? hex : '0' + hex;
  }).join('');
}

async function getDnsTxtRecord(domain, prefix) {
  const host = validateDomain(domain)
console.log(host)
  try {
    const txtRecords = await dns.resolveTxtAsync(host)
    let res = []

    for (let record of txtRecords) {
      for (let chunk of record) {
        if (chunk.indexOf(prefix) === 0) {
          res.push(chunk.slice(prefix.length))
        }
      }
    }

    return res
  } catch (err) {
    return []
  }
}

async function getValidatorKeys(domain) {
  const keys = await getDnsTxtRecord(domain, dnsTxtPubKey)
  keys.push.apply(keys, await getValidationPublicKeysFromDomain(domain))

  return keys
}

async function getDomainSignatures(domain) {
  return await getDnsTxtRecord(domain, dnsTxtSig)
}

function verifyDomainSignature(domain, signature, validatorPublicKey) {
  try {
    return verify(
      new Buffer(domain, 'ascii').toString('hex'),
      signature,
      bytesToHex(decodeNodePublic(validatorPublicKey)))    
  } catch (err) {
    return false
  }
}

module.exports = {
  getValidatorKeys,
  getDomainSignatures,
  verifyDomainSignature
}
