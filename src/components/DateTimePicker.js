import React from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Navbar } from 'react-bootstrap';

import 'react-datepicker/dist/react-datepicker.css';
import './DateTimePicker.scss';

import { InterfaceVisibilityControls } from './InterfaceVisibilityControls';

export class DateTimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date()
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  handleDateChange(date) {
    this.setState({
      date: date
    }, () => {
      this.props.onSelect(date.getTime() / 1000);
    });
  }

  handleRefresh() {
    this.props.onSelect();
  }

  render() {
    const { namespaceOptions, objectKindOptions, showLabels } = this.props;

    return (
      <Navbar bg="dark" variant="dark" expand="lg" fixed="bottom">
        <div className="date-picker-container">
          <span onClick={this.handleRefresh} className="refresh">
            <i className="fas fa-sync-alt fa-lg refresh-icon" />
          </span>
          <DatePicker
            className="date-picker"
            selected={this.state.date}
            onChange={this.handleDateChange}
            dateFormat="dd/MM/yyyy hh:mm a"
            showTimeSelect
            timeIntervals={15}
            maxDate={new Date()}
          />
        </div>
        <div className="selector-container" id="namespace-selector-container">
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            menuPlacement="top"
            options={namespaceOptions}
            placeholder="Select Namespace.."
            onChange={(e) => this.props.handleNamespaceChange(e)}
            isClearable
          />
        </div>
        <div className="selector-container" id="object-selector-container">
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            menuPlacement="top"
            options={objectKindOptions}
            placeholder="Select Objects.."
            onChange={(e) => this.props.handleKindChange(e)}
            isMulti
            defaultValue={this.props.defaultKinds}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: theme.colors.neutral60,
                primary50: theme.colors.neutral40,
                primary25: theme.colors.neutral20
              }
            })}
            isClearable
          />
        </div>

        <InterfaceVisibilityControls showLabels={showLabels} toggleNodeLabels={this.props.toggleNodeLabels} />
      </Navbar>
    );
  }
}
