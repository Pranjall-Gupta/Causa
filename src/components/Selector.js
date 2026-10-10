import React from 'react';
import List from 'react-list-select';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Item } from './Item';
import { AiFixSuggestion } from './AiFixSuggestion';

import 'react-tabs/style/react-tabs.css';
import './NodeDetailCard.scss';

export class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0
    };
    this.handleSelection = this.handleSelection.bind(this);
  }

  handleSelection(selected) {
    const index = Array.isArray(selected) ? selected[0] : selected;
    this.setState({ selectedIndex: index });
    if (this.props.handleChange) {
      this.props.handleChange(selected);
    }
  }

  handleOptions(rca_option) {
    return (rca_option || []).map((option, index) => {
      return <Item key={index} option={option} />;
    });
  }

  render() {
    const options = this.props.options || [];
    const hidden = this.props.hidden;
    const { selectedIndex } = this.state;
    const selectedOption = options[selectedIndex] || options[0] || null;
    const selectorItems = this.handleOptions(options);

    return (
      <div className={`card node-info-card ${hidden ? 'hidden' : ''} pt-0`}>
        <div className="card-body node-card-body mt-0 pt-0">
          <Tabs defaultIndex={0}>
            <TabList className="node-card-tabs">
              <Tab><i className="fa fa-route mr-1" /> Paths ({options.length})</Tab>
              <Tab><i className="fa fa-brain mr-1" /> AI Remedy</Tab>
            </TabList>

            <TabPanel>
              <h5 className="card-title fault" style={{ padding: '8px 0', margin: '0 0 8px 0' }}>
                Ranked Root Cause Trajectories
              </h5>
              <div className="card-text node-info-text">
                <List
                  items={selectorItems}
                  selected={[selectedIndex]}
                  onChange={this.handleSelection}
                />
              </div>
            </TabPanel>

            <TabPanel>
              <AiFixSuggestion
                alertId={this.props.sourceAlertId}
                trajectoryScore={selectedOption ? selectedOption.score : null}
                trajectory={selectedOption}
              />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    );
  }
}
