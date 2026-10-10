import React from 'react';
import './InterfaceVisibilityControls.scss';

export class InterfaceVisibilityControls extends React.Component {
  render() {
    return (
      <div className="interface-visibility-controls-container">
        <div className="custom-control custom-switch custom-switch-sm">
          <input
            className="custom-control-input"
            id="labels-toggle"
            type="checkbox"
            checked={!!this.props.showLabels}
            onChange={(e) => this.props.toggleNodeLabels(e)}
          />
          <label className="custom-control-label" htmlFor="labels-toggle">
            <span className="custom-control-text">Display labels</span>
          </label>
        </div>
      </div>
    );
  }
}
