import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import Sticky from 'react-stickynode'

import AddressPicker from '../../components/AddressPicker'
import CartErrors from './CartErrors'
import CartItems from './CartItems'
import CartHeading from './CartHeading'
import CartTotal from './CartTotal'

class Cart extends Component {

  render() {

    const { items, loading } = this.props

    const panelClasses = ['panel', 'panel-default']

    const btnClasses = ['btn', 'btn-block', 'btn-primary']
    if (items.length === 0 || loading) {
      btnClasses.push('disabled')
    }

    return (
      <Sticky top={ 30 }>
        <div className={ panelClasses.join(' ') }>
          <CartHeading />
          <div className="panel-body">
            <CartErrors />
            <div className="cart">
              <AddressPicker
                address={ '' }
                geohash={ '' }
                onPlaceChange={ () => console.log('onPlaceChange') } />
              <hr />
              <CartItems />
              <hr />
              <CartTotal />
              <hr />
              <button type="submit" className={ btnClasses.join(' ') }>
                <span>{ this.props.loading && <i className="fa fa-spinner fa-spin"></i> }</span>  <span>{ this.props.t('CART_WIDGET_BUTTON') }</span>
              </button>
            </div>
          </div>
        </div>
      </Sticky>
    );
  }
}

function mapStateToProps (state) {
  return {
    items: state.items,
    loading: state.isFetching,
  }
}

export default connect(mapStateToProps)(translate()(Cart))
