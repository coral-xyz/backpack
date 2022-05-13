import dynamic from 'next/dynamic';

const PublishComponent = dynamic(() => import('../../components/publish'));

function Publish() {
  return <PublishComponent />;
}

export default Publish;
