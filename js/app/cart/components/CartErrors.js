import React from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

class CartErrors extends React.Component {

  render() {
    return (
      <div className="cart-wrapper__messages">
        { this.props.errors.map((message, key) => (
          <div key={ key } className="alert alert-warning">{ message }</div>
        )) }
      </div>
    )
  }

}

function mapStateToProps (state) {
  return {
    errors: state.errors,
  }
}

export default connect(mapStateToProps)(translate()(CartErrors))

