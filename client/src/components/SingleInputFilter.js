import React, { Component } from 'react';
import { Icon, Input, AutoComplete, Menu, Dropdown, Tooltip } from 'antd';

const { Option, OptGroup } = AutoComplete;

function renderTitle(title) {
  return (
    <span>
      {title}
      <a
        style={{ float: 'right' }}
        href="https://www.google.com/search?q=antd"
        target="_blank"
        rel="noopener noreferrer"
      >
        more
      </a>
    </span>
  );
}

class SingleInputFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  updateSearchValue = (config) => {
    let { value, clear } = config
    let current = this.state.searchValue || ''
    let searchValue = current +`${current ? ' ': ''}${value}:`
    console.log({searchValue})
    this.setState({searchValue})
  }

  handleSelect = ({ item, key, keyPath, domEvent}) => {
    console.log({
      item,
      key,
    })
    this.updateSearchValue({value: key})
    this.inputRef.focus()
  }

  handleChange = (searchValue,e) => {
    console.log({
      searchValue,
      e
    })
    this.setState({searchValue})
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log({
        searchValue: this.state.searchValue
      })
      let query = this.state.searchValue.split(" ").map(q=>{
        return q.split(":")
      })
      //loop the provided iputs(form fields) and remove any inputs with nestedKeys(populated fields), and create a populateArray query
      let populateArray = [];
      let popFields = this.props.options.filter(input => input.nestedKey)
      if (popFields.length > 0) {
        for (let input of popFields) {
          let match = query.find(val => val[0] === input.id)
          if (match) {
            query = query.filter(val => val[0] !== match[0])
            match[0] = input.nestedKey
            let defaultQuery = input.defaultQuery || []
            input.populatePath ?
              populateArray.push({ path: input.populatePath, populate: [{ path: input.id, query: [match] }, ...input.defaultPopulateArray], query: defaultQuery })
              :
              populateArray.push({ path: input.id, query: [match, ...defaultQuery] })
          }
        }
      }
      console.log({query,populateArray})
      this.props.onSearch(query,populateArray)
    }
  }

  handleFilter = (value,option) => {
    console.log({
      value,
      option,
      filter: true,
    })
  }

  render() {
    const dataSource = [
      {
        title: 'Common Search Terms',
        children: [
          {
            title: 'sku',
          },
          {
            title: 'title',
          },
          {
            title: 'quantity',
          },
        ],
      },
      // {
      //   title: 'Recent Searches',
      //   children: [
      //     {
      //       title: 'sku: rh0135-a-1/2',
      //     },
      //     {
      //       title: 'quantity gt: 1',
      //     },
      //   ],
      // },
    ]
    let options = () => (
      <Menu onClick={this.handleSelect}>
        {dataSource
          .map(group => (
            <Menu.ItemGroup key={group.title} title={renderTitle(group.title)}>
              {this.props.options.map(opt => (
                <Menu.Item style={{ marginLeft: -40, listStyle: 'none' }} key={opt.id} value={opt.id}>
                  {opt.text}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          ))}
      </Menu>
    )
    return (
      <div onKeyDown={this.handleKeyPress} style={{ width: 250 }}>
        <Dropdown overlay={options} visible={this.state.visible} onVisibleChange={(visible)=>this.setState({visible})}>
          <Input ref={node => (this.inputRef = node)} placeholder="Search" onFocus={() => this.setState({ visible: true })} value={this.state.searchValue} onChange={(e) => this.handleChange(e.target.value, e)} suffix={<Tooltip placement="left" title={<span style={{fontSize: 12}}>Toggle search builder</span>}><Icon type="setting" /></Tooltip>} />
        </Dropdown>
        {/* <AutoComplete
          //filterOption={this.handleFilter}
          defaultActiveFirstOption={false}
          dropdownClassName="certain-category-search-dropdown"
          size="large"
          style={{ width: '100%',}}
          dataSource={options}
          optionLabelProp="value"
          onSelect={this.handleSelect}
        >
          <Input style={{display: 'none'}} />
        </AutoComplete> */}
      </div>
    )
  }
}

export default SingleInputFilter;