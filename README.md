** Alpha Unstable Do Not Use! **

## Ripple Validator Domain Verifier

Given a validation public key, verify a two-way reference with a domain

### Installation

`npm install --save ripple-domain-verifier`

### Usage

````
import Verifier from 'ripple-validator-domain-verifier'

(async function() {

  let verifier = new Verifier()

  verifier.verifyValidatorDomain(validationPublicKey).then(domain => {
    console.log('verified domain:', domain)
  })

})()
````
