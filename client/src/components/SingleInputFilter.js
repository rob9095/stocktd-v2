import React, { Component } from 'react';
import { Icon, Input, AutoComplete, Menu, Dropdown } from 'antd';

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
    let options = () => (
      <Menu onClick={this.handleSelect}>
        {dataSource
          .map(group => (
            <Menu.ItemGroup key={group.title} title={renderTitle(group.title)}>
              {group.children.map(opt => (
                <Menu.Item style={{ marginLeft: -40, listStyle: 'none' }} key={opt.title} value={opt.title}>
                  {opt.title}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          ))}
      </Menu>
    )
    return (
      <div onKeyDown={this.handleKeyPress} style={{ width: 250 }}>
        <Dropdown overlay={options} visible={this.state.visible} onVisibleChange={(visible)=>this.setState({visible})}>
          <Input onFocus={()=>this.setState({visible: true})} value={this.state.searchValue} onChange={(e) => this.handleChange(e.target.value, e)} suffix={<Icon onClick={() => this.handleKeyPress({ key: 'Enter' })} type="search" className="certain-category-icon" />} />
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