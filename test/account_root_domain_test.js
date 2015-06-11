import {AccountDomainVerifier} from '../lib'
import {InvalidDomain, RippleTxtNotFound, ValidationPublicKeyNotFound} from '../lib/errors'
import assert from 'assert'

describe('AccountDomainVerifier', () => {

  it('#getDomainHashFromAddress(String rippleAddress) should return a hash of a domain', async () => {

    let verifier = new AccountDomainVerifier()
    let address = 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
    let domain = 'bitstamp.net'

    const domainHex = await verifier.getDomainHexFromAddress(address)
    assert.strictEqual(AccountDomainVerifier._stringToHex(domain), domainHex)
  })
})

