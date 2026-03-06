import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import ProjectService from 'src/modules/project/projectService';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import ButtonIcon from 'src/view/shared/ButtonIcon';

const ProjectPlannerAgentPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<{ id: string; name?: string } | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [projectBrief, setProjectBrief] = useState('');
  const [wizardContent, setWizardContent] = useState('');
  const [wizardFeedback, setWizardFeedback] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingProject(true);
      const data = await ProjectService.find(projectId);
      setProject(data);
    } catch (e) {
      Errors.handle(e);
      setProject(null);
    } finally {
      setLoadingProject(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleWizardGenerate = async () => {
    setChatError(null);
    setChatLoading(true);
    try {
      const step =
        wizardStep === 1 ? 'epics' : wizardStep === 2 ? 'user_stories' : 'tasks';
      const data = await AiAgentService.refinePlannerStep(step, projectBrief, {
        currentStructuredText: wizardStep === 1 ? '' : wizardContent,
        userFeedback: wizardFeedback || undefined,
      });
      setWizardContent(data.structuredText || '');
      setWizardFeedback('');
    } catch (e: any) {
      Errors.handle(e);
      setChatError(e?.message || 'Request failed');
    } finally {
      setChatLoading(false);
    }
  };

  const handleWizardContinue = () => {
    if (wizardStep < 3) setWizardStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) setWizardStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleApplyToEditor = () => {
    if (!projectId || !wizardContent) return;
    navigate(`/project-planner/${projectId}`, {
      state: { bulkText: wizardContent },
    });
  };

  const handleWizardStartOver = () => {
    setWizardStep(1);
    setWizardContent('');
    setWizardFeedback('');
  };

  if (loadingProject || !projectId) {
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
          [i18n('common.planner'), `/project-planner/${projectId}`],
          'AI Assistant',
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          AI Assistant — {project.name || projectId}
        </PageTitle>

        <div className="mb-3">
          <Link
            to={`/project-planner/${projectId}`}
            className="btn btn-light btn-sm me-2"
          >
            <i className="fas fa-arrow-left me-1" />
            Back to Planner
          </Link>
          <Link to={`/project/${projectId}`} className="btn btn-outline-secondary btn-sm">
            {i18n('common.view')} {i18n('entities.project.menu')}
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-robot me-2" />
              Generate requirements (Epics → User Stories → Tasks)
            </h5>
          </div>
          <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className={`badge ${wizardStep >= 1 ? 'bg-primary' : 'bg-secondary'}`}>
                1. Epics
              </span>
              <span className="text-muted">→</span>
              <span className={`badge ${wizardStep >= 2 ? 'bg-primary' : 'bg-secondary'}`}>
                2. User Stories + AC
              </span>
              <span className="text-muted">→</span>
              <span className={`badge ${wizardStep >= 3 ? 'bg-primary' : 'bg-secondary'}`}>
                3. Tasks + TODO
              </span>
            </div>

            {wizardStep === 1 && (
              <>
                <label className="form-label small">Project description</label>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  placeholder="e.g. E-commerce app with login, product catalog, cart and checkout."
                  disabled={chatLoading}
                />
              </>
            )}

            {(wizardStep === 2 || wizardStep === 3) && (
              <p className="text-muted small mb-2">
                Brief: {projectBrief.slice(0, 80)}{projectBrief.length > 80 ? '…' : ''}
              </p>
            )}

            <label className="form-label small">
              {wizardStep === 1
                ? 'Epics (editable after generate)'
                : wizardStep === 2
                  ? 'Epics + User Stories with AC'
                  : 'Full backlog (Epics + Stories + Tasks + TODO)'}
            </label>
            <textarea
              className="form-control font-monospace small mb-2"
              rows={wizardStep === 1 ? 8 : 14}
              value={wizardContent}
              onChange={(e) => setWizardContent(e.target.value)}
              placeholder={
                wizardStep === 1
                  ? 'Click "Generate Epics" to get a list of epics.'
                  : wizardStep === 2
                    ? 'Click "Generate User Stories" to add stories and AC per epic.'
                    : 'Click "Generate Tasks" to add tasks and TODO lists.'
              }
              disabled={chatLoading}
            />

            {(wizardContent || wizardStep > 1) && (
              <div className="mb-2">
                <label className="form-label small text-muted">
                  Optional: Refine (e.g. "remove X", "add Y")
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={wizardFeedback}
                  onChange={(e) => setWizardFeedback(e.target.value)}
                  placeholder="e.g. Remove Payment epic. Add Analytics epic."
                  disabled={chatLoading}
                />
              </div>
            )}

            {chatError && (
              <div className="alert alert-danger py-2 small mb-2">{chatError}</div>
            )}

            <div className="d-flex flex-wrap align-items-center gap-2">
              {wizardStep === 1 && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={chatLoading || !projectBrief.trim()}
                  onClick={handleWizardGenerate}
                >
                  <ButtonIcon loading={chatLoading} iconClass="fas fa-magic" />
                  Generate Epics
                </button>
              )}
              {wizardStep === 2 && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleWizardBack}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={chatLoading || !wizardContent.trim()}
                    onClick={handleWizardGenerate}
                  >
                    <ButtonIcon loading={chatLoading} iconClass="fas fa-magic" />
                    Generate User Stories
                  </button>
                </>
              )}
              {wizardStep === 3 && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleWizardBack}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={chatLoading || !wizardContent.trim()}
                    onClick={handleWizardGenerate}
                  >
                    <ButtonIcon loading={chatLoading} iconClass="fas fa-magic" />
                    Generate Tasks
                  </button>
                </>
              )}

              {wizardStep === 1 && wizardContent && (
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  disabled={chatLoading}
                  onClick={handleWizardContinue}
                >
                  Continue to User Stories →
                </button>
              )}
              {wizardStep === 2 && wizardContent && (
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  disabled={chatLoading}
                  onClick={handleWizardContinue}
                >
                  Continue to Tasks →
                </button>
              )}
              {wizardStep === 3 && wizardContent && (
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleApplyToEditor}
                >
                  <i className="fas fa-check me-1" />
                  Apply to editor
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleWizardStartOver}
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default ProjectPlannerAgentPage;
