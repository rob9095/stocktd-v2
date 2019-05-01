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
      label: option[this.props.parentTitle] || option._id || i,
      value: option[this.props.parentValue] || option._id || i,
      ...this.props.labelProp && {[this.props.labelProp]: option[this.props.parentValue] || option._id || i},
      key: option._id || i,
      children: option[this.props.childArray].map((child,ci) => ({
        label: child[this.props.childTitle] || child[this.props.parentTitle] || child._id || ci,
        value: child[this.props.childValue] || child[this.props.parentValue] || child._id || ci,
        key: child._id || ci,
      }))
    }))
    if (this.props.reverseData) {
      //reverse the data, set children to parents and vise versa
      for (let option of this.props.data) {
        data = option[this.props.childArray].map((child, ci) => {
          return ({
            label: child[this.props.childTitle] || child[this.props.parentTitle] || child._id || ci,
            value: child[this.props.childValue] || child[this.props.parentValue] || child._id || ci,
            key: child._id || ci,
            children: this.props.data.filter(box => box.locations.map(l => l[this.props.childTitle]).includes(child[this.props.childTitle])).map((box, bi) => ({
              label: box[this.props.parentTitle] || box._id + child._id || ci + bi,
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