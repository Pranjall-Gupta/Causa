import React from 'react';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import { Button, Badge } from 'react-bootstrap';

import './AiFixSuggestion.scss';

export class AiFixSuggestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      suggestion: null,
      error: null
    };
    this.fetchSuggestion = this.fetchSuggestion.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.alertId !== this.props.alertId) {
      this.setState({
        suggestion: null,
        error: null,
        loading: false
      });
    }
  }

  fetchSuggestion() {
    const alertId = this.props.alertId;
    if (!alertId) return;

    this.setState({ loading: true, error: null });

    const payload = {
      symptomAlertId: alertId,
      trajectoryScore: this.props.trajectoryScore || null,
      trajectory: this.props.trajectory || null
    };

    const headers = {
      'Content-Type': 'application/json'
    };
    const storedApiKey = localStorage.getItem('causa_api_key') || process.env.REACT_APP_CAUSA_API_KEY;
    if (storedApiKey) {
      headers['X-Causa-Api-Key'] = storedApiKey;
    }

    axios.post(process.env.REACT_APP_BACKEND_HOST + '/v1/fix-suggestion', payload, { headers })
      .then((response) => {
        this.setState({
          suggestion: response.data,
          loading: false,
          error: null
        });
      })
      .catch((err) => {
        console.error('Error fetching fix suggestion:', err);
        let errorMsg = 'Failed to generate fix suggestion. Check backend connection.';
        if (err.response && err.response.data && err.response.data.error) {
          errorMsg = err.response.data.error;
        }
        this.setState({
          loading: false,
          error: errorMsg
        });
      });
  }

  renderConfidenceBadge(confidence) {
    const level = (confidence || 'MEDIUM').toUpperCase();
    let variant = 'warning';
    if (level === 'HIGH') variant = 'success';
    else if (level === 'LOW') variant = 'danger';

    return (
      <Badge variant={variant} className="confidence-badge">
        Confidence: {level}
      </Badge>
    );
  }

  render() {
    const { alertId } = this.props;
    const { loading, suggestion, error } = this.state;

    if (!alertId) {
      return (
        <div className="ai-fix-empty">
          <p>Select an active incident alert to generate AI remediation.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="ai-fix-loading">
          <Loader type="TailSpin" color="#ffa500" height={32} width={32} />
          <div className="ai-loading-text">
            <strong>Analyzing Failure Context</strong>
            <span>Querying Azure AI Foundry for root-cause diagnosis and remediation plan...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ai-fix-error">
          <div className="error-msg">
            <i className="fas fa-exclamation-triangle" /> {error}
          </div>
          <Button size="sm" variant="outline-danger" onClick={this.fetchSuggestion}>
            Retry Diagnosis
          </Button>
        </div>
      );
    }

    if (!suggestion) {
      return (
        <div className="ai-fix-prompt">
          <div className="ai-prompt-desc">
            <i className="fas fa-brain ai-icon" />
            <div>
              <strong>AI Root Cause Diagnosis & Remedy</strong>
              <p>Generate on-demand automated fix suggestions powered by Azure AI Foundry.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline-warning"
            className="btn-generate-ai"
            onClick={this.fetchSuggestion}
          >
            <i className="fas fa-magic mr-1" /> Generate AI Remedy
          </Button>
        </div>
      );
    }

    return (
      <div className="ai-fix-result">
        <div className="ai-result-header">
          <div className="provider-info">
            <i className="fas fa-robot mr-1" />
            <span className="provider-name">{suggestion.provider || 'Azure AI Foundry'}</span>
          </div>
          {this.renderConfidenceBadge(suggestion.confidence)}
        </div>

        <div className="ai-summary-card">
          <div className="summary-title">
            <i className="fas fa-search-plus mr-1" /> Incident Diagnosis
          </div>
          <p className="summary-text">{suggestion.summary}</p>
        </div>

        <div className="ai-remedy-card">
          <div className="remedy-title">
            <i className="fas fa-tools mr-1" /> Recommended Action Plan
          </div>
          <div className="remedy-steps">
            {suggestion.suggestedFix ? (
              suggestion.suggestedFix.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                return (
                  <div key={idx} className="remedy-step-line">
                    {trimmed}
                  </div>
                );
              })
            ) : (
              <p>No specific remediation plan provided.</p>
            )}
          </div>
        </div>

        <div className="ai-result-footer">
          <Button
            size="xs"
            variant="outline-secondary"
            className="btn-refresh-ai"
            onClick={this.fetchSuggestion}
          >
            <i className="fas fa-sync-alt mr-1" /> Re-analyze
          </Button>
        </div>
      </div>
    );
  }
}
