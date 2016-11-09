import ValidatorDomainVerifier from '../src'
import {InvalidRippleAccount, AccountDomainNotFound, InvalidDomain,
        RippleTxtNotFound, ValidationPublicKeyNotFound, DnsTxtRecordNotFound
       } from '../src/errors'
import assert from 'assert'

describe('ValidatorDomainVerifier', () => {

  describe('getDomainHashFromAddress', () => {

    it('should return a hash of a domain', async () => {

      let verifier = new ValidatorDomainVerifier()
      const address = 'ramcE1KE3gxHc8Yhs6hJtE55CrjkHUQyo'
      const domain = 'ripple.com'

      const domainHex = await verifier.getDomainHexFromAddress(address)
      const decodedDomain = ValidatorDomainVerifier._hexToString(domainHex)
      assert.strictEqual(domain, decodedDomain)
    })
  })

  describe('getValidationPublicKeysFromDomain', () => {

    it('should return the validation public keys of domain\'s ripple.txt', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'ripple.com'
      const validationPublicKey =
        'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'

      const validationPublicKeys =
        await verifier.getValidationPublicKeysFromDomain(domain)
      assert(validationPublicKeys.indexOf(validationPublicKey)!==-1)
    })

    it('should throw an InvalidDomain error', async (done) => {

      let verifier = new ValidatorDomainVerifier()
      const invalidDomain = 'notadomain'

      try {
        await verifier.getValidationPublicKeysFromDomain(invalidDomain)
      } catch(error) {
        assert(error instanceof InvalidDomain)
        assert.strictEqual(error.message, invalidDomain)
        done()
      }
    })

    it('should allow domain with url', async () => {

      let verifier = new ValidatorDomainVerifier()
      const invalidDomain = 'mises.org/library'

      const validationPublicKeys =
        await verifier.getValidationPublicKeysFromDomain(invalidDomain)
      assert.strictEqual(validationPublicKeys.length, 0)
    })

    it('should throw a RippleTxtNotFound error', async (done) => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'mises.org'

      try {
        await verifier.getValidationPublicKeysFromDomain(domain)
      } catch(error) {
        assert(error instanceof RippleTxtNotFound)
        assert.strictEqual(error.message, domain)
        done()
      }
    }).timeout(20000);

    it('should return an empty array if ripple.txt does not include validator', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'bitso.com'

      const validationPublicKeys =
        await verifier.getValidationPublicKeysFromDomain(domain)
      assert.strictEqual(validationPublicKeys.length, 0)
    })
  })

  describe('verifyValidatorDomain', () => {

    it('should find the validation public key at the account root domain\'s ripple.txt', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey =
        'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'
      const domain = 'ripple.com'

      const verifiedDomain =
        await verifier.verifyValidatorDomain(validationPublicKey)
      assert.strictEqual(domain, verifiedDomain)    })

    it('should find the master validation public key at the ephemeral key\'s account root domain\'s ripple.txt', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey =
        'n9LYyd8eUVd54NQQWPAJRFPM1bghJjaf1rkdji2haF4zVjeAPjT2'
      const masterPublicKey =
        'nHUkAWDR4cB8AgPg7VXMX6et8xRTQb2KJfgv1aBEXozwrawRKgMB'
      const domain = 'testnet.ripple.com'

      const verifiedDomain = await verifier.verifyValidatorDomain(
        validationPublicKey, masterPublicKey)
      assert.strictEqual(domain, verifiedDomain)
    })

    it('should find the validation public key in the account root domain\'s DNS records', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey =
        'n9MRhKUt2NBDUn37EXrUBXk68MaeCdX58ts3rJabZrcw8HTUCLMr'
      const domain = 'altnet.rippletest.net'

      const verifiedDomain =
        await verifier.verifyValidatorDomain(validationPublicKey)
      assert.strictEqual(domain, verifiedDomain)
    })

    it('should find the master validation public key in the ephemeral key\'s account root domain\'s DNS records', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey =
        'n9M23ZN71yzz3CMNVRgcoMUegW6bk5SpPtaiv7Sv2Qb64CtYEWEP'
      const masterPublicKey =
        'nHU2Z8qQXstanWyrV1nMFfcpjUCCg9eycG4npPhNvjeCvKYmtaRD'
      const domain = 'altnet.rippletest.net'

      const verifiedDomain = await verifier.verifyValidatorDomain(
        validationPublicKey, masterPublicKey)
      assert.strictEqual(domain, verifiedDomain)
    })

    it('should return an AccountDomainNotFound error for missing account domain', async (done) => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey =
        'n9KwwpYCU3ctereLW9S48fKjK4rcsvYbHmjgiRXkgWReQR9nDjCw'

      try {
        await verifier.verifyValidatorDomain(validationPublicKey)
      } catch(error) {
        assert(error instanceof AccountDomainNotFound)
        done()
      }
    })

    it('should return a DnsTxtRecordNotFound error for DNS TXT record not found', async (done) => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey =
        'n9M5c2zrxqEX6vBvAVNjR5iSe2AvCpDq6EoqFv5UBS6H9oN6Hatp'
      try {
        await verifier.verifyValidatorDomain(validationPublicKey)
      } catch(error) {
        assert(error instanceof DnsTxtRecordNotFound)
        done()
      }
    })

    it('should return a ValidationPublicKeyNotFound error for validation public not found', async (done) => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey =
        'n9KSFuD5s7jWvcsLEbKJv37kDX57RRR3wf3kS2ra8zedhMW27cN1'
      try {
        await verifier.verifyValidatorDomain(validationPublicKey)
      } catch(error) {
        assert(error instanceof ValidationPublicKeyNotFound)
        done()
      }
    })
  })

  describe('_validateRippleAddress', () => {

    it('should accept a valid ripple address', async () => {

      const address = 'ramcE1KE3gxHc8Yhs6hJtE55CrjkHUQyo'
      ValidatorDomainVerifier._validateRippleAddress(address)
    })

    it('should reject an invalid ripple address', async (done) => {

      let address = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'
      try {
        ValidatorDomainVerifier._validateRippleAddress(address)
      } catch (error) {
        assert(error instanceof InvalidRippleAccount)
        assert.strictEqual(error.message, address)
        done()
      }
    })
  })

  describe('_validateDomain', () => {

    it('should accept a valid domain', async () => {

      const domain = 'ripplelabs.com'
      ValidatorDomainVerifier._validateDomain(domain)
    })

    it('should reject an invalid domain', async (done) => {

      const domain = 'ripple!!'
      try {
        ValidatorDomainVerifier._validateDomain(domain)
      } catch (error) {
        assert(error instanceof InvalidDomain)
        assert.strictEqual(error.message, domain)
        done()
      }
    })
  })

  describe('_hexToString', () => {

    it('convert hex to ascii string', async () => {
      const hex = '726970706C652E636F6D'
      const str = 'ripple.com'
      assert.strictEqual(str, ValidatorDomainVerifier._hexToString(hex))
    })
  })
})

