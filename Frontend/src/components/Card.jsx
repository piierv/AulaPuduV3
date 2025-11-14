// src/components/Card.jsx
export default function Card({ title, children, accent, footer }) {
  return (
    <div className={`ap-card ${accent ? `ap-card--${accent}` : ""}`}>
      {title && <h3 className="ap-card-title">{title}</h3>}
      <div className="ap-card-body">{children}</div>
      {footer && <div className="ap-card-footer">{footer}</div>}
    </div>
  );
}
