import RippleTxt from '../src/ripple_txt.js'
import {InvalidRippleAccount, InvalidDomain, RippleTxtNotFound, ValidationPublicKeyNotFound} from '../src/errors'
import assert from 'assert'

describe('RippleTxt', () => {

  describe('get', () => {

    it('should return the validation public keys of domain\'s ripple.txt', async () => {

      const domain = 'ripple.com'
      const validationPublicKey = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'

      const rippleTxt = await RippleTxt.get(domain)
      assert(rippleTxt.validation_public_key.indexOf(validationPublicKey)!==-1)
    })

    it('should throw a RippleTxtNotFound error', async () => {

      const domain = 'stellar.org'

      try {
        const rippleTxt = await RippleTxt.get(domain)
      } catch (error) {
        assert(error instanceof RippleTxtNotFound)
        assert.strictEqual(error.message, domain)
      }
    })

    it('should throw a ValidationPublicKeyNotFound error', async () => {

      const domain = 'bitso.com'

      try {
        const rippleTxt = await RippleTxt.get(domain)
      } catch(error) {
        assert(error instanceof ValidationPublicKeyNotFound)
        assert.strictEqual(error.message, domain)
      }
    })
  })
})

