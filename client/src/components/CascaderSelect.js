import React, { Component } from 'react'
import { Cascader, Empty, Skeleton, Divider, Icon, Input, Button } from 'antd';
import ReactDOM from "react-dom";

class CascaderSelect extends Component {
  _isMounted = false;
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
      data: [],
      emptyOption: { label: (<div style={{minWidth: 176}}><Empty imageStyle={{maxHeight: 20}} /></div>), value: 'empty', key: 'empty', disabled: true, text: '' },
      addNewOption: {
        label: (
          <div style={{width: '100%'}}>
            <div style={{height: 1, background: '#dee3f2',}} />
            <div className="flex align-items-center justify-content-center">
              <Button onClick={() => this.props.onAddNewItem() || this.close()} block className="no-border no-margin no-bg">
                <Icon type="plus" style={{ marginRight: 5, }} /> {this.props.addOptionText || 'Add'}
              </Button>
            </div>
          </div>
        ), value: 'addNewItem', key: 'addNewItem', text: 'addNewItem',
      },
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.triggerClose > prevProps.triggerClose) {
      this.setState({
        popupVisible: false,
      },)
    }
  }

  close = () => {
    this.setState({
      popupVisible: false
    })
    let {domRef} = this.props
    let div = document.getElementsByClassName('flex align-items-center half-pad ' + domRef)[0]
    let input = document.getElementById(domRef + 'search-input')
    let addNew = document.getElementById('addNew' + domRef)
    setTimeout(() => {
      input && input.remove()
      div && div.remove()
      addNew && addNew.remove()
    }, 100)
  }

  componentDidMount() {
    this._isMounted = true;
    //loop through provided data and configure options
    let data = this.props.data.map((option,i) => {
      let nestedObj = option[this.props.parent.subChild.key] || {}
      return ({
        label: (
          <div style={{ maxHeight: 40, overflow: "hidden" }}>
            <div style={{ fontSize: "small" }}>
              {option[this.props.parent.label] || option._id || i}
            </div>
            <div style={{ fontSize: 10, color: "grey" }}>
              {nestedObj[this.props.parent.subChild.label]}
            </div>
          </div>
        ),
        text: option[this.props.parent.label] || option._id || i + nestedObj[this.props.parent.subChild.label],
        value: option[this.props.parent.value] + nestedObj._id || option._id || i,
        key: option._id || i,
        id: option._id,
        isDefault: option._id === option[this.props.parent.defaultKey],
        ...this.props.parent.sortKey && { [this.props.parent.sortKey]: option[this.props.parent.sortKey] },
        ...this.props.parent.subChild.key && {
          [this.props.parent.subChild.key]: {
            text: nestedObj[this.props.parent.subChild.label],
            label: nestedObj[this.props.parent.subChild.label],
            value: nestedObj[this.props.parent.subChild.value],
            key: nestedObj._id,
            id: nestedObj._id,
            childrenValues: option[this.props.child.arrayKey].map(child => child[this.props.child.value]),
            parentId: option._id,
          }
        },
        children: option[this.props.child.arrayKey].map((child, ci) => ({
          text: child[this.props.child.label] || child[this.props.parent.label] || child._id || ci,
          label: child[this.props.child.label] || child[this.props.parent.label] || child._id || ci,
          value: child[this.props.child.value] || child[this.props.parent.value] || child._id || ci,
          key: child._id || ci,
          id: child._id,
          isDefault: child._id === option[this.props.child.defaultKey],
        }))
      })
    }).reduce((acc, cv) => acc.map(option => option.value).indexOf(cv.value) !== -1 ? [...acc] : [...acc, cv], [])

    //reverse the data
    if (this.props.reverseData) {
      data = data.map(option => option.children.length === 0 ? [{ text: 'N/A', label: 'N/A', value:'N/A-stkd~', key: 'N/A-stkd~'}] : [...option.children]).flat().map(option => ({
        ...option,
        ...option.value === 'N/A-stkd~' && data.filter(parent => parent.children.length === 0 && parent.isDefault).length > 0 && {isDefault: true},
        children: 
          option.value === 'N/A-stkd~' ? data.filter(parent => parent.children.length === 0)
          .map(parent => ({ ...parent, children: null }))
          : data.filter(parent => parent.children.map(c => c.value).indexOf(option.value) !== -1)
          .map(parent => ({ ...parent, children: null })) }))
         .reduce((acc, cv) => acc.map(option => option.value).indexOf(cv.value) !== -1 ? [...acc] : [...acc, cv], [])
    }

    //get defaults, use empty option if no data, otherwise check for default, otherwise use sortKey provided to parent
    let defaultParent = data.length === 0 ? { children: [] } : data.find(parent=>parent.isDefault) || data.sort((a,b)=>b[this.props.parent.sortKey] - a[this.props.parent.sortKey])[0]
    let defaultChild = defaultParent.children.length === 0 ? {} : defaultParent.children.find(child => child.isDefault) || defaultParent.children[0]
    let value = [defaultParent.value, defaultChild.value]
    this.setState({
      data,
      value,
    })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getCorrectChildId = (id) => {
    return this.props.data.find(option=>option[this.props.parent.subChild.key]._id === id)
  }
 
  onChange = async (value,options) => {
    if (options[0] && options[0].key === 'addNewItem') {
      this.props.onAddNewItem && this.props.onAddNewItem()
      return
    }
    if(options[2]) {
      let option = this.getCorrectChildId(options[2].id)
      console.log(option)
      options = [options[0], option, options[2]]//return
    }
    if (this.props.onUpdate) {
      this.setState({ loading: true })
      await this.props.onUpdate(value, options).then(res => console.log(res)).catch(err => console.log(err))
      this._isMounted && this.setState({ loading: false, value })
      return
    }
    this.setState({ value })
  }

  filter = (inputValue = '') => {
    console.log({
      inputValue
    })
    //searches two levels deep for now
    return this.state.data.filter(option=>option.text.toLowerCase().includes(inputValue.toLowerCase()) || Array.isArray(option.children) && option.children.filter(child=>child.text.toLowerCase().includes(inputValue.toLowerCase())).length > 0)
  }

  render() {
    const domRef = this.props.domRef || 'cascader'
    let data = this.state.searchValue ? this.filter(this.state.searchValue) : this.state.data
    return (
      <div id={domRef}>
        <Skeleton paragraph={false} loading={this.state.loading} active>
          <Cascader
            onPopupVisibleChange={async(popupVisible) => {
              await this.setState({ popupVisible})
              if (popupVisible) {
                let dropdown = document.getElementsByClassName('cascader-popup '+domRef)
                let div = document.createElement('div')
                let addNew = document.createElement('div')
                addNew.setAttribute('id', 'addNew'+domRef)
                div.className = 'flex align-items-center half-pad ' + domRef
                if (!this.props.hideSearch && this.state.data.length > 0) {
                  dropdown[0].prepend(div)
                  ReactDOM.render(<Input id={domRef + 'search-input'} size="small" suffix={<Icon type={"search"} />} placeholder={'Search'} onChange={(e) => this.setState({ searchValue: e.target.value })} />, div)
                  document.getElementById(domRef + 'search-input').focus()
                }
                if (this.props.showAddOption) {
                  dropdown[0].append(addNew)
                  ReactDOM.render(this.state.addNewOption.label, addNew)
                }
              } else {
                this.close()
              }
            }}
            popupVisible={this.state.popupVisible}
            placement="bottomRight"
            options={data.length > 0 ? data : [this.state.emptyOption]}
            onChange={this.onChange}
            placeholder={this.props.placeholder || "Please select"}
            style={{ minWidth: 180 }}
            popupClassName={'cascader-popup '+domRef}
            getPopupContainer={() => document.getElementById(domRef)}
            value={this.state.value}
            displayRender={(label) => {
              if (label[this.props.reverseData ? 1 : 0]) {
                label[this.props.reverseData ? 1 : 0] = label[this.props.reverseData ? 1 : 0].props.children[0].props.children
                return label.join(' / ')
              }
            }}
            allowClear={Array.isArray(this.state.value) && this.state.value[0] !== undefined}
          />
        </Skeleton>
      </div>
    );
  }
}

export default CascaderSelect;