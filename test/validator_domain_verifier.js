import ValidatorDomainVerifier from '../lib'
import {InvalidRippleAccount, InvalidDomain, RippleTxtNotFound, ValidationPublicKeyNotFound} from '../lib/errors'
import assert from 'assert'

describe('ValidatorDomainVerifier', () => {

  describe('getDomainHashFromAddress', () => {

    it('should return a hash of a domain', async () => {

      let verifier = new ValidatorDomainVerifier()
      const address = 'ramcE1KE3gxHc8Yhs6hJtE55CrjkHUQyo'
      const domain = 'ripple.com'

      const domainHex = await verifier.getDomainHexFromAddress(address)
      assert.strictEqual(domain, ValidatorDomainVerifier._hexToString(domainHex))
    })
  })

  describe('getValidationPublicKeysFromDomain', () => {

    it('should return the validation public keys of domain\'s ripple.txt', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'ripple.com'
      const validationPublicKey = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'

      const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(domain)
      assert(validationPublicKeys.indexOf(validationPublicKey)!==-1)
    })

    it('should throw an InvalidDomain error', async () => {

      let verifier = new ValidatorDomainVerifier()
      const invalidDomain = 'notadomain'

      try {
        const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(invalidDomain)
      } catch(error) {
        assert(error instanceof InvalidDomain)
        assert.strictEqual(error.message, invalidDomain)
      }
    })

    it('should throw an RippleTxtNotFound error', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'mises.org'

      try {
        const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(domain)
      } catch(error) {
        assert(error instanceof RippleTxtNotFound)
        assert.strictEqual(error.message, domain)
      }
    })

    it('should throw an ValidationPublicKeyNotFound error', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'bitso.com'

      try {
        const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(domain)
      } catch(error) {
        assert(error instanceof ValidationPublicKeyNotFound)
        assert.strictEqual(error.message, domain)
      }
    })
  })

  describe('verifyValidatorDomain', () => {

    it('should find the validation public key at the account root\'s domain', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'
      const domain = 'ripple.com'

      assert.strictEqual(domain, await verifier.verifyValidatorDomain(validationPublicKey))
    })
  })

  describe('_validateRippleAddress', () => {

    it('should accept a valid ripple address', async () => {

      const address = 'ramcE1KE3gxHc8Yhs6hJtE55CrjkHUQyo'
      ValidatorDomainVerifier._validateRippleAddress(address)
    })

    it('should reject an invalid ripple address', async () => {

      let address = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'
      try {
        ValidatorDomainVerifier._validateRippleAddress(address)
      } catch (error) {
        assert(error instanceof InvalidRippleAccount)
        assert.strictEqual(error.message, address)
      }
    })
  })

  describe('_validateDomain', () => {

    it('should accept a valid domain', async () => {

      const domain = 'ripplelabs.com'
      ValidatorDomainVerifier._validateDomain(domain)
    })

    it('should reject an invalid domain', async () => {

      const domain = 'ripple!!'
      try {
        ValidatorDomainVerifier._validateDomain(domain)
      } catch (error) {
        assert(error instanceof InvalidDomain)
        assert.strictEqual(error.message, domain)
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

