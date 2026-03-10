import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { i18n } from 'src/i18n';
import ProjectService from 'src/modules/project/projectService';
import actions from 'src/modules/layout/layoutActions';
import selectors from 'src/modules/layout/layoutSelectors';
import { AppDispatch } from 'src/modules/store';

function ProjectSelect() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedProject = useSelector(selectors.selectSelectedProject);
  const [options, setOptions] = useState<Array<{ id: string; label: string }>>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await ProjectService.listAutocomplete('', 100);
        setOptions(Array.isArray(data) ? data : []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!value) {
      dispatch(actions.doSelectProject(null));
      return;
    }
    const option = options.find((o) => o.id === value);
    dispatch(
      actions.doSelectProject(option ? { id: option.id, label: option.label } : null),
    );
  };

  const value = selectedProject?.id ?? '';

  if (loading) {
    return (
      <select
        style={{ minWidth: '140px', display: 'inline-block' }}
        className="form-control form-control-sm"
        disabled
      >
        <option>{i18n('common.loading')}...</option>
      </select>
    );
  }

  return (
    <select
      style={{ minWidth: '140px', display: 'inline-block' }}
      className="form-control form-control-sm"
      value={value}
      onChange={handleChange}
      aria-label={i18n('entities.project.fields.name')}
    >
      <option value="">All projects</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label ?? opt.id}
        </option>
      ))}
    </select>
  );
}

export default ProjectSelect;
