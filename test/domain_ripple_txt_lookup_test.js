import {AccountDomainVerifier} from '../lib'
import {InvalidDomain, RippleTxtNotFound, ValidationPublicKeyNotFound} from '../lib/errors'
import assert from 'assert'

describe('AccountDomainVerifier', () => {

  it('#getValidationPublicKeyFromDomain(String domain) should query the ripple.txt for validation_public_key', async () => {

    let verifier = new AccountDomainVerifier()
    let domain = 'bitstamp.net'
    const expectedKey = 'n9MG8aiQxrupaCnkvTdLeEN6XGsedSdLd8NnVE9RgfaanPvrspL7'
    
    const validationPublicKey = await verifier.getValidationPublicKeyFromDomain(domain)
    assert.strictEqual(validationPublicKey, expectedKey)
  })

  it('#getValidationPublicKeyFromDomain(String domain) should throw an InvalidDomain error', async () => {

    let verifier = new AccountDomainVerifier()
    let invalidDomain = 'notadomain'

    try {
      let domain = await verifier.getValidationPublicKeyFromDomain(invalidDomain)
    } catch(error) {
      assert(error instanceof InvalidDomain)
      assert.strictEqual(error.message, invalidDomain)
    }
  })

  it('#getValidationPublicKeyFromDomain(String domain) should throw an RippleTxtNotFound error', async () => {

    let verifier = new AccountDomainVerifier()
    let domain = 'mises.org'

    try {
      const validationPublicKey = await verifier.getValidationPublicKeyFromDomain(domain)
    } catch(error) {
      assert(error instanceof RippleTxtNotFound)
      assert.strictEqual(error.message, domain)
    }
  })

  it('#getValidationPublicKeyFromDomain(String domain) should throw an ValidationPublicKeyNotFound error', async () => {

    let verifier = new AccountDomainVerifier()
    let domain = 'bitso.com'

    try {
      const validationPublicKey = await verifier.getValidationPublicKeyFromDomain(domain)
    } catch(error) {
      assert(error instanceof ValidationPublicKeyNotFound)
      assert.strictEqual(error.message, domain)
    }
  })
})

