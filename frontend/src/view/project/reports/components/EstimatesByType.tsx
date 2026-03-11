import React from 'react';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Spinner from 'src/view/shared/Spinner';
import EstimatesGrid from './EstimatesGrid';
import EstimatesDoughnutChart from './EstimatesDoughnutChart';
import ReportSection from './ReportSection';
import { useAggregateEstimates } from './useAggregateEstimates';

type Props = {
  projectId: string | undefined;
  type: string;
  /** Section title (e.g. "Estimates By Epics") */
  title?: string;
  /** Layout: 'table-only' | 'chart-only' | 'side-by-side' (default) */
  layout?: 'table-only' | 'chart-only' | 'side-by-side';
};

const EstimatesByType = ({
  projectId,
  type,
  title,
  layout = 'side-by-side',
}: Props) => {
  const { estimates, loading, error } = useAggregateEstimates(projectId, type);

  if (loading || !projectId) {
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ReportSection title={title} card>
        <p className="text-danger mb-0">{error}</p>
      </ReportSection>
    );
  }

  if (layout === 'table-only') {
    return (
      <div className="col-md-6">
        <ReportSection card cardHeader={title}>
          <EstimatesGrid estimates={estimates} />
        </ReportSection>
      </div>
    );
  }

  if (layout === 'chart-only') {
    return (
      <div className="col-md-6">
        <ReportSection card cardHeader={title}>
          <div className="d-flex align-items-center justify-content-center">
            <EstimatesDoughnutChart estimates={estimates} />
          </div>
        </ReportSection>
      </div>
    );
  }

  return (
    <div className="col-12 mb-4">
      {title && <h5 className="mb-2">{title}</h5>}
      <div className="row g-3">
        <div className="col-md-6">
          <ReportSection card cardHeader="Hours by role">
            <EstimatesGrid estimates={estimates} />
          </ReportSection>
        </div>
        <div className="col-md-6">
          <ReportSection card cardHeader="Distribution">
            <div className="d-flex align-items-center justify-content-center">
              <EstimatesDoughnutChart estimates={estimates} />
            </div>
          </ReportSection>
        </div>
      </div>
    </div>
  );
};

export default EstimatesByType;
