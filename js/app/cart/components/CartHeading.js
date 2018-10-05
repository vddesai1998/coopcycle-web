import React from 'react'
import { translate } from 'react-i18next'

class CartHeading extends React.Component {

  render() {
    // const { toggled, initialized } = this.state

    const headingClasses = ['panel-heading', 'cart-heading']
    // if (warningAlerts.length > 0 || dangerAlerts.length > 0) {
    //   headingClasses.push('cart-heading--warning')
    // }

    // if (initialized && warningAlerts.length === 0 && dangerAlerts.length === 0) {
    //   headingClasses.push('cart-heading--success')
    // }

    return (
      <div className={ headingClasses.join(' ') }>
        <span className="cart-heading--title">{ this.props.t('CART_TITLE') }</span>
      </div>
    )
  }

}

export default translate()(CartHeading)
