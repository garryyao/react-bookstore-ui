import React, {Component, PropTypes} from 'react'

export default class BookDetails extends Component {
  static propTypes = {
    path: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }
  
  constructor(props) {
    super(props)
    this.state = {}
  }
  
  render() {
    const {path} = this.props;
    const lastIndex = path.length - 1;
    return <ul className="mdl-breadcrumb">{path.map(function(node, i) {
      return i === lastIndex ?
               <li key={i} className="mdl-breadcrumb-item mdl-breadcrumb-item--active">{node.label}</li> :
               <li key={i} className="mdl-breadcrumb-item"><a href="javascript:void(0)">{node.label}</a></li>;
    })}
    </ul>
  }
}
