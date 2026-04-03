import { Component } from "react";

class AuthTipCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tip: "Save your plan once, and RealFitness can show the correct workout every day."
    };
  }

  componentDidMount() {
    this.timeoutId = window.setTimeout(() => {
      this.setState({
        tip: "Google login, planner tasks, and daily photo uploads can all connect to the same React flow."
      });
    }, 1800);
  }

  componentWillUnmount() {
    window.clearTimeout(this.timeoutId);
  }

  render() {
    return (
      <aside className="auth-tip-card">
        <span className="feature-label">React Class Component</span>
        <strong>Presentation Tip</strong>
        <p>{this.state.tip}</p>
      </aside>
    );
  }
}

export default AuthTipCard;
