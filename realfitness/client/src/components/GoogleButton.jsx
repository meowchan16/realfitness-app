import PropTypes from "prop-types";

function GoogleButton({ isLoading, label, loadingLabel, onClick }) {
  return (
    <button className="google-btn" type="button" onClick={onClick} disabled={isLoading}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.5-5.5 3.5-3.3 0-6.1-2.8-6.1-6.3S8.7 5 12 5c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.4 14.7 1.5 12 1.5 6.8 1.5 2.5 5.7 2.5 11s4.3 9.5 9.5 9.5c5.5 0 9.2-3.8 9.2-9.1 0-.6-.1-1-.2-1.3H12Z"
        />
        <path
          fill="#34A853"
          d="M3.6 16.6l3.1-2.4c.8 1.6 2.5 2.7 5.3 2.7 4.1 0 5.3-2.3 5.5-3.5H12v-3.2h9c.1.3.2.7.2 1.3 0 5.3-3.7 9.1-9.2 9.1-3.8 0-7-2.1-8.4-4Z"
        />
        <path
          fill="#4A90E2"
          d="M21 10.2h-9v3.2h5.5c-.3 1.4-1.8 3.5-5.5 3.5-2.8 0-4.5-1.1-5.3-2.7l-3.1 2.4c1.4 2 4.6 4 8.4 4 5.5 0 9.2-3.8 9.2-9.1 0-.6-.1-1-.2-1.3Z"
        />
        <path
          fill="#FBBC05"
          d="M3.9 7.8A5.9 5.9 0 0 0 3.4 11c0 1.1.2 2.1.5 3.1l3.1-2.4a5.5 5.5 0 0 1-.3-1.8c0-.6.1-1.2.3-1.8L3.9 7.8Z"
        />
      </svg>
      {isLoading ? loadingLabel : label}
    </button>
  );
}

GoogleButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  label: PropTypes.string,
  loadingLabel: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

GoogleButton.defaultProps = {
  label: "Continue with Google",
  loadingLabel: "Connecting..."
};

export default GoogleButton;
