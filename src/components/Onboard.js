import React from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import Loader from 'react-loader-spinner';
import { CodeSnippet } from './CodeSnippet';

import './Onboard.scss';

export class Onboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectName: '',
      adminKey: '',
      loading: false,
      error: null,
      project: null,
      traceStatus: 'idle',
      traceNodeCount: 0
    };
    this.pollingInterval = null;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleProjectNameChange = this.handleProjectNameChange.bind(this);
    this.handleAdminKeyChange = this.handleAdminKeyChange.bind(this);
    this.startTracePolling = this.startTracePolling.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  componentWillUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  handleProjectNameChange(e) {
    this.setState({ projectName: e.target.value, error: null });
  }

  handleAdminKeyChange(e) {
    this.setState({ adminKey: e.target.value, error: null });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.state.projectName.trim()) {
      this.setState({ error: 'Please enter a project name.' });
      return;
    }
    if (!this.state.adminKey.trim()) {
      this.setState({ error: 'Please enter the admin key.' });
      return;
    }

    this.setState({ loading: true, error: null });

    axios.post(
      process.env.REACT_APP_BACKEND_HOST + '/v1/admin/projects',
      { name: this.state.projectName.trim() },
      {
        headers: {
          'X-Causa-Admin-Key': this.state.adminKey.trim(),
          'Content-Type': 'application/json'
        }
      }
    )
      .then((response) => {
        if (response.data && response.data.apiKey) {
          localStorage.setItem('causa_api_key', response.data.apiKey);
        }
        this.setState({
          project: response.data,
          loading: false,
          error: null
        }, () => {
          this.startTracePolling();
        });
      })
      .catch((err) => {
        let errorMsg = 'Failed to create project. Please check your connection.';
        if (err.response) {
          if (err.response.status === 401) {
            errorMsg = 'Unauthorized: Invalid or missing admin key.';
          } else if (err.response.status === 400) {
            errorMsg = err.response.data && err.response.data.error
              ? err.response.data.error
              : 'Bad request: Invalid project name.';
          } else {
            errorMsg = 'Server error (' + err.response.status + '). Please try again.';
          }
        }
        this.setState({ loading: false, error: errorMsg });
      });
  }

  startTracePolling() {
    this.setState({ traceStatus: 'polling' });

    this.pollingInterval = setInterval(() => {
      axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/graph')
        .then((response) => {
          const nodeCount = response.data && response.data.nodes
            ? response.data.nodes.length
            : 0;
          if (nodeCount > 0) {
            this.setState({
              traceStatus: 'connected',
              traceNodeCount: nodeCount
            });
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
          }
        })
        .catch(() => {
          // Keep polling silently on errors
        });
    }, 5000);
  }

  resetForm() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.setState({
      projectName: '',
      adminKey: '',
      loading: false,
      error: null,
      project: null,
      traceStatus: 'idle',
      traceNodeCount: 0
    });
  }

  getMavenSnippet() {
    return '<dependency>\n' +
      '    <groupId>com.causa</groupId>\n' +
      '    <artifactId>causa-plugin-java</artifactId>\n' +
      '    <version>1.0.0</version>\n' +
      '</dependency>';
  }

  getPropertiesSnippet() {
    const apiKey = this.state.project ? this.state.project.apiKey : '';
    const serviceName = this.state.project ? this.state.project.name : '';
    return '# CAUSA Telemetry Plugin Configuration\n' +
      'causa.backend.url=http://localhost:5000\n' +
      'causa.api-key=' + apiKey + '\n' +
      'causa.service-name=' + serviceName + '\n' +
      'causa.enabled=true';
  }

  renderForm() {
    return (
      <div className="onboard-card">
        <h4 className="onboard-card-title">Connect your application</h4>
        <p className="onboard-card-subtitle">
          Create a project to get an API key for instrumenting your Spring Boot application with CAUSA.
        </p>
        <form onSubmit={this.handleSubmit}>
          <div className="onboard-field">
            <label htmlFor="projectName">Project name</label>
            <input
              id="projectName"
              type="text"
              className="onboard-input"
              placeholder="e.g. payment-service"
              value={this.state.projectName}
              onChange={this.handleProjectNameChange}
              disabled={this.state.loading}
            />
          </div>
          <div className="onboard-field">
            <label htmlFor="adminKey">Admin key</label>
            <input
              id="adminKey"
              type="password"
              className="onboard-input"
              placeholder="Your X-Causa-Admin-Key"
              value={this.state.adminKey}
              onChange={this.handleAdminKeyChange}
              disabled={this.state.loading}
            />
          </div>
          {this.state.error && (
            <div className="onboard-error">
              <i className="fas fa-exclamation-circle" /> {this.state.error}
            </div>
          )}
          <Button
            type="submit"
            variant="outline-warning"
            className="onboard-submit"
            disabled={this.state.loading}
          >
            {this.state.loading
              ? <span><Loader type="TailSpin" color="#ffa500" height={16} width={16} /> Creating...</span>
              : 'Create project'
            }
          </Button>
        </form>
      </div>
    );
  }

  renderResults() {
    const project = this.state.project;
    return (
      <div className="onboard-results">
        <div className="onboard-success-banner">
          <i className="fas fa-check-circle" />
          <span>Project <strong>{project.name}</strong> created successfully</span>
          <button className="onboard-reset" onClick={this.resetForm}>
            <i className="fas fa-plus" /> New project
          </button>
        </div>

        <div className="onboard-step">
          <div className="onboard-step-number">1</div>
          <div className="onboard-step-content">
            <CodeSnippet
              title="Your API Key"
              code={project.apiKey}
            />
          </div>
        </div>

        <div className="onboard-step">
          <div className="onboard-step-number">2</div>
          <div className="onboard-step-content">
            <p className="onboard-step-instruction">
              Add this dependency to your <code>pom.xml</code>:
            </p>
            <CodeSnippet
              title="Maven dependency"
              code={this.getMavenSnippet()}
            />
          </div>
        </div>

        <div className="onboard-step">
          <div className="onboard-step-number">3</div>
          <div className="onboard-step-content">
            <p className="onboard-step-instruction">
              Add these lines to your <code>application.properties</code>:
            </p>
            <CodeSnippet
              title="application.properties"
              code={this.getPropertiesSnippet()}
            />
          </div>
        </div>

        <div className="onboard-step">
          <div className="onboard-step-number">4</div>
          <div className="onboard-step-content">
            {this.renderTraceStatus()}
          </div>
        </div>
      </div>
    );
  }

  renderTraceStatus() {
    if (this.state.traceStatus === 'connected') {
      return (
        <div className="onboard-trace-status connected">
          <div className="onboard-trace-icon">
            <i className="fas fa-check-circle" />
          </div>
          <div className="onboard-trace-info">
            <strong>Traces received</strong>
            <span>{this.state.traceNodeCount} topology nodes detected.</span>
          </div>
          <a href="/graph" className="btn btn-outline-warning btn-sm">
            View topology <i className="fas fa-arrow-right" />
          </a>
        </div>
      );
    }

    return (
      <div className="onboard-trace-status polling">
        <div className="onboard-trace-icon">
          <Loader type="TailSpin" color="#ffa500" height={24} width={24} />
        </div>
        <div className="onboard-trace-info">
          <strong>Waiting for traces...</strong>
          <span>Start your application. This will update automatically when traces arrive.</span>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="onboard-container">
        {this.state.project ? this.renderResults() : this.renderForm()}
      </div>
    );
  }
}
