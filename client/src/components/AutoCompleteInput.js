import React, { Component } from 'react';
import { Button, Select, Empty, Form, Skeleton, Divider, Icon, Input, Tooltip } from 'antd';
import { getAllModelDocuments } from '../store/actions/models';
import { connect } from "react-redux";

const Option = Select.Option;

class AutoCompleteInputForm extends Component {
  _isMounted = false 
  constructor(props) {
    super(props)
    this.timeout = 0;
    this.state = {
      data: [],
      addItem: false,
      searchValue: '',
    }
  }

  updateSelected = () => {
    let selected = this.props.selected.map(item => (
      {
        props:
          { data: { ...item } },
        ...this.props.mode === 'tags' ? { key: item[this.props.searchKey] } : { key: item._id },
        label: item[this.props.searchKey]
      }
    ))
    console.log('updated select', {selected})
    this.setState({ selected })
    if (!this.props.skipSelectedCallback) {
      selected = selected.length > 1 ? selected : selected[0]
      this.handleChange(selected, selected, true);
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.setFocus && this.setFocus()
    if (this.props.selected) {
      this.updateSelected()
    }
  }

  setFocus = () => {
    this.selectRef.focus()
    this.selectRef.rcSelect.state.open = true
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.setFocus === true && prevProps.setFocus === false) {
      console.log('setting focus!')
      this.handleDataFetch('')
      this.setFocus()
    }
    if (this.props.selected !== prevProps.selected) {
      //check the arrays
    if (!this.props.selected.sort((a, b) => a._id > b._id).every(function (value, index) { return value === prevProps.selected.sort((a, b) => a._id > b._id)[index] })) {
        this.updateSelected()
        console.log({
          oldS: prevProps.selected,
          newS: this.props.selected
        })
      }
    }
    //check if we are switching mode from multiple/tags to single/default, need to update select ui and handleChange
    if (['tags','multiple'].includes(prevProps.mode) && [undefined,'default'].includes(this.props.mode)) {
      let selected = this.props.form.getFieldValue('selected')
      if (Array.isArray(selected) && selected[1]) {
        let [update, ...rest] = selected
        this.props.form.setFieldsValue({selected: update})
        delete update.label
        update = {
          ...update,
          props: {
            data: this.state.data.find(item => item._id === update.key) || {}
          }
        }
        this.handleChange(update,update)
      }
    }
  }

  handleType = (searchValue) => {
    this.setState({ loading: true, searchValue })
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.handleDataFetch(searchValue)
    }, 300);
  }

  handleTransition = async () => {
    await this.setState({
      transition: true,
      addItem: !this.state.addItem,
    })
    setTimeout(()=>{
      this.setState({
        transition: false,
      })
    },400)
  }

  handleDataFetch = async (value) => {
    const searchKey = this.props.searchKey;
    await getAllModelDocuments({model: this.props.queryModel, documentRef: {[searchKey]: value, ...this.props.query},groupBy: searchKey, company: this.props.currentUser.user.company, regex:true, limit: 15})
    .then((res)=>{
      //remove duplicates based on searchKey if in tags mode
      let data =
        this.props.mode === "tags"
          ? res.data.filter(function (a) {
            return !this[a[searchKey]] && (this[a[searchKey]] = true);
          }, Object.create(null))
          : res.data;
      this._isMounted && this.setState({data})
    })
    .catch(err=>{
      console.log(err)
    })
    this._isMounted && this.setState({ loading: false });
  }

  handleChange = (id,e,skipCallback) => {
    this.props.form.setFieldsValue({selected: id})
    if (!id) {
      this.props.onUpdate({ id: '', data: {}, skipCallback })
      return
    }
    if (id.length === 0) {
      this.props.onUpdate({id:'', data:{}, skipCallback})
      return
    }
    let data = Array.isArray(e) ? e.map(d=>({...d.props.data})) : e.props.data
    id = Array.isArray(id) ? id.map(i=>({id:i.key})) : id
    this.props.onUpdate({ id, data, skipCallback })
  }

  handleVisibleChange = (open) => {
    if (open) {
    this.setState({
      loading: true,
    })
    !this.state.searchValue && this.handleDataFetch()
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let filter = this.props.filter || function(arr){ return arr}
    const children = filter(this.state.data).map(item => (
      // use item._id as value if not in tags mode
      <Option key={item._id} value={this.props.mode === 'tags' ? item[this.props.searchKey] : item._id} data={{ ...item }}>
        {this.props.renderOption ? this.props.renderOption(item) : item[this.props.searchKey]}
      </Option>
    ));
    const domRef = this.props.domRef || this.props.placeholder + 'auto-complete'
    return (
      <div id={domRef}>
        <Skeleton paragraph={false} loading={this.state.transition} active>
          {this.state.addItem ?
            <Input
              autoFocus
              onChange={(e) => this.props.onAddItemInputChange(e.target.value)}
              suffix={
                <Tooltip title="Cancel">
                  <Icon type="close-circle" style={{ color: 'rgba(0,0,0,.45)', cursor: 'pointer' }} onClick={this.handleTransition} />
                </Tooltip>
              }
            />
            :
            getFieldDecorator("selected", {initialValue: this.state.selected && this.state.selected})(
              <Select
                size={this.props.size}
                allowClear
                style={{ minWidth: 180 }}
                showSearch
                showArrow
                placeholder={this.props.placeholder}
                notFoundContent={this.state.loading ? <Skeleton active loading paragraph={false} /> : this.props.notFound || <Empty imageStyle={{ height: 20 }} />}
                onDropdownVisibleChange={this.handleVisibleChange}
                filterOption={false}
                onSearch={this.handleType}
                onChange={this.handleChange}
                mode={this.props.mode || "default"}
                labelInValue
                ref={node => (this.selectRef = node)}
                onMouseLeave={(e) => e.stopPropagation()}
                getPopupContainer={() => document.getElementById(domRef)}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    {this.props.showAddOption && (
                      <div>
                        <Divider style={{ margin: '4px 0' }} />
                        <div style={{ padding: '8px', cursor: 'pointer', width: '100%' }} onMouseDown={this.handleTransition}>
                          <Icon type="plus" /> Add item
                        </div>
                      </div>
                      )}
                  </div>
                )}
              >
                {children}
              </Select>
            )
          }
        </Skeleton>
      </div>
    );
  }
}

const AutoCompleteInput = Form.create()(AutoCompleteInputForm);

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}


export default connect(mapStateToProps, {})(AutoCompleteInput);