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
      ...this.props.labelProp && {[this.props.labelProp]: option[this.props.parentValue] || option._id || i},
      key: option._id || i,
      children: option[this.props.childArray].map((child,ci) => ({
        title: child[this.props.childTitle] || child[this.props.parentTitle] || child._id || ci,
        value: child[this.props.childValue] || child[this.props.parentValue] || child._id || ci,
        key: child._id || ci,
      }))
    }))
    if (this.props.reverseTree) {
      //reverse the data, set children to parents and vise versa
      for (let option of this.props.data) {
        data = option[this.props.childArray].map((child, ci) => {
          return ({
            title: child[this.props.childTitle] || child[this.props.parentTitle] || child._id || ci,
            value: child[this.props.childValue] || child[this.props.parentValue] || child._id || ci,
            key: child._id || ci,
            children: this.props.data.filter(box => box.locations.map(l => l[this.props.childTitle]).includes(child[this.props.childTitle])).map((box, bi) => ({
              title: box[this.props.parentTitle] || box._id + child._id || ci + bi,
              value: box[this.props.parentValue] + " " + child[this.props.childValue] || box._id + child._id || ci + bi,
              key: box._id +"-"+ child._id || ci + bi,
            })),
          })
        })
      }
    }
    this.setState({
      data,
    })
  }
 
  onChange = (value) => {
    console.log('onChange ', value);
    this.setState({ value });
  }

  render() {
    const id = this.props.id || this.props.placeholder + 'tree-select'
    const tProps = {
      treeData: this.state.data,
      onSelect: this.onChange,
      value: this.state.value,
      treeCheckable: true,
      showCheckedStrategy: TreeSelect.SHOW_PARENT,
      searchPlaceholder: 'Please select',
      treeCheckStrictly: true,
      getPopupContainer: () => document.getElementById(id),
      style: {
        minWidth: 200,
      }
    };
    return (
      <div id={id}>
        <TreeSelect {...tProps} />
      </div>
    );
  }
}

export default SimpleTreeSelect;