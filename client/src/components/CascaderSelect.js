import React, { Component } from 'react'
import { Cascader, Empty } from 'antd';

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
      children: option[this.props.child.arrayKey].map((child,ci) => ({
        label: child[this.props.child.label] || child[this.props.parent.label] || child._id || ci,
        value: child[this.props.child.label] || child[this.props.parent.value] || child._id || ci,
        key: child._id || ci,
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
            children: this.props.data.filter(parent => parent[this.props.child.arrayKey].map(val => val[this.props.child.title]).includes(child[this.props.child.title])).map((parent, pi) => ({
              label: parent[this.props.parent.label] || parent._id + child._id || ci + pi,
              value: parent[this.props.parent.value] + " " + child[this.props.child.label] || parent._id + child._id || ci + pi,
              key: parent._id +"-"+ child._id || ci + pi,
              id: parent._id,
            })),
          })
        })
      }
    }
    this.setState({
      data,
    })
  }
 
  onChange = (value,options) => {
    console.log('onChange ', {value,options});
    this.setState({ value });
    this.props.onChange && this.props.onChange(value,options)
  }

  filter(inputValue, path) {
    return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
  }

  render() {
    const id = this.props.id || this.props.placeholder + 'cascader'
    return (
      <div id={id}>
        <Cascader
          options={this.state.data.length > 0 ? this.state.data : [{ label: (<span><Empty imageStyle={{ height: 20 }} /></span>), value: 'empty', key: 'empty', disabled: true}]}
          onChange={this.onChange}
          placeholder={this.props.placeholder || "Please select"}
          showSearch={this.state.data.length > 0 ? { filter: this.filter } : false}
          style={{minWidth: 200}}
          popupClassName={'cascader-popup'}
          notFoundContent={<Empty imageStyle={{ height: 20 }} />}
          getPopupContainer={() => document.getElementById(id)}
      />
      </div>
    );
  }
}

export default CascaderSelect;