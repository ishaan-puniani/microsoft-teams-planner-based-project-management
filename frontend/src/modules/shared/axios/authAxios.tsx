import Axios from 'axios';
import moment from 'moment';
import Qs from 'qs';
import config from 'src/config';
import { getLanguageCode } from 'src/i18n';
import { AuthToken } from 'src/modules/auth/authToken';

const LAYOUT_SELECTED_PROJECT_KEY = 'layout.selectedProject';

function getSelectedProjectId() {
  try {
    const stored = localStorage.getItem(LAYOUT_SELECTED_PROJECT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed.id === 'string' ? parsed.id : null;
  } catch {
    return null;
  }
}

const authAxios = Axios.create({
  baseURL: config.backendUrl,
  paramsSerializer: function (params) {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      filter: (prefix, value) => {
        if (
          moment.isMoment(value) ||
          value instanceof Date
        ) {
          return value.toISOString();
        }

        return value;
      },
    });
  },
});

authAxios.interceptors.request.use(
  async function (options) {
    const token = AuthToken.get();

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    options.headers['Accept-Language'] = getLanguageCode();

    const projectId = getSelectedProjectId();
    if (projectId) {
      options.headers['projectId'] = projectId;
    }

    return options;
  },
  function (error) {
    console.log('Request error: ', error);
    return Promise.reject(error);
  },
);

export default authAxios;
