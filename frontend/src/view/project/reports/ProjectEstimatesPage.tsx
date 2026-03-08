import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import ProjectService from 'src/modules/project/projectService';
import TaskService from 'src/modules/task/taskService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';

ChartJS.register(ArcElement, Tooltip, Legend);

type AggregateEstimates = {
  architect: number;
  developer: number;
  tester: number;
  businessAnalyst: number;
  ux: number;
  pm: number;
};

const ROLES: { key: keyof AggregateEstimates; label: string }[] = [
  { key: 'architect', label: 'Architect' },
  { key: 'developer', label: 'Developer' },
  { key: 'tester', label: 'Tester' },
  { key: 'businessAnalyst', label: 'Business Analyst' },
  { key: 'ux', label: 'UX' },
  { key: 'pm', label: 'PM' },
];

const CHART_COLORS = [
  '#36A2EB',
  '#FF6384',
  '#4BC0C0',
  '#FFCE56',
  '#9966FF',
  '#FF9F40',
];

const ProjectEstimatesPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<{ id: string; name?: string } | null>(null);
  const [estimates, setEstimates] = useState<AggregateEstimates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const [projectData, estimatesData] = await Promise.all([
        ProjectService.find(projectId),
        TaskService.getAggregateEstimates(projectId),
      ]);
      setProject(projectData);
      setEstimates(estimatesData as AggregateEstimates);
    } catch (e) {
      Errors.handle(e);
      setError((e as Error)?.message ?? 'Failed to load report');
      setProject(null);
      setEstimates(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = useMemo(() => {
    if (!estimates) return null;
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];
    ROLES.forEach((r, i) => {
      const v = estimates[r.key];
      if (v != null && v > 0) {
        labels.push(r.label);
        data.push(v);
        backgroundColor.push(CHART_COLORS[i % CHART_COLORS.length]);
      }
    });
    if (data.length === 0) return null;
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          hoverBackgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  }, [estimates]);

  const totalHours = useMemo(() => {
    if (!estimates) return 0;
    return ROLES.reduce((sum, r) => sum + (estimates[r.key] ?? 0), 0);
  }, [estimates]);

  if (loading || !projectId) {
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    );
  }

  if (error || !project) {
    return (
      <ContentWrapper>
        <p className="text-danger">{error ?? i18n('common.noDataToExport')}</p>
        <Link to="/project" className="btn btn-light btn-sm mt-2">
          {i18n('common.back')}
        </Link>
      </ContentWrapper>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.project.menu'), '/project'],
          [project.name || projectId, `/project/${projectId}`],
          ['Estimates report'],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          Estimates report — {project.name || projectId}
        </PageTitle>

        <div className="mb-3">
          <Link
            to={`/project-planner/${projectId}/estimate`}
            className="btn btn-outline-secondary btn-sm me-2"
          >
            <i className="fas fa-table me-1" />
            Time plan
          </Link>
          <Link to={`/project/${projectId}`} className="btn btn-light btn-sm">
            <i className="fas fa-arrow-left me-1" />
            {i18n('common.view')} {i18n('entities.project.menu')}
          </Link>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Total estimated hours by role</h5>
              </div>
              <div className="card-body">
                <table className="table table-sm table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th className="text-end">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES.map((r) => (
                      <tr key={r.key}>
                        <td>{r.label}</td>
                        <td className="text-end">
                          {estimates ? (estimates[r.key] ?? 0) : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="fw-bold">
                      <td>Total</td>
                      <td className="text-end">{totalHours}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Distribution</h5>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center">
                {chartData && chartData.datasets[0].data.length > 0 ? (
                  <div style={{ maxWidth: 320, margin: '0 auto' }}>
                    <Doughnut
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { position: 'bottom' },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => {
                                const total = (ctx.dataset.data as number[]).reduce(
                                  (a, b) => a + b,
                                  0,
                                );
                                const pct = total
                                  ? ((ctx.raw as number) / total * 100).toFixed(1)
                                  : '0';
                                return `${ctx.label}: ${ctx.raw} h (${pct}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-muted mb-0">No estimate data to display.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default ProjectEstimatesPage;
