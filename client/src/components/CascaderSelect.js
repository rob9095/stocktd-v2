import React, { Component } from 'react'
import { Cascader, Empty, Skeleton, Divider, Icon } from 'antd';

class CascaderSelect extends Component {
  _isMounted = false;
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      emptyOption: { label: (<div style={{minWidth: 176}}><Empty imageStyle={{ height: 20 }} /></div>), value: 'empty', key: 'empty', disabled: true },
      addNewOption: {
        label: (
          <div style={{width: '100%'}}>
            <Divider style={{ margin: '-5px 0px 5px 0px' }} />
            <div className="flex align-items-center justify-content-center">
              <Icon type="plus" style={{ marginRight: 5, fontSize: 'small' }} /> {this.props.addOptionText || 'Add'}
            </div>
          </div>
        ), value: 'addNewItem', key: 'addNewItem',
      },
    }
  }

  componentDidMount() {
    this._isMounted = true;
    //loop through provided data and configure options
    let data = this.props.data.map((option,i) => ({
      label: (
        <div style={{ maxHeight: 40, overflow: "hidden" }}>
          <div style={{ fontSize: "small" }}>
            {option[this.props.parent.label] || option._id || i}
          </div>
          <div style={{ fontSize: 10, color: "grey" }}>
            {option[this.props.parent.subChild.key][this.props.parent.subChild.label]}
          </div>
        </div>
      ),
      value: option[this.props.parent.value] + option[this.props.parent.subChild.key]._id || option._id || i,
      key: option._id || i,
      id: option._id,
      isDefault: option._id === option[this.props.parent.defaultKey],
      ...this.props.parent.sortKey && {[this.props.parent.sortKey]: option[this.props.parent.sortKey]},
      ...this.props.parent.subChild.key && {[this.props.parent.subChild.key]: {
        label: option[this.props.parent.subChild.key][this.props.parent.subChild.label],
        value: option[this.props.parent.subChild.key][this.props.parent.subChild.value],
        key: option[this.props.parent.subChild.key]._id,
        id: option[this.props.parent.subChild.key]._id,
        childrenValues: option[this.props.child.arrayKey].map(child=>child[this.props.child.value]),
        parentId: option._id,
      }},
      children: option[this.props.child.arrayKey].map((child,ci) => ({
        label: child[this.props.child.label] || child[this.props.parent.label] || child._id || ci,
        value: child[this.props.child.value] || child[this.props.parent.value] || child._id || ci,
        key: child._id || ci,
        id: child._id,
        isDefault: child._id === option[this.props.child.defaultKey],
      }))
    })).reduce((acc, cv) => acc.map(option => option.value).indexOf(cv.value) !== -1 ? [...acc] : [...acc, cv], [])

    //reverse the data
    if (this.props.reverseData) {
      data = data.map(option => [...option.children]).flat().map(option => ({
         ...option,
         children: data.filter(parent => parent.children.map(c => c.value).indexOf(option.value) !== -1)
         .map(parent => ({ ...parent, children: parent.subChildren ? parent.subChildren.filter(sc=>sc.childrenValues.includes(option.value)) : null })) }))
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

  filter(inputValue, path) {
    return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
  }

  render() {
    const id = this.props.id || this.props.placeholder + 'cascader'
    return (
      <div id={id}>
        <Skeleton paragraph={false} loading={this.state.loading} active>
          <Cascader
            options={this.state.data.length > 0 ? this.props.showAddOption ? [...this.state.data, this.state.addNewOption] : this.state.data : [this.state.emptyOption, this.state.addNewOption]}
            onChange={this.onChange}
            placeholder={this.props.placeholder || "Please select"}
            showSearch={this.state.data.length > 0 ? { filter: this.filter } : false}
            style={{ minWidth: 200 }}
            popupClassName={'cascader-popup'}
            notFoundContent={<Empty imageStyle={{ height: 20 }} />}
            getPopupContainer={() => document.getElementById(id)}
            value={this.state.value}
            displayRender={(label) => {
              if (label[1]) {
                label[1] = label[1].props.children[0].props.children
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