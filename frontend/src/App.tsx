import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap';
// import jQuery from 'jquery';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from 'src/modules/store';
import NavigateSetter from 'src/NavigateSetter';
import RefetchOnProjectChange from 'src/view/layout/RefetchOnProjectChange';
import RoutesComponent from 'src/view/shared/routes/RoutesComponent';

// (window as any).$ = (window as any).jQuery = jQuery;
const store = configureStore();
const App = (props) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <NavigateSetter />
        <RefetchOnProjectChange>
          <RoutesComponent />
        </RefetchOnProjectChange>
      </BrowserRouter>
    </Provider>
  );
};
export default App;
