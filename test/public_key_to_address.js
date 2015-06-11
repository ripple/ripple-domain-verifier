import {Account, Remote} from 'ripple-lib'
import assert from 'assert'

describe('Converting hex-formatted public key to address', () => {

  const rippleAddress = 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'

  it('Converter#publicKeyToAddress() should output and account address', () => {

    let publicKey = '025B32A54BFA33FB781581F49B235C0E2820C929FF41E677ADA5D3E53CFBA46332'
    const address = Account._publicKeyToAddress(publicKey)

    assert.strictEqual(rippleAddress, address)
  })

  it('should retrieve the account root from the network', done => {

    const remote = new Remote({
      servers: [ 'wss://s1.ripple.com:443' ]
    })

    remote.connect(() => {
      const account = new Account(remote, rippleAddress)
      
      account.getInfo((error, info) => {
        done()
      })
    })
  })
})
