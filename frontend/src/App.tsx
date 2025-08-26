import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap';
import jQuery from 'jquery';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from 'src/modules/store';
import NavigateSetter from 'src/NavigateSetter';
import RoutesComponent from 'src/view/shared/routes/RoutesComponent';

(window as any).$ = (window as any).jQuery = jQuery;
const store = configureStore();
const App = (props) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <NavigateSetter />
        <RoutesComponent />
      </BrowserRouter>
    </Provider>
  );
};
export default App;
