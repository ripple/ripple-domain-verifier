import {AccountDomainVerifier} from '../lib'
import {InvalidRippleAccount} from '../lib/errors'
import assert from 'assert'

describe('AccountDomainVerifier', () => {

  it('#verifyDomainRippleAccount(Account account) should query the account root for a domain', async () => {

    const verifier = new AccountDomainVerifier()
    const validationPublicKey = 'n9MG8aiQxrupaCnkvTdLeEN6XGsedSdLd8NnVE9RgfaanPvrspL7'
    const domain = 'bitstamp.net'
    
    let verified = await verifier.verifyDomainRippleAccount(domain, validationPublicKey)
    assert(verified)
  })
})

