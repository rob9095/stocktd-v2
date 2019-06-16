import React, { Component } from 'react';
import { Icon, Input, AutoComplete } from 'antd';

const { Option, OptGroup } = AutoComplete;

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
  {
    title: 'Recent Searches',
    children: [
      {
        title: 'sku: rh0135-a-1/2',
      },
      {
        title: 'quantity gt: 1',
      },
    ],
  },
];

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

const options = dataSource
  .map(group => (
    <OptGroup key={group.title} label={renderTitle(group.title)}>
      {group.children.map(opt => (
        <Option key={opt.title} value={opt.title}>
          {opt.title}
        </Option>
      ))}
    </OptGroup>
  ))

class SingleInputFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
    }
  }

  updateSearchValue = (config) => {
    let { value, clear } = config
    let searchValue = this.state.searchValue +`${this.state.searchValue ? ' ': ''}${value}:`
    this.setState({searchValue})
  }

  handleSelect = (value,option) => {
    console.log({
      value,
      option,
    })
    this.updateSearchValue({value})
  }

  handleChange = (searchValue) => {
    console.log({searchValue})
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
      console.log({query})
      this.props.onSearch(query,[])
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
    return (
      <div onKeyDown={this.handleKeyPress} className="certain-category-search-wrapper" style={{ width: 250 }}>
        <AutoComplete
          //filterOption={this.handleFilter}
          defaultActiveFirstOption={false}
          className="certain-category-search"
          dropdownClassName="certain-category-search-dropdown"
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: 300 }}
          size="large"
          style={{ width: '100%' }}
          dataSource={options}
          placeholder="input here"
          optionLabelProp="value"
          onSelect={this.handleSelect}
          onSearch={this.handleChange}
          value={this.state.searchValue}
        >
          <Input suffix={<Icon onClick={()=>this.handleKeyPress({key: 'Enter'})} type="search" className="certain-category-icon" />} />
        </AutoComplete>
      </div>
    )
  }
}

export default SingleInputFilter;