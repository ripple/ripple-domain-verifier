## Ripple Validator Domain Verifier

Given a domain, verify a two-way reference with a validator key.

### Installation

`npm install --save ripple-domain-verifier`

### Usage

````
const verifier = require('ripple-domain-verifier')

verifier.verifyValidatorDomain(domain).then(validatorKeys => {
  console.log('verified validator keys:', validatorKeys)
})
````

getValidatorKey(domain) - check dns txt record and ripple.txt
getDomainSignature(domain) - check dns txt record
verifyDomainSignature(valPubKey, domain, sig) - 