
export class InvalidRippleAccount extends Error {

  constructor(address) {
    super()
    this.message = address
    this.type = 'InvalidRippleAccount'
  }
}

export class AccountDomainNotFound extends Error {

  constructor(address) {
    super()
    this.message = address
    this.type = 'AccountDomainNotFound'
  }
}

export class InvalidDomain extends Error {

  constructor(domain) {
    super()
    this.message = domain
    this.type = 'InvalidDomain'
  }
}

export class RippleTxtNotFound extends Error {

  constructor(domain) {
    super()
    this.message = domain
    this.type = 'RippleTxtNotFound'
  }
}

export class ValidationPublicKeyNotFound extends Error {

  constructor(domain) {
    super()
    this.message = domain
    this.type = 'ValidationPublicKeyNotFound'
  }
}

export class DnsTxtRecordNotFound extends Error {

  constructor(domain) {
    super()
    this.message = domain
    this.type = 'DnsTxtRecordNotFound'
  }
}

export class AccountLookupError extends Error {

  constructor(error) {
    super()
    this.message = error
    this.type = 'AccountLookupError'
  }
}
