import { Outlet } from 'react-router-dom';
import StructuredDataLocalBusiness from '../StructuredDataLocalBusiness';
import Navbar from './Navbar';
import Footer from './Footer';
import QuickBookFAB from '../ui/QuickBookFAB';

export default function PublicLayout() {
  return (
    <>
      <StructuredDataLocalBusiness />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="public-shell">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
        <QuickBookFAB />
      </div>
    </>
  );
}
