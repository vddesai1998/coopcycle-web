import React from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import CartItem from './CartItem'

class CartTotal extends React.Component {

  render() {

    const { total, itemsTotal } = this.props

    // TODO Render adjustments

    if (itemsTotal > 0) {
      return (
        <div>
          <div>
            <span>{ this.props.t('CART_TOTAL_PRODUCTS') }</span>
            <strong className="pull-right">{ (itemsTotal / 100).formatMoney(2, window.AppData.currencySymbol) }</strong>
          </div>
          <div>
            <span>{ this.props.t('CART_TOTAL') }</span>
            <strong className="pull-right">{ (total / 100).formatMoney(2, window.AppData.currencySymbol) }</strong>
          </div>
        </div>
      )
    }

    return (
      <div></div>
    )
  }

}

function mapStateToProps (state) {
  return {
    itemsTotal: state.itemsTotal,
    total: state.total,
  }
}

export default connect(mapStateToProps)(translate()(CartTotal))
