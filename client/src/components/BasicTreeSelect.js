import React, { Component } from "react";
import { TreeSelect } from "antd";

const { TreeNode } = TreeSelect;

class BasicTreeSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  onChange = (value, node, extra) => {
    console.log({ value, parent: extra.triggerNode.props.parent, subParent: extra.triggerNode.props.subParent, node, extra });
    this.setState({ value: extra.triggerNode.props.parent.title + " / " + extra.triggerNode.props.title });
  };

  renderOptions = (options=[],childOptions=[],reverseData) => (
    options.map(o=>
      <TreeNode selectable={o.selectable} disableCheckBox={o.disableCheckBox} value={o.value} title={o.title} key={o.value}>
        {childOptions.filter(c=>c.parentTitles.includes(o.title)).map(c=>
          <TreeNode
            parent={o}
            value={c.value + o.value}
            title={c.title}
            key={c.value + o.value}
          >
           {Array.isArray(c.children) && (
             c.children.filter(sc=>sc.parentTitles.includes(c.title)).map(sc=>
               <TreeNode
                 parent={o}
                 subParent={c}
                 value={sc.value + c.value + o.value}
                 title={sc.title}
                 key={sc.value + c.value + o.value}
               />
             )
           )}
          </TreeNode>
        )}
      </TreeNode>
    )
  )

  render() {
    let options = this.renderOptions(this.props.options,this.props.childOptions,this.props.reverseData)
    return (
      <TreeSelect
        // treeCheckable
        // treeCheckStrictly
        showCheckedStrategy="SHOW_ALL"
        showSearch
        style={{ width: '100%' }}
        value={this.state.value}
        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
        placeholder="Please select"
        allowClear
        treeDefaultExpandAll
        onChange={this.onChange}
        defaultValue={"parent / sss -s"}
      >
        {options}
      </TreeSelect>
    );
  }
}

export default BasicTreeSelect