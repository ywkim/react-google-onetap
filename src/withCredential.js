/* global google */
import _ from "lodash"
import warning from "warning"
import invariant from "invariant"
import { getDisplayName } from "recompose"
import PropTypes from "prop-types"
import React from "react"

import { CREDENTIAL } from "./constants"

export function withCredential(BaseComponent) {
  const factory = React.createFactory(BaseComponent)

  class Container extends React.PureComponent {
    static displayName = `withCredential(${getDisplayName(BaseComponent)})`

    static contextTypes = {
      [CREDENTIAL]: PropTypes.object,
    }

    render() {
      const credential = this.context[CREDENTIAL];

      if (credential) {
        return factory({credential})
      } else {
        return factory({})
      }
    }
  }

  return Container
}

export default withCredential
