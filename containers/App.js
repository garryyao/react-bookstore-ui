import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {persistStore} from 'redux-persist'
import store from '../store'
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import BookShelf from '../components/BookShelf'
import BookInput from '../components/BookInput'
import BookDetails from '../components/BookDetails'
import * as Actions from '../actions'
import deref from '../utils/deref';

class App extends Component {
  static propTypes = {
    categories: PropTypes.array.isRequired,
    books: PropTypes.array.isRequired,
    path: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      synced: false
    };
  }
  
  render() {
    const {categories, actions, path} = this.props;
    const {synced, books=[]} = this.state;

    if(!synced) {
      return <div className="mdl-spinner mdl-js-spinner is-active"></div>;
    }

    return <div className="mdl-chrome">
               <aside className="mdl-aside">
                 <BookInput categories={categories} actions={actions} onSearch={this.handleSearch.bind(this)}/>
                 <BookShelf categories={categories} books={books} path={path} actions={actions}/>
               </aside>
               <main className="mdl-main">
                 <BookDetails path={path} actions={actions}/>
               </main>
             </div>;
  }

  componentWillMount() {
    persistStore(store, {}, () => this.setState({synced: true}));
  }

  componentDidMount() {
    // Upgrade material components in DOM
    window.componentHandler.upgradeAllRegistered();
  }

  handleSearch(critieria) {
    const {books} = this.props;
    this.setState({
      books: critieria? books.filter(function(book) {
      return book.label.indexOf(critieria) > -1;
    }) : []
    });
  }
}

function sortByLabel(list) {
  return list.sort(function(node1, node2) {
    if (node1.type !== node2.type) {
      return node1.type === 'category' ? -1 : 1;
    }
    if (node1.type === node2.type) {
      return node1.label < node2.label ? -1 : 1;
    }
  }).map(function(node) {
    if (node.type === 'category') {
      node.items = sortByLabel(node.items);
    }
    return node;
  });
}

function mapStateToProps(state) {
  let {categories, books, path, nodeStats} = state;
  
  // resolve categories and paths for rendering
  path = deref(path, categories, books);
  let selected;
  if(path.length > 1){
    selected = path.slice(path.length - 2);
  }

  categories = sortByLabel(deref(categories.map(function(node) {
    // mutate category node's collapsed state
    node.expanded = node.id in nodeStats ? nodeStats[node.id] : true;
    return node;
  }), books));

  return {
    categories,
    books,
    path
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  }
}

export default DragDropContext(HTML5Backend)(connect(
  mapStateToProps,
  mapDispatchToProps
)(App))
