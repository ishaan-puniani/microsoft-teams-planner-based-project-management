import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import ProjectService from 'src/modules/project/projectService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import ProjectTimePlanExcel from 'src/view/project/planner/planView/ProjectTimePlanExcel';

const ProjectEstimatePlannerPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<{ id: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await ProjectService.find(projectId);
      setProject(data);
    } catch (e) {
      Errors.handle(e);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (loading || !projectId) {
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    );
  }

  if (!project) {
    return (
      <ContentWrapper>
        <p>{i18n('common.noDataToExport')}</p>
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
          [i18n('common.planner')],
          ['Estimate / Time plan'],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('common.planner')} — Estimate / Time plan — {project.name || projectId}
        </PageTitle>

        <div className="mb-3">
          <Link to={`/project-planner/${projectId}/estimates-report`} className="btn btn-outline-secondary btn-sm me-2">
            <i className="fas fa-chart-pie me-1" />
            Estimates report
          </Link>
          <Link to={`/project-planner/${projectId}`} className="btn btn-outline-secondary btn-sm me-2">
            <i className="fas fa-list-check me-1" />
            Structured planner
          </Link>
          <Link to={`/project-planner/${projectId}/agent`} className="btn btn-outline-primary btn-sm me-2">
            <i className="fas fa-robot me-1" />
            Generate with AI
          </Link>
          <Link to={`/project/${projectId}`} className="btn btn-light btn-sm">
            <i className="fas fa-arrow-left me-1" />
            {i18n('common.view')} {i18n('entities.project.menu')}
          </Link>
        </div>

        <ProjectTimePlanExcel projectId={projectId} />
      </ContentWrapper>
    </>
  );
};

export default ProjectEstimatePlannerPage;
