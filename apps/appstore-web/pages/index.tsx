import dynamic from "next/dynamic";

const Layout = dynamic(() => import("../components/layout"));

const metaTags = {
  title: "Coral App Store",
  description: "Coral AppStore",
  url: "",
};

function Home() {
  return <Layout metaTags={metaTags}></Layout>;
}

export default Home;
