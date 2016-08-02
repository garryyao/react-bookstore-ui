import {
  DELETE_CATEGORY,
  EDIT_CATEGORY,
  MOVE_CATEGORY,
  ADD_BOOK,
  OPEN_BOOK,
  DELETE_BOOK,
  EDIT_BOOK,
  MOVE_BOOK,
  TOGGLE_CATEGORY
} from '../constants/ActionTypes'

import {REHYDRATE} from 'redux-persist/constants'
import {combineReducers} from 'redux'

function books(state = [], action) {
  switch (action.type) {
  
  case EDIT_BOOK:
    return state.map(book => book.id === action.id ? {...book, label: action.label} : book);
  
  case DELETE_BOOK:
    return state.filter(book => book.id !== action.id);
  
  default:
    return state
  }
}

function categories(state = [], action) {
  const {book, category, from, to} = action;
  
  switch (action.type) {
  
  case DELETE_CATEGORY:
    return state.filter(category => {
      category.items = category.items.filter(item => item.$ref !== action.id);
      return category.id !== action.id
    });
  
  case EDIT_CATEGORY:
    return state.map(category => category.id === action.id ? {...category, label: action.label} : category);
  
  case MOVE_CATEGORY:
    return state.map(function(each) {
      // move to new category
      if (each.id === to.id) {
        each.items.push({$ref: category.id});
      } else {
        // detach from any parent
        each.items = each.items.filter(function(item) {
          return item.$ref !== category.id;
        });
      }
      return each;
    });
  
  case MOVE_BOOK:
    return state.map(function(each) {
      // move to new category
      if (each.id === to.id) {
        each.items.push({$ref: book.id});
      }
      // detach from the previous parent
      else if (each.id === from.id) {
        each.items = each.items.filter(function(item) {
          return item.$ref !== book.id;
        });
      }
      return each;
    });
    
    // deref removed book from category
  case DELETE_BOOK:
    return state.map(category => {
      const items = category.items.filter(item => item.$ref !== action.id);
      return {...category, ...{items}};
    })
  
  default:
    return state
  }
}

function path(state = [], action) {
  switch (action.type) {
  case OPEN_BOOK:
    return action.path.map(function(category) {
      return {$ref: category.id}
    }).concat({$ref: action.book.id})
    
    // empty book path on book removal
  case DELETE_BOOK:
    return state.findIndex(item => item.$ref === action.id) > -1 ? [] : state;
  
  default:
    return state
  }
}

function nodeStats(state = {}, action) {
  switch (action.type) {
  case TOGGLE_CATEGORY:
    const stats = Object.assign({}, state, {[action.id]: action.state});
    return stats;
  
  default:
    return state
  }
}

const jointReduce = combineReducers({books, categories, path, nodeStats});

export default function defaultReducer(state, action) {
  let {books, categories} = state;
  
  switch (action.type) {
  case ADD_BOOK:
    let book = action.book;
    
    let selectedCategories = book.categories;
    delete book.categories;
    book = {
      // next smallest id generation
      id: books.reduce((maxId, item) => Math.max(parseInt(item.id), maxId), -1) + 1,
      type: 'book',
      label: book.label
    };
    
    books.push(book);
    
    // Create new categories
    selectedCategories = selectedCategories.map(function(category) {
      if (!category.id) {
        category = {
          // next smallest id generation
          id: 'c-' + categories.reduce((maxId, item) => Math.max(+/\d+/.exec(item.id), maxId), -1) + 1,
          label: category.label,
          type: 'category',
          items: []
        };
        categories.push(category);
      }
      
      return category;
    });
    
    // Categorize this new book
    categories.forEach(function(category) {
      const isSelected = selectedCategories.findIndex(function(cate) {
        return cate.id === category.id;
      });
      
      if (isSelected > -1) {
        category.items.push({$ref: book.id});
      }
    });
    
    return {...state, ...{books, categories}};
  
  default:
    return jointReduce(state, action);
  }
}