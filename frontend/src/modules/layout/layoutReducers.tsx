import { getLanguageCode } from 'src/i18n';
import actions from 'src/modules/layout/layoutActions';

const LAYOUT_SELECTED_PROJECT_KEY = 'layout.selectedProject';

function getInitialSelectedProject() {
  try {
    const stored = localStorage.getItem(LAYOUT_SELECTED_PROJECT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed.id === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

const initialData = {
  menuVisible: true,
  language: getLanguageCode(),
  loading: false,
  selectedProject: getInitialSelectedProject(),
};

export default (state = initialData, { type, payload }) => {
  if (type === actions.MENU_TOGGLE) {
    return {
      ...state,
      menuVisible: !state.menuVisible,
    };
  }

  if (type === actions.MENU_SHOW) {
    return {
      ...state,
      menuVisible: true,
    };
  }

  if (type === actions.MENU_HIDE) {
    return {
      ...state,
      menuVisible: false,
    };
  }

  if (type === actions.SELECT_PROJECT) {
    try {
      if (payload) {
        localStorage.setItem(
          LAYOUT_SELECTED_PROJECT_KEY,
          JSON.stringify(payload),
        );
      } else {
        localStorage.removeItem(LAYOUT_SELECTED_PROJECT_KEY);
      }
    } catch {
      // ignore localStorage errors
    }
    return {
      ...state,
      selectedProject: payload,
    };
  }

  return state;
};
