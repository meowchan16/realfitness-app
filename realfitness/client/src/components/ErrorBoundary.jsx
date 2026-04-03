import { Component } from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      message: ""
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Something went wrong while rendering the page."
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-shell">
          <div className="error-card">
            <p className="preview-kicker">Render Error</p>
            <h1>The page hit a React error.</h1>
            <p>{this.state.message}</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
