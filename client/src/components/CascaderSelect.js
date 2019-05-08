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
          <div>
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
      data = []
      for (let option of this.props.data) {
        let options = option[this.props.child.arrayKey].map((child, ci) => {
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
        data.push(...options)
      }
    }
    data = data.reduce((acc,cv)=>{
      const foundIndex = acc.map(option=>option.id).indexOf(cv.id)
      if (foundIndex !== -1) {
        //push the chilren to the existing option
        acc[foundIndex].children = [...acc[foundIndex].children, ...cv.children]
        //need to remove duplicates here
        //.reduce((cAcc,cCv)=>{cAcc.map(c=>c.id).indexOf(cCv.id) !== -1 ? [...cAcc] : [...cAcc, ...cCv]},[])
        return [...acc]
      } else {
        return [...acc, cv]
      }
    },[])
    console.log({data})
    let defaultParent = data.find(parent=>parent.isDefault) || {children: []}
    let defaultChild = defaultParent.children.find(child=>child.isDefault) || {}
    let value = [defaultParent.value, defaultChild.value]
    this.setState({
      data,
      value,
    })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
 
  onChange = async (value,options) => {
    if (options[0] && options[0].key === 'addNewItem') {
      this.props.onAddNewItem && this.props.onAddNewItem()
      return
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
            allowClear={Array.isArray(this.state.value) && this.state.value[0] !== undefined}
          />
        </Skeleton>
      </div>
    );
  }
}

export default CascaderSelect;