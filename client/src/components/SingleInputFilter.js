import React, { Component } from 'react';
import { Icon, Input, AutoComplete, Menu, Dropdown, Tooltip, Select } from 'antd';

const { Option, OptGroup } = AutoComplete;

class SingleInputFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
      optionCount: 6,
    }
  }

  renderTitle = (title) => {
    return (
      <span style={{color: '#8c96c7', fontSize: 12}}>
        {title}
        {this.state.optionCount < this.props.options.length ? 
          <a
            style={{ float: 'right' }}
            href="#"
            onClick={() => this.setState({ optionCount: this.state.optionCount + 5 })}
          >
            more
          </a>
        :
          <a
            style={{ float: 'right' }}
            href="#"
            onClick={() => this.setState({ optionCount: this.state.optionCount - 5 })}
          >
            less
          </a>
        }
      </span>
    );
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
    this.setState({searchTag: item.props})
    setTimeout(() => {
      this.inputRef.focus()
    }, 50);
  }

  handleChange = (searchValue,e) => {
    this.setState({searchValue})
  }

  buildQuery = (config) => {
    let query = []
    if (this.state.searchTag) {
      //single search mode with tag
      query = [[this.state.searchTag.id,this.state.searchValue]]
    } else if(this.state.searchValue) {
      //multiple search mode, script over input and create query
      query = this.state.searchValue.split(" ").map(q => {
        return q.split(":")
      })
    }
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
    return ({query, populateArray})
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log({
        searchValue: this.state.searchValue
      })
      const {query, populateArray} = this.buildQuery()
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
        title: 'Search By',
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
            <Menu.ItemGroup key={group.title} title={this.renderTitle(group.title)}>
              {this.props.options.filter((opt,i)=> i+1 <= this.state.optionCount).map((opt,i) => (
                <Menu.Item style={{ marginLeft: -40, listStyle: 'none' }} text={opt.text} key={opt.id + i} id={opt.id} value={opt.id}>
                  {opt.text}
                </Menu.Item>                
              ))}
            </Menu.ItemGroup>
          ))
          .concat(
            <div className="dropdown-extra" key={'dropdown-extra'}>
              <a href="#" onClick={()=>this.setState({visible: false, searchTag: null}) || this.props.onSearchBuilderToggle()}>Advanced Search</a>
            </div>
          )
          }
      </Menu>
        )
    let disabled = !this.props.searchBuilderClosed
    let currentQuery = this.props.query || []
    let queryString = currentQuery.map(q=>(
      q[2] ? `${q[0]}:${q[2]}:${q[1]}` : `${q[0]}:${q[1]}` 
    )).join(' ')
    return (
      <div onKeyDown={this.handleKeyPress} style={{ minWidth: 250 }} className="single-input-search">
        <Dropdown disabled={disabled} overlay={options} visible={this.state.visible} onVisibleChange={(visible)=>this.setState({visible})}>
          <Input
            ref={node => this.inputRef = node}
            placeholder="Search"
            onFocus={() => this.setState({ visible: true })}
            value={this.props.searchBuilderClosed ? this.state.searchValue : queryString}
            onChange={(e) => this.handleChange(e.target.value, e)}
            addonBefore={this.state.searchTag ? <div><span className="search-tag">{this.state.searchTag.text}</span></div> : null}
            suffix={this.state.searchValue || this.state.searchTag ?
              <Icon className={disabled && 'not-allowed'} onClick={()=>this.state.searchValue ? this.setState({searchValue: ''}) : this.setState({searchTag: null})} type="close-circle" theme="filled" />
              :
              <Icon className={disabled && 'not-allowed'} type="search" />
               }    
          />
        </Dropdown>
      </div>
    )
  }
}

export default SingleInputFilter;