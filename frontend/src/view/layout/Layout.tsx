import { useLocation } from 'react-router-dom';
import Header from 'src/view/layout/Header';
import Menu from 'src/view/layout/Menu';
import LayoutWrapper from 'src/view/layout/styles/LayoutWrapper';

function Layout(props) {
  const location = useLocation();

  return (
    <LayoutWrapper>
      <Menu url={location.pathname} />
      <div className="main">
        <Header />
        <div className="content">{props.children}</div>
      </div>
    </LayoutWrapper>
  );
}

export default Layout;
