import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'

const ESC = 'Escape';

export default class BookInput extends Component {
  static propTypes = {
    categories: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      searchText: '',
      bookName: '',
      showBookNameValidity: false,
      showCategoryValidity: false,
      selectedCategories: [],
      categoryResults: []
    };
  }
  
  render() {
    const {
      searchText,
      bookName,
      categoryResults = [],
      selectedCategories = [],
      showCategoryValidity,
      showBookNameValidity
    } = this.state;
    const isCategoryInvalid = showCategoryValidity && !selectedCategories.length;
    const isBookNameInvalid = showBookNameValidity && !bookName;

    return (
      <div>
        <form className="mdl-form-toolbox" action="javascript:void(0)">
          <div className="mdl-textfield mdl-js-textfield mdl-textfield-search">
            <label className="md-button mdl-js-button mdl-button-icon" htmlFor="search">
              <i className="material-icons">search</i>
            </label>
            <div className="mdl-textfield__inline-holder">
              <input ref="search" id="search" className="mdl-textfield__input mdl-textfield__input"
                     type="text" onChange={this.handleSearch.bind(this)} value={searchText}
                     onKeyUp={this.handleSearchKeyUp.bind(this)}/>
              <label className="mdl-textfield__label" htmlFor="search">搜索书名...</label>
            </div>
          </div>
          <div className="mdl-dialog__actions">
            <button type="submit" className="mdl-button mdl-js-button mdl-js-ripple-effect"
                    onClick={this.handleDialogOpen.bind(this)}>添加
            </button>
          </div>
        </form>
        <dialog ref="dialog" className="mdl-dialog mdl-dialog--addbook">
          <form action="javascript:void(0)" onSubmit={this.handleDialogSave.bind(this)}
                onKeyDown={this.handleDialogClose.bind(this)}>
            <h4 className="mdl-dialog__title">添加图书</h4>
            <div className="mdl-dialog__content">
              <div
                className={classnames("mdl-textfield mdl-js-textfield mdl-textfield--floating-label", {'is-invalid': isBookNameInvalid})}>
                <input ref="bookname" className="mdl-textfield__input" type="text" id="bookname" value={bookName}
                       onChange={this.handleBookNameInput.bind(this)}/>
                <label className="mdl-textfield__label" htmlFor="bookname">书名...</label>
                <span className="mdl-textfield__error">必须输入书名</span>
              </div>
              <br />
              <br />
              <div
                className={classnames("mdl-textfield mdl-js-textfield mdl-textfield--floating-label", {'is-invalid': isCategoryInvalid})}>
                <input ref="category" className="mdl-textfield__input" type="text" id="category"
                       onChange={this.handleCategoryInput.bind(this)}/>
                <label className="mdl-textfield__label" htmlFor="category">目录..</label>
                <label className="mdl-button mdl-js-button mdl-button--icon md-button-icon--top-right"
                       onClick={this.handleAddNewCategory.bind(this)}>
                  <i className="material-icons">add</i>
                </label>
                <span className="mdl-textfield__error">至少添加一个目录</span>
                <div className={classnames('mdl-menu__container', {'is-visible': categoryResults.length})}>
                  <div className="mdl-menu__outline">
                    <ul className="mdl-menu">
                      {categoryResults.map(category => {
                        return <li className="mdl-menu__item" key={category.id}
                                   onClick={this.handleSelectCategory.bind(this, category)}>
                          {category.displayLabel}
                        </li>;
                      })}
                    </ul>
                  </div>
                </div>
              </div>
              {
                selectedCategories.length ?
                  <div className="mdl-menu__container mdl-menu__container--inline is-visible">
                    <ul className="mdl-menu">
                      {selectedCategories.map(category => {
                        return <li className="mdl-menu__item" key={[category.id, category.label].join('|')}>
                        <span className="mdl-list__item-primary-content">{category.label}
                        </span>
                          <i className="material-icons mdl-list__item-icon"
                             onClick={this.handleRemoveCategory.bind(this, category)}>clear</i>
                        </li>;
                      })}
                    </ul>
                  </div> : null
              }
            </div>
            <div className="mdl-dialog__actions">
              <button type="button" type="submit" className="mdl-button">保存</button>
              <button type="button" className="mdl-button close" onClick={this.handleDialogClose.bind(this)}>取消</button>
            </div>
          </form>
        </dialog>
      </div>
    )
  }
  
  componentDidMount() {
    // Upgrade material components in DOM
    window.componentHandler.upgradeAllRegistered();
  }
  
  componentDidUpdate(prevProps, prevState) {
    Array.from(this.refs.dialog.querySelectorAll('.mdl-js-textfield')).forEach(($el)=> {
      if ($el.MaterialTextfield) {
        $el.MaterialTextfield.checkDirty();
      }
    });
  }

  handleBookNameInput(e) {
    this.setState({
      showBookNameValidity: false,
      bookName: e.target.value
    });
  }

  handleCategoryInput(e) {
    const category = e.target.value;
    const results = searchForCategory(this.props.categories, category);
    this.setState({
      showCategoryValidity: false,
      categoryResults: results
    });

    function searchForCategory(categories, criteria = '', prefix = '') {
      if (!criteria)
        return [];

      return categories.reduce(function(result, category) {
        const displayLabel = !prefix ? category.label : [prefix, category.label].join('>');

        if (category.label.indexOf(criteria) > -1) {
          result.push({id: category.id, label: category.label, displayLabel: displayLabel});
        }

        const subCategories = category.items.filter(function(item) {
          return item.type === 'category';
        });

        return result.concat(searchForCategory(subCategories, criteria, displayLabel));
      }, []);
    }
  }

  handleSelectCategory(theCategory) {
    const {selectedCategories=[]} =  this.state;

    if(selectedCategories.indexOf(theCategory) < 0){
      selectedCategories.push(theCategory);
      this.setState({
        selectedCategories
      }, () => {
        this.resetCategoryInput();
      });
    }
  }

  handleRemoveCategory(theCategory) {
    const {selectedCategories=[]} = this.state;
    const index = selectedCategories.indexOf(theCategory);
    if (index > -1) {
      selectedCategories.splice(index, 1);
    }
    this.setState({selectedCategories});
  }

  handleAddNewCategory(e) {
    const categoryName = this.refs.category.value;
    if (categoryName) {
      const {selectedCategories=[]} =  this.state;
      const index = selectedCategories.findIndex(function(category) {
        return category.label === categoryName;
      })

      if (index < 0) {
        selectedCategories.push({
          id: null,
          label: categoryName
        });
        this.setState({selectedCategories}, () => {
          this.resetCategoryInput();
        });
      }
    }
  }

  handleSearch(e) {
    const searchText = e.target.value;
    this.setState({searchText}, ()=> {
      this.props.onSearch(searchText);
    });
  }

  handleSearchKeyUp(e) {
    if (e.key === ESC) {
      this.setState({searchText: ''}, ()=> {
        this.props.onSearch('');
      });
    }
  }

  resetCategoryInput() {
    // reset input
    this.setState({
      categoryResults: []
    }, () => {
      this.refs.category.value = '';
    });
  }

  resetDialog() {
    this.setState({
      selectedCategories: [],
      bookName: '',
      showBookNameValidity: false,
      showCategoryValidity: false
    });
    this.resetCategoryInput();
  }

  handleDialogOpen() {
    this.refs.dialog.showModal();
  }

  handleDialogClose(e) {
    if (!e || e.key === 'Escape') {
      this.refs.dialog.close();
      this.resetDialog();
    }
  }

  checkDialogValidity() {
    const {bookName, selectedCategories} = this.state;
    if (!(bookName && selectedCategories.length)) {
      this.setState({
        showBookNameValidity: true,
        showCategoryValidity: true
      });
      return false;
    }
    return true;
  }

  handleDialogSave() {
    if (this.checkDialogValidity()) {
      const {newBook} = this.props.actions;
      newBook({
        id: null,
        label: this.state.bookName,
        categories: this.state.selectedCategories
      });
      this.handleDialogClose();
    }
  }
}
