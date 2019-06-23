import React, { Component } from 'react';
import { Icon, Input, Menu, Dropdown, Tooltip, Select } from 'antd';

const moment = require('moment');

class SingleInputFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
      optionCount: 6,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.searchBuilderClosed === true && prevProps.searchBuilderClosed === false) {
      let searchValue = this.buildQueryString()
      this.setState({ searchValue })
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

  handleSelect = ({ item, key, keyPath, domEvent}) => {
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
    if (this.state.searchTag && this.state.searchValue) {
      let input = this.props.options.find(i=>i.id === this.state.searchTag.id) || {}
      let searchValue = input.type === 'date' || input.type === 'array' ? this.state.searchValue.split(",") : this.state.searchValue 
      //single search mode with tag
      query = [[this.state.searchTag.id,searchValue]]
    } else if(this.state.searchValue) {
      //multiple search mode, script over input and create query
      query = this.state.searchValue.split(" ").map(q => {
        if (q.includes("")) {
          q = q.split(":")
          let input = this.props.options.find(i=>i.id === q[0]) || {}
          let fq = input.type === 'date' || input.type === 'array' ? [q[0], q[1].split(",")] : q
          return fq
        } else {
          return 'error'
        }
      })
      if (query.filter(q=>q==='error').length > 0) {
        return {error: true}
      }
    }
    //loop the provided iputs(form fields) and remove any inputs with nestedKeys(populated fields), and create a populateArray query
    let populateArray = [];
    let populateQuery = [];
    let popFields = this.props.options.filter(input => input.nestedKey)
    if (popFields.length > 0) {
      for (let input of popFields) {
        //check if query has a match, toLowerCase the query field(val[0]) and the input.text to check for match
        let popId = input.id + input.nestedKey
        let match = query.find(val => val[0] === input.id || val[0].toLowerCase() === input.text.toLowerCase().split("").filter(l=>l!==" ").join(""))
        if (match) {
          query = query.filter(val => val[0] !== match[0])
          match[0] = input.nestedKey
          let defaultQuery = input.defaultQuery || []
          let text = input.text.split("").filter(l => l !== ' ').join('')
          if (input.populatePath) {
            populateArray.push({ path: input.populatePath, populate: [{ path: input.id, query: [match] }, ...input.defaultPopulateArray], query: defaultQuery })
            populateQuery.push({ popId, path: input.populatePath, id: input.id, text, match })
          } else {
            populateArray.push({ path: input.id, query: [match, ...defaultQuery] })
            populateQuery.push({ popId, id: input.id, text, match })
          }
        }
      }
    }
    return ({query, populateArray, populateQuery})
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const {query, populateArray, populateQuery, error} = this.buildQuery()
      if (error) {
        alert('Error Processing Query!')
        return
      }
      this.props.onSearch(query,populateArray,populateQuery)
    }
  }

  handleClear = async () => {
    this.state.searchValue ? await this.setState({ searchValue: '' }) : await this.setState({ searchTag: null })
    this.handleKeyPress({key: 'Enter'})
  }

  buildQueryString = () => {
    let currentQuery = this.props.query || []
    let populateQuery = this.props.populateQuery || []
    return [...currentQuery, ...populateQuery].map(q => {
      // if query is object with match use match otherwise use q
      let query = q.match || q
      // if query is objet with match set it as populdate data otherwise set it as empty obj
      let popData = q.match ? q : {}
      //pull the base query out of the query/match
      let [field, searchValue, operator] = query
      //if we have a popData.id use it otherwise use the default feild
      return `${popData.id ? popData.text || popData.id : field}:${operator ? operator + ":" : ''}${searchValue}`
    }).join(' ')
  }

  handleShowSearchBuilder = () => {
    //if we have a searchValue or a searchValue and a searchTag
    if (this.state.searchValue) {
      this.handleKeyPress({key: 'Enter'})
      let searchValue = this.buildQueryString()
      this.setState({searchValue})
    }
    this.setState({ visible: false, searchTag: null })
    this.props.onSearchBuilderToggle()
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
              {this.props.options.filter((opt, i) => i + 1 <= this.state.optionCount).map((opt, i) => (
                <Menu.Item style={{ marginLeft: -40, listStyle: 'none' }} type={opt.type} text={opt.text} key={opt.id + i} id={opt.id} value={opt.id}>
                  {opt.text}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          ))
          .concat(
            <div className="dropdown-extra" key={'dropdown-extra'}>
              <a href="#" onClick={this.handleShowSearchBuilder}>Advanced Search</a>
            </div>
          )
        }
      </Menu>
    )
    let disabled = !this.props.searchBuilderClosed
    let queryString = this.buildQueryString()
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
              <Icon className={disabled && 'not-allowed'} {...!disabled && {onClick: this.handleClear}} type="close-circle" theme="filled" />
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