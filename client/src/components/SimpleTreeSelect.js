import React, { Component } from 'react'
import { TreeSelect } from 'antd';

const treeData = [{
  title: 'Node1',
  value: '0-0',
  key: '0-0',
  children: [{
    title: 'Child Node1',
    value: '0-0-0',
    key: '0-0-0',
  }],
}, {
  title: 'Node2',
  value: '0-1',
  key: '0-1',
  children: [{
    title: 'Child Node3',
    value: '0-1-0',
    key: '0-1-0',
  }, {
    title: 'Child Node4',
    value: '0-1-1',
    key: '0-1-1',
  }, {
    title: 'Child Node5',
    value: '0-1-2',
    key: '0-1-2',
  }],
}];

class SimpleTreeSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    //loop through provided data and configure options
    let data = this.props.data.map((option,i) => ({
      title: option[this.props.parentTitle] || option._id || i,
      value: option[this.props.parentValue] || option._id || i,
      key: option._id || i,
      children: option[this.props.childArray].map((child,ci) => ({
        title: child[this.props.childTitle] || child[this.props.parentTitle] || child._id || ci,
        value: child[this.props.childValue] || child[this.props.parentValue] || child._id || ci,
        key: child._id || ci,
      }))
    }))
    this.setState({
      data,
    })
  }
 
  onChange = (value) => {
    console.log('onChange ', value);
    this.setState({ value });
  }

  render() {
    const tProps = {
      treeData: this.state.data,
      onChange: this.onChange,
      treeCheckable: true,
      showCheckedStrategy: TreeSelect.SHOW_PARENT,
      searchPlaceholder: 'Please select',
      treeCheckStrictly: true,
      style: {
        minWidth: 200,
      }
    };
    return <TreeSelect {...tProps} />;
  }
}

export default SimpleTreeSelect;