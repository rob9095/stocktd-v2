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
    }
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.selected) {
      let selected = this.props.selected.map(item=>(
        {props: 
          {data: {...item}},
          ...this.props.mode === 'tags' ? { key: item[this.props.searchKey] } : { key: item._id },
          label: item[this.props.searchKey]
        }
        ))
      this.setState({selected})
      if (this.props.skipSelectedCallback !== true) {
        selected = selected.length > 1 ? selected : selected[0]
        this.handleChange(selected, selected);
      }
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
    // Typical usage (don't forget to compare props):
    if (this.props.setFocus === true && prevProps.setFocus === false) {
      console.log('setting focus!')
      this.handleDataFetch('')
      this.setFocus()
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

  handleType = (value) => {
    this.setState({ loading: true })
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.handleDataFetch(value)
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

  handleChange = (id,e) => {
    if (!id) {
      this.props.onUpdate({ id: '', data: {} })
      return
    }
    if (id.length === 0) {
      this.props.onUpdate({id:'', data:{}})
      return
    }
    let data = Array.isArray(e) ? e.map(d=>({...d.props.data})) : e.props.data
    id = Array.isArray(id) ? id.map(i=>({id:i.key})) : id
    this.props.onUpdate({ id, data })
  }

  handleVisibleChange = () => {
    this.setState({
      loading: true,
    })
    this.state.data.length === 0 && this.handleDataFetch()
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const children = this.state.data.map(item => (
      // use item._id as value if not in tags mode
      <Option key={item._id} value={this.props.mode === 'tags' ? item[this.props.searchKey] : item._id} data={{ ...item }}>
        {this.props.renderOption ? this.props.renderOption(item) : item[this.props.searchKey]}
      </Option>
    ));
    const id = this.props.key || this.props.placeholder + 'auto-complete'
    return (
      <div id={id}>
        <Skeleton paragraph={false} loading={this.state.transition} active>
          {this.state.addItem ?
            <Input
              onChange={(e) => this.props.onAddItemInputChange(e.target.value)}
              suffix={
                <Tooltip title="Cancel">
                  <Icon type="close-circle" style={{ color: 'rgba(0,0,0,.45)', cursor: 'pointer' }} onClick={this.handleTransition} />
                </Tooltip>
              }
            />
            :
            getFieldDecorator("selected", { initialValue: this.props.selected && this.state.selected })(
              <Select
                allowClear
                style={{ minWidth: 200 }}
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
                getPopupContainer={() => document.getElementById(id)}
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