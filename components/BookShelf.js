import React, {Component, PropTypes} from 'react'
import {BookNode, CategoryNode} from './BookShelfNode';

export default class AddressBook extends Component {
  static propTypes = {
    categories: PropTypes.array.isRequired,
    books: PropTypes.array.isRequired,
    path: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }
  
  constructor(props, context) {
    super(props, context)
    this.state = {};
  }
  
  render() {
    const {categories, books, actions} = this.props;
    const pathIds = this.props.path.map(item => item.id).join('|');
    const checkSelected = (book, parents) => {
      return parents.concat(book).map(item => item.id).join('|') === pathIds;
    }
  
    const renderSearchResult = (books) => {
      if (!books.length)
        return null;

      const dir = {
        type: 'category',
        label: '搜索结果',
        expanded: true,
      };

      return <div className="mdl-search-result">
        <CategoryNode node={dir} displayOnly>
          {books.map(function(node, i) {
            return <BookNode key={i} node={node} displayOnly></BookNode>;
          })}
        </CategoryNode>
      </div>;
    }

    const guard = node => {
      return !('$ref' in node);
    };

    const renderTree = (list, parents = []) => {
      if (!list.length)
        return null;
  
      return list.filter(guard).map((node, i) => {
        return node.type === 'book' ?
                 <BookNode key={node.id} 
                    node={node} 
                    path={parents}
                    actions={actions}
                    selected={checkSelected(node, parents)}
                    onClick={this.handleItemClick.bind(this)}>
                 </BookNode>
                 :
                 <CategoryNode key={node.id} 
                     node={node} 
                     path={parents} 
                     actions={actions}
                     onDrop={this.handleItemMove.bind(this)}
                     onClick={this.handleItemClick.bind(this)}>
                   {renderTree(node.items, parents.concat(node))}
                 </CategoryNode>;
      });
    }

    return <div className="mdl-tree-pane">
      {renderSearchResult(books)}
      {renderTree(categories) || <div>No books now in the library, add one now.</div>}
    </div>;
  }
  
  handleItemMove({node, from, to}) {
    const {actions} = this.props;
    if (node.type === 'book') {
      actions.moveBook(node, from, to);
    } else {
      actions.moveCategory(node, to);
    }
  }
  
  handleItemClick(node, arg) {
    const {actions} = this.props;
    if (node.type === 'book') {
      actions.openBook(node, arg);
    } else if (node.type === 'category') {
      actions.toggleCategory(node, arg);
    }
  }
}
