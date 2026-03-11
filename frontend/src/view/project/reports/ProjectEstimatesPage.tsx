import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import ProjectService from 'src/modules/project/projectService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import EstimatesByType from './components/EstimatesByType';

const ProjectEstimatesPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<{ id: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const [projectData] = await Promise.all([
        ProjectService.find(projectId),
      ]);
      setProject(projectData);
    } catch (e) {
      Errors.handle(e);
      setError((e as Error)?.message ?? 'Failed to load report');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
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

        <div className="row g-3">
          <EstimatesByType
            projectId={projectId}
            type="EPIC"
            title="Estimates By Epics"
            layout="side-by-side"
          />
          <EstimatesByType
            projectId={projectId}
            type="USER_STORY"
            title="Estimates By Stories"
            layout="side-by-side"
          />
          <EstimatesByType
            projectId={projectId}
            type="TASK"
            title="Total estimated hours by role"
            layout="side-by-side"
          />
        </div>
      </ContentWrapper>
    </>
  );
};

export default ProjectEstimatesPage;
