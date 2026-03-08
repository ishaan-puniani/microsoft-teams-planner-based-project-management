import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';

interface PlanCreatedBy {
  user?: { displayName?: string | null; id?: string };
  application?: { displayName?: string | null; id?: string };
}

interface PlanContainer {
  containerId?: string;
  type?: string;
  url?: string;
}

interface PlanDetails {
  id?: string;
  sharedWith?: Record<string, boolean>;
  categoryDescriptions?: Record<string, string>;
}

interface BucketRecord {
  id?: string;
  name?: string;
  planId?: string;
  orderHint?: string;
}

interface PlanRecord {
  id?: string;
  title?: string;
  name?: string;
  createdDateTime?: string;
  owner?: string;
  createdBy?: PlanCreatedBy;
  container?: PlanContainer;
  details?: PlanDetails;
  categories?: Record<string, string>;
  buckets?: BucketRecord[];
}

interface GraphUser {
  id: string;
  displayName?: string | null;
  mail?: string | null;
  userPrincipalName?: string | null;
}

const MSPlannerDetailsPage = () => {
  const { id: planId } = useParams();
  const [record, setRecord] = useState<PlanRecord | null>(null);
  const [users, setUsers] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    const doFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const [planData, usersData] = await Promise.all([
          MsPlannerService.getPlan(planId),
          MsPlannerService.getUsers(),
        ]);
        setRecord(planData);
        setUsers(usersData || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [planId]);

  const userById = useMemo(() => {
    const map: Record<string, GraphUser> = {};
    (users || []).forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          items={[
            ['Dashboard', '/'],
            ['MS Planner', '/msplanner/plan/' + planId],
            ['Plan details'],
          ]}
        />
        <ContentWrapper>
          <PageTitle>MS Planner – Plan</PageTitle>
          <div className="text-danger">{error}</div>
        </ContentWrapper>
      </>
    );
  }

  if (!record) {
    return null;
  }

  const title = record.title ?? record.name ?? 'Plan';

  return (
    <>
      <Breadcrumb
        items={[
          ['Dashboard', '/'],
          ['MS Planner', '/msplanner/plan/' + planId],
          [title],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {title}
          <Link
            className="btn btn-sm btn-primary ml-2"
            to={`/msplanner/tasks/${planId}`}
          >
            View tasks
          </Link>
        </PageTitle>

        <ViewWrapper>
          <TextViewItem label="Plan" value={title} />
          <TextViewItem label="Plan ID" value={record.id} />
          <TextViewItem
            label="Created"
            value={
              record.createdDateTime
                ? new Date(record.createdDateTime).toLocaleString()
                : undefined
            }
          />
          <TextViewItem label="Owner" value={record.owner} />
          {record.container && (
            <>
              <TextViewItem label="Container type" value={record.container.type} />
              {record.container.url && (
                <div className="form-group">
                  <label className="col-form-label">Container</label>
                  <div className="form-control-plaintext">
                    <a
                      href={record.container.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {record.container.containerId}
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {record.details?.sharedWith && Object.keys(record.details.sharedWith).length > 0 && (
            <div className="form-group">
              <label className="control-label">Shared with</label>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email / UPN</th>
                      <th>Display name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(record.details.sharedWith).map((principalId) => {
                      const u = userById[principalId];
                      const email = u?.mail || u?.userPrincipalName || '—';
                      const displayName = u?.displayName ?? '—';
                      return (
                        <tr key={principalId}>
                          <td>
                            <code className="small">{principalId}</code>
                          </td>
                          <td>{email}</td>
                          <td>{displayName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {record.categories && Object.keys(record.categories).length > 0 && (
            <div className="form-group">
              <label className="control-label">Categories</label>
              <ul className="list-unstyled mb-0">
                {Object.entries(record.categories)
                  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                  .map(([key, label]) => (
                    <li key={key} className="mb-1">
                      <span className="badge badge-secondary mr-2">{key}</span>
                      {label}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {record.buckets && record.buckets.length > 0 && (
            <div className="form-group">
              <label className="control-label">Buckets</label>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Bucket ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.buckets.map((b) => (
                      <tr key={b.id ?? ''}>
                        <td>{b.name ?? '—'}</td>
                        <td>
                          <code className="small">{b.id ?? '—'}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ViewWrapper>
      </ContentWrapper>
    </>
  );
};

export default MSPlannerDetailsPage;
