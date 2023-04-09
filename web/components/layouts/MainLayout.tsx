import Newsletter from '../Newsletter';
import Footer from '../common/Footer';
import Header from '../common/Header';

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="mb-20 flex flex-col gap-10">{children}</main>
      <Newsletter />
      <Footer />
    </>
  );
};

export default MainLayout;
