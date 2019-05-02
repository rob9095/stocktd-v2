import React, { Component } from 'react'
import { Cascader, Empty, Skeleton } from 'antd';

class CascaderSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    //loop through provided data and configure options
    let data = this.props.data.map((option,i) => ({
      label: option[this.props.parent.label] || option._id || i,
      value: option[this.props.parent.value] || option._id || i,
      key: option._id || i,
      id: option._id,
      isDefault: option._id === option[this.props.parent.defaultKey],
      [[this.props.parent.defaultKey]]: option[this.props.parent.defaultKey],
      children: option[this.props.child.arrayKey].map((child,ci) => ({
        label: child[this.props.child.label] || child[this.props.parent.label] || child._id || ci,
        value: child[this.props.child.label] || child[this.props.parent.value] || child._id || ci,
        key: child._id || ci,
        id: child._id,
        isDefault: child._id === child[this.props.child.defaultKey],
      }))
    }))
    if (this.props.reverseData) {
      //reverse the data, set children to parents and vise versa
      for (let option of this.props.data) {
        data = option[this.props.child.arrayKey].map((child, ci) => {
          return ({
            label: child[this.props.child.title] || child[this.props.parent.label] || child._id || ci,
            value: child[this.props.child.label] || child[this.props.parent.value] || child._id || ci,
            key: child._id || ci,
            id: child._id,
            isDefault: child._id === option[this.props.child.defaultKey],
            [[this.props.child.defaultKey]]: option[this.props.child.defaultKey],
            children: this.props.data.filter(parent => parent[this.props.child.arrayKey].map(val => val[this.props.child.title]).includes(child[this.props.child.title])).map((parent, pi) => ({
              label: parent[this.props.parent.label] || parent._id + child._id || ci + pi,
              value: parent[this.props.parent.value] + " " + child[this.props.child.label] || parent._id + child._id || ci + pi,
              key: parent._id +"-"+ child._id || ci + pi,
              id: parent._id,
              isDefault: parent._id === option[this.props.parent.defaultKey],
            })),
          })
        })
      }
    }
    let defaultParent = data.find(parent=>parent.isDefault) || {children: []}
    let defaultChild = defaultParent.children.find(child=>child.isDefault) || {}
    let value = [defaultParent.value, defaultChild.value]
    this.setState({
      data,
      value,
    })
  }
 
  onChange = async (value,options) => {
    this.setState({loading: true})
    if (this.props.onChange) {
      await this.props.onChange(value, options).then(res => console.log(res)).catch(err => console.log(err))
      return
    }
    this.setState({ loading: false, value })
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
            options={this.state.data.length > 0 ? this.state.data : [{ label: (<span><Empty imageStyle={{ height: 20 }} /></span>), value: 'empty', key: 'empty', disabled: true }]}
            onChange={this.onChange}
            placeholder={this.props.placeholder || "Please select"}
            showSearch={this.state.data.length > 0 ? { filter: this.filter } : false}
            style={{ minWidth: 200 }}
            popupClassName={'cascader-popup'}
            notFoundContent={<Empty imageStyle={{ height: 20 }} />}
            getPopupContainer={() => document.getElementById(id)}
            value={this.state.value}
            allowClear={Array.isArray(this.state.value) && this.state.value[0] !== undefined}
          />
        </Skeleton>
      </div>
    );
  }
}

export default CascaderSelect;