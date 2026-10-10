import React from 'react';

import './CodeSnippet.scss';

export class CodeSnippet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false
    };
    this.handleCopy = this.handleCopy.bind(this);
  }

  handleCopy() {
    const textArea = document.createElement('textarea');
    textArea.value = this.props.code;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  }

  render() {
    return (
      <div className="code-snippet">
        <div className="code-snippet-header">
          <span className="code-snippet-title">{this.props.title}</span>
          <button
            className={`code-snippet-copy ${this.state.copied ? 'copied' : ''}`}
            onClick={this.handleCopy}
          >
            <i className={`fas ${this.state.copied ? 'fa-check' : 'fa-copy'}`} />
            {this.state.copied ? ' Copied!' : ' Copy'}
          </button>
        </div>
        <pre className="code-snippet-body">
          <code>{this.props.code}</code>
        </pre>
      </div>
    );
  }
}
