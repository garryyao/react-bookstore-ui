import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {DragSource, DropTarget} from 'react-dnd';

const Types = {
  Book: 'book',
  Category: 'category'
};

const DragHandler = {
  // Return the data describing the dragged item
  beginDrag(props) {
    const {node, path} = props;
    const category = path[path.length - 1];
    return {node, category};
  }
};

const DropHandler = {
  canDrop(props, monitor) {
    const target = props.node;
    if (!target.items) {
      return false;
    }
    
    const {node} = monitor.getItem();
    
    // check if category is already having this item
    if (target.items.findIndex(function(category) { return category.id === node.id; }) > -1) {
      return false;
    }
    
    // check if source contains target category
    if (node.type === 'category' && contains(node, target)) {
      return false;
    }
    
    // not of the same node
    return node.id !== target.id;
  },
  
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      // If you want, you can check whether some nested
      // target already handled drop
      return;
    }
    
    const {node, category} = monitor.getItem();
    // When dropped on a compatible target, do something
    props.onDrop({node: node, from: category, to: props.node});
  }
};

@DragSource(Types.Book, DragHandler, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@Editable
export class BookNode extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    // list of category path reaches out to this node
    path: PropTypes.array,
    // handle book node clicked
    onClick: PropTypes.func,
    // whether book node is selected
    selected: PropTypes.bool,
    // whether the node is only for display
    displayOnly: PropTypes.bool,
    actions: PropTypes.object,
    // injected props by DnD
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool
  }
  
  constructor(props) {
    super(props);
    this.state = {
      hovering: false,
      editing: false
    };
  }
  
  render() {
    const {node, path, selected, onClick, displayOnly, isDragging, connectDragSource, children} = this.props;
    const {hovering, editing} = this.state;
    const {type, label, items, id} = node;
  
    if (type !== 'book') {
      throw new Error('Expecting node type: "book", unexpected props.node type received: %s');
    }

    let isHovering = hovering && !displayOnly && !isDragging;
    let labelCls = classnames('mdl-tree-node-label', {
      'mdl-tree-node--dragging': isDragging,
    });
    let cls = classnames('mdl-tree-node', 'mdl-treenode-book', {
      'mdl-tree-node--active': selected
    });
    
    let clickFn = typeof onClick === 'function' ? onClick.bind(this, node, path) : function() {};
    let labelEl = editing ? null : <span className={labelCls} onClick={clickFn}>{label}</span>;
    return <div className={cls} onMouseEnter={this.handleHover.bind(this)} onMouseLeave={this.handleHover.bind(this)}>
      <i className="material-icons">book</i>
      {displayOnly ? labelEl : connectDragSource(labelEl)}
      {isHovering ? this.renderToolbar(node) : null}
    </div>;
  }
}

@DragSource(Types.Category, DragHandler, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@DropTarget([Types.Book, Types.Category], DropHandler, (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDropTarget: connect.dropTarget(),
  // You can ask the monitor about the current drag state:
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({shallow: true}),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
@Editable
export class CategoryNode extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    displayOnly: PropTypes.bool,
    actions: PropTypes.object,
    // handle book node clicked
    onClick: PropTypes.func,
    onDrop: PropTypes.func,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
    isOver: PropTypes.bool,
    isOverCurrent: PropTypes.bool
  }
  
  constructor(props) {
    super(props);
    this.state = {};
  }
  
  render() {
    const {node, displayOnly, onClick, isDragging, isOverCurrent, canDrop, connectDragSource, connectDropTarget, children} = this.props;
    const {hovering, editing} = this.state;
    const collapsed = !node.expanded;
    const {type, label, items, id} = node;
    
    if (type !== 'category') {
      throw new Error('Expecting node type: "category", unexpected props.node type received: %s');
    }
  
    let isHovering = hovering && !displayOnly && !isDragging;
    let arrowClassName = 'tree-view_arrow';
    let containerClassName = 'tree-view_children';
    if (collapsed) {
      arrowClassName += ' tree-view_arrow-collapsed';
      containerClassName += ' tree-view_children-collapsed';
    }
    const arrow = <div className={arrowClassName} onClick={this.handleClick.bind(this)}></div>;
    const labelCls = classnames('mdl-tree-node-label', {
      'mdl-tree-node--dragging': isDragging,
      'mdl-tree-node--over': canDrop && isOverCurrent
    });
    
    const labelEl = editing ? null : <span className={labelCls} onClick={this.handleClick.bind(this)}>{label}</span>;
    const el = <div className="mdl-tree-node mdl-treenode-category">
      <div className="tree-view">
        <div className="tree-view_item"
             onMouseEnter={this.handleHover.bind(this)}
             onMouseLeave={this.handleHover.bind(this)}>
          {arrow}
          {displayOnly ? labelEl : connectDragSource(labelEl)}
          {isHovering ? this.renderToolbar(node) : null}
        </div>
        <div className={containerClassName}>
          {collapsed ? null : children}
        </div>
      </div>
    </div>;
    
    return displayOnly ? el : connectDropTarget(el);
  }
  
  handleClick() {
    const collapsed = !this.props.node.expanded;
    if (this.props.onClick) {
      this.props.onClick(this.props.node, collapsed);
    }
  }
}

// Editable BookShelfNode mixin
function Editable(component) {
  Object.assign(component.prototype, {
    renderToolbar(node) {
      const {actions} = this.props;
      const {editing} = this.state;
      
      const handleOpenEditor = () => {
        this.setState({
          editing: true
        });
      };
      
      const handleDelete = () => {
        if (node.type === 'book') {
          actions.deleteBook(node.id);
        } else {
          actions.deleteCategory(node.id);
        }
      };
      
      const handleRename = (label) => {
        if (label) {
          if (node.type === 'book') {
            actions.editBook(node.id, label);
          } else {
            actions.editCategory(node.id, label);
          }
          this.setState({
            editing: false
          });
        }
      };
      
      const handleCancelRename = (e) => {
        if (e.key === 'Escape') {
          this.setState({
            editing: false
          });
        }
      };
      
      return editing ?
               <form action="javascript:void(0)" onSubmit={()=> {handleRename(this.refs.editor.value);}}>
                 <input ref="editor" type="text" className="mdl-tree-node-input" defaultValue={node.label} autoFocus
                        onFocus={(e)=> {e.target.select()}} onKeyDown={handleCancelRename}/>
               </form>
               :
               <div className="mdl-tree-node-toolbar">
                 <button className="mdl-button mdl-js-button mdl-button--icon mdl-button--colored"
                         onClick={handleOpenEditor}>
                   <i className="material-icons">edit</i>
                 </button>
                 <button className="mdl-button mdl-js-button mdl-button--icon mdl-button--colored"
                         onClick={handleDelete}>
                   <i className="material-icons">delete</i>
                 </button>
               </div>;
    },

    handleHover(e) {
      const hovering = e.type === 'mouseenter';
      this.setState({
        hovering: hovering,
        editing: hovering ? this.state.editing : false
      });
    }
  });
  
  return component;
}

function contains(root, node) {
  // check if a category is already having this item
  return (root.items.findIndex(function(item) {
    return item.id === node.id || item.type === 'category' && contains(item, node);
  }) > -1);
}