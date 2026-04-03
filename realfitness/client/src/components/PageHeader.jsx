import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function PageHeader({ eyebrow, title, description, actionLabel, actionTo, actionClassName = "ghost-link" }) {
  return (
    <div className="page-header">
      <div>
        <p className="preview-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p className="page-header__copy">{description}</p> : null}
      </div>
      {actionLabel && actionTo ? (
        <Link className={actionClassName} to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

PageHeader.propTypes = {
  actionClassName: PropTypes.string,
  actionLabel: PropTypes.string,
  actionTo: PropTypes.string,
  description: PropTypes.string,
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

PageHeader.defaultProps = {
  actionClassName: "ghost-link",
  actionLabel: "",
  actionTo: "",
  description: ""
};

export default PageHeader;
