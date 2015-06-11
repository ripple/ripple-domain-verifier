** Alpha Unstable Do Not Use! **

## Ripple Account Domain Verifier

Given a domain and a validation public key, verify a two-way reference

### Installation

`npm install --save ripple-account-domain-verifier`

### Usage

````
import Verifier from 'ripple-account-domain-verifier'

(async function() {

  let verifier = new Verifier()

  let verified = await verifier.verifyDomainRippleAccount(domain, validationPublicKey)

  assert(verified)

})()
````

