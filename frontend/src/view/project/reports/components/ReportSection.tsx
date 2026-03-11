import React from 'react';

type Props = {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** If true, wrap content in a card with card-body */
  card?: boolean;
  /** Optional card header (only used when card is true) */
  cardHeader?: React.ReactNode;
};

const ReportSection = ({
  title,
  children,
  className = '',
  card = false,
  cardHeader,
}: Props) => {
  const content = card ? (
    <div className="card">
      {(title || cardHeader) && (
        <div className="card-header">
          {cardHeader ?? title}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  ) : (
    <>
      {title && <h5 className="mb-2">{title}</h5>}
      {children}
    </>
  );

  return <div className={className}>{content}</div>;
};

export default ReportSection;
