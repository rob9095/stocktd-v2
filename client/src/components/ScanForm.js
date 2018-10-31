import React, { Component } from 'react';
import { Input, Switch, Form, Button, Icon} from 'antd';


const InputGroup = Input.Group;
const FormItem = Form.Item;

class ScanForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
        }
    }
    
    toggle = () => {
       this.setState({
         open: !this.state.open,
       })
    }

    render() {
        return (
            <div>
                <Form layout="inline">
                    <FormItem label="Scan">
                        <Switch checked={this.state.open} onChange={this.toggle} />
                    </FormItem>
                </Form>
                {this.state.open && (
                    <div className="scan-input-container">
                    <InputGroup compact>
                        <Input addonBefore="rob" style={{ width: '30%' }} defaultValue="Box Name" />
                        <Input style={{ width: '50%' }} defaultValue="Scan ID" />
                        <Input addonAfter={<Icon type="search" />} type="number" style={{ width: '20%' }} defaultValue="1" />
                    </InputGroup>
                </div>
                )}
            </div>        
        )
    }
}

export default ScanForm;