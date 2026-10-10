import React from 'react';
import ReactJson from 'react-json-view';
import { Button, Badge } from 'react-bootstrap';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link } from 'react-router-dom';
import { IconMap } from './IconMap';
import { AiFixSuggestion } from './AiFixSuggestion';

import 'react-tabs/style/react-tabs.css';
import './NodeDetailCard.scss';

export class NodeDetailCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRawJson: false
    };
    this.toggleRawJson = this.toggleRawJson.bind(this);
  }

  toggleRawJson() {
    this.setState({ showRawJson: !this.state.showRawJson });
  }

  renderStructuredProperties(properties, kind) {
    if (!properties || Object.keys(properties).length === 0) {
      return <div className="property-empty">No properties available for this element.</div>;
    }

    const priorityOrder = ['severity', 'name', 'namespace', 'message'];
    const entries = Object.entries(properties)
      .filter(([, val]) => typeof val !== 'object' || val === null)
      .sort(([a], [b]) => {
        const idxA = priorityOrder.indexOf(a.toLowerCase());
        const idxB = priorityOrder.indexOf(b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

    return (
      <div className="property-inspector">
        <div className="property-grid">
          {entries.map(([key, val]) => (
            <div key={key} className="property-row">
              <span className="prop-key">{key}</span>
              <span className="prop-val" title={String(val)}>
                {String(val)}
              </span>
            </div>
          ))}
        </div>

        <div className="raw-json-toggle-container">
          <Button
            size="xs"
            variant="outline-secondary"
            className="btn-toggle-json"
            onClick={this.toggleRawJson}
          >
            <i className={`fas ${this.state.showRawJson ? 'fa-chevron-up' : 'fa-code'} mr-1`} />
            {this.state.showRawJson ? 'Hide Raw JSON' : 'View Raw JSON Inspector'}
          </Button>
        </div>

        {this.state.showRawJson && (
          <div className="raw-json-viewer">
            <ReactJson
              src={properties}
              name={false}
              theme="monokai"
              collapsed={1}
              displayDataTypes={false}
              enableClipboard={true}
              style={{ backgroundColor: '#15181a', padding: '10px', borderRadius: '4px', fontSize: '0.8rem' }}
            />
          </div>
        )}
      </div>
    );
  }

  renderStatistics(stat) {
    if (!stat || Object.keys(stat).length === 0) {
      return <div className="property-empty">No statistics calculated.</div>;
    }

    return (
      <div className="stats-breakdown">
        <div className="stats-total">
          <span className="stat-label">Total Topology Elements</span>
          <span className="stat-count-total">{stat.all || 0}</span>
        </div>
        <div className="stats-grid">
          {Object.entries(stat)
            .filter(([k]) => k !== 'all')
            .map(([kind, count]) => (
              <div key={kind} className="stat-tile">
                <i className={`fas node-icon ${kind}`} style={{ fontSize: '1rem', marginRight: '6px' }}>
                  {IconMap[kind] || '\uf1b2'}
                </i>
                <span className="stat-kind-name">{kind.replace('_', ' ')}</span>
                <Badge variant="secondary" className="stat-badge">{count}</Badge>
              </div>
            ))}
        </div>
      </div>
    );
  }

  render() {
    const nodeData = this.props.nodeData || { kind: '', properties: { name: '' } };
    const rawProps = (nodeData && nodeData.properties) || {};
    const hidden = this.props.hidden;
    const floatRight = this.props.floatRight;
    const timestamp = this.props.timestamp;

    const isAlert = (nodeData.kind || '').toLowerCase() === 'alert' ||
      (nodeData.id && String(nodeData.id).startsWith('alert-'));
    const kind = isAlert ? 'alert' : (nodeData.kind || '').toLowerCase();

    const displayProperties = Object.keys(rawProps).length > 0
      ? rawProps
      : {
          ...(nodeData.severity ? { severity: nodeData.severity } : {}),
          ...(nodeData.name ? { name: nodeData.name } : {}),
          ...(nodeData.namespace ? { namespace: nodeData.namespace } : {}),
          ...(nodeData.message ? { message: nodeData.message } : {})
        };

    const name = (displayProperties && (displayProperties.name || displayProperties.alertname)) ||
      nodeData.name ||
      nodeData.id ||
      'Node Details';

    return (
      <div className={`card node-info-card ${hidden ? 'hidden' : ''} ${floatRight ? 'right' : ''}`}>
        <div className="node-card-header">
          <div className="node-header-icon-wrapper">
            <i className={`fas node-header-icon ${kind}`}>
              {IconMap[kind] || '\uf05a'}
            </i>
          </div>
          <div className="node-header-titles">
            <h5 className="node-header-name" title={name}>{name}</h5>
            <span className={`node-header-kind-badge ${kind}`}>
              {kind.replace('_', ' ')}
            </span>
          </div>
          <button
            type="button"
            className="node-card-close-btn"
            aria-label="Close"
            onClick={this.props.hideDetailCard}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="card-body node-card-body">
          {kind === 'statistics' ? (
            this.renderStatistics(displayProperties)
          ) : (
            <Tabs defaultIndex={0}>
              <TabList className="node-card-tabs">
                <Tab><i className="fa fa-info-circle mr-1" /> Properties</Tab>
                <Tab>
                  <i className="fa fa-brain mr-1" />
                  {isAlert ? 'AI & Analysis' : 'Analysis'}
                </Tab>
              </TabList>

              <TabPanel>
                {this.renderStructuredProperties(displayProperties, kind)}
              </TabPanel>

              <TabPanel className="analysis-panel">
                {isAlert ? (
                  <div className="alert-analysis-flow">
                    <div className="rca-nav-section">
                      <div className="rca-nav-desc">
                        <i className="fas fa-project-diagram mr-1" />
                        <span>Trace Graph Trajectory</span>
                      </div>
                      <Link to={`/rca?source=${nodeData.id}&time_point=${timestamp || Math.floor(Date.now() / 1000)}`}>
                        <Button className="btn-rca" size="sm" variant="outline-warning">
                          <i className="fas fa-search mr-1" /> Inspect RCA Graph
                        </Button>
                      </Link>
                    </div>

                    <div className="divider" />

                    <AiFixSuggestion alertId={nodeData.id} />
                  </div>
                ) : (
                  <div className="non-alert-analysis">
                    <p className="text-muted">
                      Automated root cause analysis and AI fix suggestions are generated for active <strong>Alert</strong> incidents.
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                      To diagnose failures on this <strong>{kind.replace('_', ' ')}</strong>, inspect connected alert badges in the topology graph.
                    </p>
                  </div>
                )}
              </TabPanel>
            </Tabs>
          )}
        </div>
      </div>
    );
  }
}
