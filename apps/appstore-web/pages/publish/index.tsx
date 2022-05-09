import dynamic from "next/dynamic";

const Layout = dynamic(() => import("../../components/layout"));
const PublishComponent = dynamic(() => import("../../components/publish"));

const metaTags = {
  title: "Coral App Store",
  description: "Coral AppStore",
  url: "",
};

function Publish() {
  return (
    <Layout metaTags={metaTags}>
      <PublishComponent />
    </Layout>
  );
}

export default Publish;
