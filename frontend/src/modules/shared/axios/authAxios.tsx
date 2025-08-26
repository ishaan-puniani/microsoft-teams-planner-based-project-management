import Axios from 'axios';
import moment from 'moment';
import Qs from 'qs';
import config from 'src/config';
import { getLanguageCode } from 'src/i18n';
import { AuthToken } from 'src/modules/auth/authToken';

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

    return options;
  },
  function (error) {
    console.log('Request error: ', error);
    return Promise.reject(error);
  },
);

export default authAxios;
