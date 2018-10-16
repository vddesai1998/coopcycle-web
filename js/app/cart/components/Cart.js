import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import Sticky from 'react-stickynode'
import _ from 'lodash'

import AddressPicker from '../../components/AddressPicker'
import CartErrors from './CartErrors'
import CartItems from './CartItems'
import CartHeading from './CartHeading'
import CartTotal from './CartTotal'
import DatePicker from './DatePicker'

class Cart extends Component {

  render() {

    const { items, loading } = this.props

    const panelClasses = ['panel', 'panel-default']

    const btnClasses = ['btn', 'btn-block', 'btn-primary']
    if (items.length === 0 || loading) {
      btnClasses.push('disabled')
    }

    console.log(this.props.availabilities);

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
              <DatePicker
                dateInputName={ 'foo' }
                timeInputName={ 'bar' }
                availabilities={ this.props.availabilities }
                value={ _.first(this.props.availabilities) }
                onChange={ () => console.log('onDateChange') } />
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
    availabilities: state.availabilities,
  }
}

export default connect(mapStateToProps)(translate()(Cart))
